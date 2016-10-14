---
layout: post
title: Mobile IRC with Bonus Robots
tags:
- gnotty
- irc
- websockets
- socket.io
- python
- django
- mezzanine
- open source
- github
- bitbucket
---

Earlier this year I finally got around to setting up an [IRC][irc] channel for [Mezzanine][mezzanine], where developers and users can collaborate on the development of Mezzanine and related projects. It's been a good experience so far, facilitating quick questions as well as longer drawn out discussions, both which are sometimes better served by a real-time chat than a [Mezzanine mailing list][mezzanine-mailing-list] thread.

At the time I thought about how I could provide a web-based interface for the IRC channel, via the Mezzanine website. Mezzanine has always striven hard to be newcomer friendly, from the early days with its [one-step project creation][mezzanine-create], to more recently with its [bundled server provisioning and production deployment utilities][mezzanine-deploy], so having live support available directly on the project website was a natural evolution.

### Existing Projects

The first step was to research existing web-based IRC clients. The main contender was a project called [qwebirc][qwebirc], which is used by [freenode][freenode] and many other IRC networks. It's been under active development for many years, and given some of the projects using it, would appear to be quite mature. One of the core requirements for me would be to customise the interface easily, in order to integrate with the look and feel of the [Mezzanine website][mezzanine]. Unfortunately after diving a bit deeper, I walked away with a laundry list of issues that turned me off using it.

Firstly there seemed to be almost no documentation, and the code contained almost no comments, so getting an understanding of how everything worked would have involved a decent time investment. Secondly, the transport mechanism between the browser and server was unclear. There seemed to be a reference to [XHR polling][xhr-polling] in one of the 40 or so JavaScript files included, but ideally I wanted something that made use of [WebSockets][websockets]. Again these files weren't at all commented, and left me with the feeling that the client side of the project was heavily over-engineered. Finally, qwebirc is based on the [Twisted networking framework][twisted] — software that I'm not personally familiar with, and one that's known to have a fairly steep learning curve.

Another requirement I had for the Mezzanine site was to also include a browsable and searchable message archive. Getting the IRC conversations indexed by Google would mean that new users could potentially find answers to their questions without having to ask them, which would alleviate time spent on support for myself and other members of the community (a big shout out to [Ken Bolton][ken-bolton] and [Josh Cartmell][josh-cartmell] for their ongoing efforts here). I'm vaguely aware of some [Django][django] projects around that implement this functionality, but wouldn't it be nice if there was an all-inclusive package for IRC integration that made use of modern technology?

### Starting From Scratch

Given all the above, I had a clear idea around what I wanted from web-based IRC client. A simple bridge between IRC and [gevent][gevent] on the server, with WebSocket support on the client.

I've got a good amount of experience using WebSockets backed by gevent. In fact I created [django-socketio][django-socketio] quite some time ago, specifically to integrate gevent-backed WebSockets with Django. That project however has languished behind the latest WebSocket protocol, and one of the longest standing items in my open source work has been to get up to date with the latest WebSocket protocol, and upgrade django-socketio.

So at the risk of drowning in the sea of [NIH][not-invented-here], I decided to start my own project to build this, as it would give me the perfect opportunity to get back up to speed with the latest WebSocket protocol, as well as giving me the most flexibility around customising the client and including extra features in it, such as the message archive and more.

The result of this endeavour is a project I've called [Gnotty][gnotty]. At its core, Gnotty is a lightweight bridge between IRC and gevent, with WebSockets on the client via [socket.io][socketio]. Starting from scratch meant that I was able to implement a ton of extra features, which against the [UNIX philosophy of doing one thing well][unix-philosophy], I ended up getting quite carried away with. Nonetheless I'm really pleased with the result so far.

Following is an overview of the extra features I've implemented so far in Gnotty, that make it much more than just a web-based interface to IRC.

### Responsive Layout

