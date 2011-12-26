---
layout: post
title: Real-time Web Apps with Django and WebSockets
tags:
- django
- websockets
- socket.io
---
I recently took part in [Django Dash](http://djangodash.com), the annual
hackathon where teams of up to three compete to build the best
[Django](http://djangoproject.com) project they can within 48 hours. This year
I worked with [Travis White](http://www.traviswhite.com.au/) and [Josh de
Blank](http://joshdeblank.com/) to build [DrawnBy](http://drawnby.jupo.org) -
a collaborative drawing application that allows people to sketch together in
real-time.

DrawnBy makes extensive use of
[WebSockets](http://en.wikipedia.org/wiki/WebSockets) which are mostly unheard
of in web stacks like Django and Rails, or even antiquated stacks like PHP and
ASP.NET, which are all designed around accepting a request and returning a
response to the browser as quickly as possible. This is in contrast to
WebSockets which allow full duplex communication between the browser and
server, and therefore require long running requests per user.

A variety of patterns for dealing with WebSockets in Django emerged while
developing DrawnBy, and since the Dash I've been working on abstracting these
into a reusable Django application called [django-socketio](https://github.com/stephenmcd/django-socketio) which I've released
today. It's available on [Github](https://github.com/stephenmcd/django-
socketio), [Bitbucket](https://bitbucket.org/stephenmcd/django-socketio) and
[PyPI](http://pypi.python.org/pypi/django-socketio/).

Here's an overview of the features.

#### Features

  * Installation of required packages from PyPI
  * A management command for running gevent's pywsgi server with auto-reloading capabilities
  * A channel subscription and broadcast system that extends Socket.IO allowing WebSockets and events to be partitioned into separate concerns
  * A signals-like event system that abstracts away the various stages of a Socket.IO request
  * The required views, urlpatterns, templatetags and tests for all the above

#### Channels

The WebSocket implemented by gevent-websocket provides two methods for sending
data to other clients, `socket.send` which sends data to the given socket
instance, and `socket.broadcast` which sends data to all socket instances
other than itself.

A common requirement for WebSocket based applications is to divide
communications up into separate channels. For example a chat site may have
multiple chat rooms and rather than using `broadcast` which would send a chat
message to all chat rooms, each room would need a reference to each of the
connected sockets so that `send` can be called on each socket when a new
message arrives for that room.

django-socketio extends Socket.IO both on the client and server to provide
channels that can be subscribed and broadcast to.

To subscribe to a channel client-side in JavaScript use the `socket.subscribe`
method:

{% highlight javascript %}
var socket = new io.Socket();
socket.connect();
socket.on(connect, function() {
    socket.subscribe(my channel);
});
{% endhighlight %}

Once the socket is subscribed to a channel, you can then broadcast to the
channel server-side in Python using the `socket.broadcast_channel` method:

{% highlight python %}
socket.broadcast_channel("my message")
{% endhighlight %}

#### Events

The `django_socketio.events` module provides a handful of events that can be
subscribed to, very much like connecting receiver functions to Django signals.
Each of these events are raised throughout the relevant stages of a Socket.IO
request.

Events are subscribed to by applying each event as a decorator to your event
handler functions:

{% highlight python %}
from django_socketio.events import on_message

@on_message
def my_message_handler(request, socket, context, message):
    ...
{% endhighlight %}

Each event handler takes at least three arguments: the current Django
`request`, the Socket.IO `socket` the event occurred for, and a `context`,
which is simply a dictionary that can be used to persist variables across all
events throughout the life-cycle of a single WebSocket connection.

  * `on_connect` - occurs once when the WebSocket connection is first established.
  * `on_message` - occurs every time data is sent to the WebSocket. Takes an extra `message` argument which contains the data sent.
  * `on_subscribe` - occurs when a channel is subscribed to. Takes an extra `channel` argument which contains the channel subscribed to.
  * `on_unsubscribe` - occurs when a channel is unsubscribed from. Takes an extra `channel` argument which contains the channel unsubscribed from.
  * `on_error` - occurs when an error is raised. Takes an extra `exception` argument which contains the exception for the error.
  * `on_disconnect` - occurs once when the WebSocket disconnects.
  * `on_finish` - occurs once when the Socket.IO request is finished.

Like Django signals, event handlers can be defined anywhere so long as they
end up being imported. Consider adding them to their own module that gets
imported by your urlconf, or even adding them to your views module since
they're conceptually similar to views.

#### Binding Events to Channels

All events other than the `on_connect` event can also be bound to particular
channels by passing a `channel` argument to the event decorator. The channel
argument can contain a regular expression pattern used to match again multiple
channels of similar function.

For example, suppose you implemented a chat site with multiple rooms.
WebSockets would be the basis for users communicating within each chat room,
however you may want to use them elsewhere throughout the site for different
purposes, perhaps for a real-time admin dashboard. In this case there would be
two distinct WebSocket uses, with the chat rooms each requiring their own
individual channels.

Suppose each chat room user subscribes to a channel client-side using the
room's ID:

{% highlight javascript %}
var socket = new io.Socket();
var roomID = 42;
socket.connect();
socket.on(connect, function() {
    socket.subscribe(room- + roomID);
});
{% endhighlight %}

Then server-side the different message handlers are bound to each type of
channel:

{% highlight python %}
@on_message(channel="dashboard")
def my_dashboard_handler(request, socket, context, message):
    ...

@on_message(channel="^room-")
def my_chat_handler(request, socket, context, message):
    ...
{% endhighlight %}

#### Chat Demo

The "hello world" of WebSocket applications is naturally the chat room. As
such django-socketio comes with a demo chat application that provides examples
of the different events and channel features available.