The default interface for Gnotty is entirely based on [Twitter's Bootstrap][twitter-bootstrap]. This made it easy to ensure that it functions correctly on mobile devices thanks to Bootstrap's [responsive][responsive-design] features.

<em class="center"><a href="/static/img/gnotty-desktop-large.png"><img src="/static/img/gnotty-desktop.png"></a><a href="/static/img/gnotty-mobile-large.png"><img src="/static/img/gnotty-mobile.png"></a><br>A fully responsive IRC client, on your desktop or mobile device</em>

### JavaScript Client

Gnotty provides a JavaScript client that makes no assumptions about the structure of the browser interface. It simply exposes each of the methods and events that occur for interacting with the IRC room. Don't want to use default interface? The JavaScript client allows you to develop your own from scratch.

### Message Archive

As mentioned, one of the key requirements I had was to have all messages archived so that they can then be browsed and searched through. Whatever the context of using Gnotty is, from collaborating on an open source project, to private rooms for teams to use, this form of knowledge reuse is a critical feature. Gnotty provides this feature by combining Django models with [Python's logging module][python-logging]. Logging namespaces are defined for IRC messages as well as several other events, and when deployed as a Django project, logging handlers are configured that store all IRC messages to [Django models][django-models]. The interface for browsing and searching the message archive is then provided using [Django views][django-views].

<em class="center"><a href="/static/img/gnotty-browse-large.png"><img src="/static/img/gnotty-browse.png"></a><a href="/static/img/gnotty-search-large.png"><img src="/static/img/gnotty-search.png"></a><br>Message archive by date or keyword search</em>

Note that Django integration with Gnotty is entirely optional. You can deploy Gnotty as a stand-alone bridge between IRC and gevent without using Django at all. Given the use of Python's logging module, you can then create your own logging handlers, and store IRC messages in some other format or location should you wish to.

### Django Templating

By default, Gnotty's interface uses [Django's templating language][django-templating]. This opens the door to many opportunities for customisation, from using Django's template tags, to integrating with your existing Django project's look and feel. Deploying Gnotty as a Django project opens it up to the entire ecosystem of [third party Django applications][django-packages].

### Private Rooms

This is another bonus feature simply available by virtue of Gnotty integrating with Django. By defining the `GNOTTY_LOGIN_REQUIRED` setting in your Django project, the chat interface and message archive then require an [authenticated Django user][django-auth] in order to be accessed. Combine this with a local IRC server such as [ngIRCd][ngircd], you can have your own hosted private IRC room for team collaboration, all set up in a matter of minutes.

### Bot Framework

Here's where things really got carried away. Gnotty includes a mini framework for injecting [IRC bots][irc-bots] into the room. The bots expose all of the events that can occur in the IRC channel, such as users messaging, entering and leaving. The bots also include an API for creating simple Python commands, where user messages can be mapped to Python methods on the bot. Bots can also have timer events implemented ([new in 0.2][0.2-release]), that run periodically at a given interval, and are useful for polling external resources. Finally, since Gnotty at its core is a web interface, the bots also allow [webhooks][webhooks] to be implemented — custom URLs that allow other services to interact with the bots over HTTP.

With IRC channel events, user commands and webhooks, a ton of interesting possibilities open up for building IRC bots that perform a variety of tasks. Gnotty also provides a handful of default bots to get you started with:

- `ChatBot` — A bot that demonstrates interacting with the IRC channel by greeting and responding to other users.
- `GitHubBot` — A bot for relaying commit information from [GitHub][github]
- `BitBucketBot` — A bot for relaying commit information from [Bitbucket][bitbucket]
- `CommandBot` — A bot that implements a handful of basic commands that can be issued by users in the channel.
- `RSSBot` — A bot that watches [RSS][rss] feeds and posts new items from them to the IRC channel ([new in 0.2][0.2-release]).
- `Voltron` — All of the available bots, merged into one [super bot][voltron].

### Next Steps

I've given an overview here of the core features that Gnotty implements in its first release. Take a look at the [Gnotty documentation][gnotty-readme] where all of the features are described in much greater detail, along with configuration options and code samples to get you started. As with all my open source projects, Gnotty is available on both [GitHub][gnotty-github] and [Bitbucket][gnotty-bitbucket], so if you'd like to work with me on future development then by all means dive right in.

I think there's a ton of possibilities around future development, particularly around the idea of private rooms for team collaboration. I'd love to see IRC's [DCC send][dcc-send] supported, where team members could send files to each other that are uploaded and streamed backed down directly through the browser. Also Gnotty is currently designed to only work with a single IRC room, so support for multiple rooms is another obvious direction for future development to take.

Finally if you're keen to see Gnotty in action, you can see a skinned version of it that makes use of all of its features, integrated into the [Mezzanine project's website][mezzanine-irc].

[irc]: http://en.wikipedia.org/wiki/Internet_Relay_Chat
[mezzanine]: http://mezzanine.jupo.org
[mezzanine-mailing-list]: https://groups.google.com/group/mezzanine-users
[mezzanine-create]: http://mezzanine.jupo.org/docs/overview.html#installation
[mezzanine-deploy]: http://mezzanine.jupo.org/docs/deployment.html#commands
[qwebirc]: http://www.qwebirc.org/
[freenode]: http://freenode.net/
[xhr-polling]: http://en.wikipedia.org/wiki/XMLHttpRequest
[websockets]: http://en.wikipedia.org/wiki/WebSocket
[twisted]: http://twistedmatrix.com/
[ken-bolton]: https://twitter.com/kenbolton
[josh-cartmell]: https://twitter.com/joshcartme
[django]: https://www.djangoproject.com
[gevent]: http://www.gevent.org/
[django-socketio]: https://github.com/stephenmcd/django-socketio
[not-invented-here]: http://en.wikipedia.org/wiki/Not_invented_here
[gnotty]: https://github.com/stephenmcd/gnotty
[socketio]: http://socket.io
[unix-philosophy]: http://en.wikipedia.org/wiki/Unix_philosophy
[twitter-bootstrap]: https://twitter.github.com/bootstrap
[responsive-design]: http://en.wikipedia.org/wiki/Responsive_web_design
[python-logging]: http://docs.python.org/2/library/logging.html
[django-models]: https://docs.djangoproject.com/en/dev/topics/db/models/
[django-views]: https://docs.djangoproject.com/en/dev/topics/http/views/
[django-templating]: https://docs.djangoproject.com/en/dev/topics/templates/
[django-packages]: http://www.djangopackages.com/
[django-auth]: https://docs.djangoproject.com/en/dev/topics/auth/
[ngircd]: http://ngircd.barton.de/
[irc-bots]: http://en.wikipedia.org/wiki/Internet_Relay_Chat_bot
[0.2-release]: /2012/12/25/gnotty-0.2-released/
[webhooks]: http://en.wikipedia.org/wiki/Webhook
[github]: https://github.com
[bitbucket]: https://bitbucket.org
[rss]: http://en.wikipedia.org/wiki/RSS
[voltron]: http://www.youtube.com/watch?v=tZZv5Z2Iz_s
[gnotty-readme]: https://github.com/stephenmcd/gnotty#gnotty
[gnotty-github]: https://github.com/stephenmcd/gnotty
[gnotty-bitbucket]: https://bitbucket.org/stephenmcd/gnotty
[dcc-send]: http://en.wikipedia.org/wiki/Direct_Client-to-Client
[mezzanine-irc]: http://mezzanine.jupo.org/irc/


<script>
// gah, made a bad link in a tweet
if (document.referrer == 'http://t.co/OTWMyk2qmR') {
    location = '/2013/02/23/a-tale-of-two-queues/';
}
</script>
