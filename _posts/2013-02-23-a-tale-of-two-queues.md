---
layout: post
title: A Tale of Two Queues
tags:
- redis
- zeromq
- python
- pubsub
- go
- websockets
- sockets
- scalability
---

I've been playing around with [Publish/Subscribe queues][pubsub] (or *pub-sub* queues) for the last few months, which has led me through some research that has been very interesting for me personally. I've wanted to write about my experiences for a while now, but unfortunately this post continues to unwrite itself over time, as I refine my research and disprove any assumptions I've made along the way. Nonetheless, I've now decided to write about what I've worked on so far, and with that in mind, I'll make the disclaimer that this post isn't an attempt to draw any definitive conclusions, but merely to talk about my learning and experience as a work in progress. We'll take a look at some pub-sub use cases, using [Redis][redis] and [ZeroMQ][zeromq], from both [Python][python] and Google's [Go language][golang].

### Motivation

Real-time web applications have been a great area of interest for me over the years. I use the term real-time quite loosely here, as [real-time in software engineering][real-time] technically refers to a lower level set of system constraints. Instead I'm referring to a style of web application where users can interact with each other in a seemingly instantaneous way, such as a chat room or a multi-player game of some sort.

Applications like these where users interact in real-time will generally require some separate form of pub-sub component, which handles the communication when an event is triggered by one user, and needs to be broadcast to all the other users who should be notified of it. The event might be a character sprite moving on a game screen, or a message written in a chat room. Using a pub-sub component that is separated from the main web application is also as much an architectural requirement as it is a functional one — by moving the communication layer out into a separate component, the responsiveness of publishers within the application is no longer bound to the volume of messages being sent to subscribers. Also of equal importance, our web application layer no longer depends on any shared state, and can be spread across multiple threads, processes or servers.

I've built several toy applications like this in the past, such as [DrawnBy][drawnby] (shared drawing) and [Gamblor][gamblor] (shared gambling, chat and character movement), and in each case I've always used Redis as an in-memory store for transient data — temporary shared state across the app, that doesn't need the persistence guarantees and subsequent performance costs that a traditional database comes with. Now Redis has been described as the Swiss army knife of databases, and it's a great description for it — not only does it provide a wide variety of built-in data structures, it also offers a pub-sub queue, which has made Redis a well-suited companion for these types of applications I've built.

Since building these apps, I've been experimenting with some ideas around real-time web games, and character movement throughout them. Suppose we wanted to create a two-dimensional universe, of perpetual width and height, that users could move around within — how would we design it in a scalable way? The basic concept I came up with was to partition the world into a virtual grid, where each square on the grid uses its own pub-sub channel for communicating movement events to users, and each user publishes and subscribes to the grid square they're on, as well as the ones surrounding them.

Here's a diagram illustrating the idea, where each coloured area is a player's screen. The green area might be a wide-screen desktop, the blue area a mobile device, and the red one, well, it's a box.

<em class="center"><img class="noborder" src="/static/img/flatlands-grid.png"><br><br>Each grid square is a communication channel on a perpetual grid</em>

In the diagram, the red and green players are subscribed to each other's movements, as are the blue and green, but the red and blue players don't receive notification of each other's movements, since they're not subscribed to any common channels.

I built a working prototype of the above design using [Python][python], [gevent][gevent] and [Redis][redis]. There were a handful of intricacies that came into play that the above model doesn't go into. Things like managing extraneous grid subscriptions surrounding the player, to ensure smooth transitions between grid squares, and finding the sweet spot in limiting the volume of events being sent over the network by faking some of the character movement on screen.

Once I had this working, without a literal or figurative end-game in mind, I had the luxury of being able to further focus on the performance and scalability of such a system. My first step down this path of digression was to rewrite the back-end in Google's [Go language][golang]. I'd attended a few of the [Sydney Go Meetups][golang-meetup] and had been looking for a chance to dive into the language, so this seemed like a good opportunity to do so.

The port to Go was a fun experience. It looked very similar to the Python version in terms of design and the amount of code required, which is a testimony to Go's expressiveness and the breadth of its standard library. I'll talk more about Go later in this post, but for now, the rewrite didn't yield much difference in the amount of work the grid system could deal with. As with most real-world projects, its limitations were likely to be architectural rather than being bound to the language used.

I then started to look more closely at the pub-sub setup. With the grid design in place, we'd have a straight-forward path ahead for partitioning the pub-sub channels over multiple Redis instances, but how much volume could a single Redis pub-sub instance handle? Was there a tool that could handle more? I decided to explore this question further, and from that point on, I was entirely swept away into the realm of pub-sub benchmarking.

### Broker Characteristics

Before we dive into comparisons, let's look at some of the characteristics we want, given the above requirements.

*No persistence*

We're purely interested in message throughput, without concern for reliability. More specifically, a subscription to a channel can be though of as a *stream*, representing what's happening right *now*. If a subscriber has to reconnect, it has no need to receive missed messages — it's up to the client to determine what's appropriate.

Reliability via persistence also comes at a cost, as this typically requires writing messages to disk. Given the desire for maximum throughput, our message broker shouldn't be storing messages at all — they should be sent out to subscribers as soon as they're received from a publisher.

*Trusted clients*

A message broker is assumed to reside on the same trusted network as the pub-sub clients, so no form of authentication is required.

*Protocol agnostic*

We only want to pass string messages (or more specifically, byte sequences) around. Clients are responsible for encoding and decoding any particular format such as [JSON][json], [MsgPack][msgpack], or others, without the broker having any knowledge of the format.

*Horizontally scalable*

We should be able to add more broker instances into the mix, in order to handle a growing number of clients and messages. I can't think of a message broker that wouldn't fulfil this requirement, since as long as we're using multiple pub-sub channels, we can easily come up with a partitioning scheme such as [consistent hashing][consistent-hashing] that divides channels across brokers.

### ZeroMQ

[ZeroMQ][zeromq] is a piece of software I'd wanted to learn more about for quite some time. I'd heard the term pub-sub being used in conjunction with it, but knew it wasn't a pub-sub server itself, as its name clearly indicates. Perhaps it would provide an approach that negated the need to use pub-sub entirely — either way, this seemed like a good opportunity to take a closer look.

ZeroMQ has a reputation for being hard to understand, given any single description about it, until you spend enough time with it to hit that point of enlightenment where it just clicks. The main reference documentation for ZeroMQ is the [ZeroMQ Guide][zeromq-guide], which is a lengthy read, but for anyone with an interest in distributed systems, is well worth the time investment, even if you don't end up using ZeroMQ itself. To avoid doing it a disservice trying to describe it myself, here's the ZeroMQ description straight from the guide:

> ØMQ (also seen as ZeroMQ, 0MQ, zmq) looks like an embeddable networking library but acts like a concurrency framework. It gives you sockets that carry atomic messages across various transports like in-process, inter-process, TCP, and multicast. You can connect sockets N-to-N with patterns like fanout, pub-sub, task distribution, and request-reply. It's fast enough to be the fabric for clustered products. Its asynchronous I/O model gives you scalable multi-core applications, built as asynchronous message-processing tasks.

That's a lot to digest in one quote, but it's a great description. I'd say the main thing to take away is that ZeroMQ is a software *library*, that provides the building blocks for *building* things like pub-sub queues, rather than being an actual pub-sub queue or any other kind of network server itself.

There's a huge point to be made here around the age-long debate over whether to use existing software for infrastructure, or to roll your own. Developers often lean towards the latter — it's a path that can offer a lot more flexibility, without the constraint of having to fit square requirements into existing, potentially round, solutions. And let's be honest, it's a lot more fun! Inevitably it's a painful path though, wrought with human error — the mistakes that only become apparent once the software has had time to mature in production. With something like ZeroMQ however, developers can have their cake and eat it too. You can design your network software to precisely match your own requirements, and all of the low-level details such as message buffering and routing strategies are all tucked away neatly in the software library.

Once I'd played around with it a bit, I was able to form a more concrete question: could I use ZeroMQ to build a pub-sub server, and how would it compare to Redis? It turns out the first part of that question can be answered trivially, with very little code, while the second part would require a bit more effort.

### Show Me the Code

Without further ado, here's a basic pub-sub message broker in Python using ZeroMQ, that demonstrates how little is required to get up and running:

{% highlight python %}
import zmq

context = zmq.Context()
receiver = context.socket(zmq.PULL)
receiver.bind("tcp://*:5561")
sender = context.socket(zmq.PUB)
sender.bind("tcp://*:5562")

while True:
    sender.send(receiver.recv())
{% endhighlight %}

In order to test both queues as consistently as possible, I wanted to create procedures that use the same code base. To achieve this, I wrote a ZeroMQ pub-sub wrapper for the client, that implements the same API as [redis-py][redis-py], the Redis client for Python.

{% highlight python %}
import zmq

class ZMQPubSub(object):

    def __init__(self, host="127.0.0.1"):
        context = zmq.Context()
        self.pub = context.socket(zmq.PUSH)
        self.pub.connect("tcp://%s:5561" % host)
        self.sub = context.socket(zmq.SUB)
        self.sub.connect("tcp://%s:5562" % host)

    def publish(self, channel, message):
        self.pub.send_unicode("%s %s" % (channel, message))

    def subscribe(self, channel):
        self.sub.setsockopt(zmq.SUBSCRIBE, channel)

    def unsubscribe(self, channel):
        self.sub.setsockopt(zmq.UNSUBSCRIBE, channel)

    def pubsub(self):
        return self

    def listen(self):
        while True:
            channel, _, data = self.sub.recv().partition(" ")
            yield {"type": "message", "channel": channel, "data": data}
{% endhighlight %}

And lastly, here's a slightly watered down version of the test script used. First we set up a configurable number of clients that publish and consume messages. Each client then sneakily leverages the pub-sub queue itself, to provide per-second metrics for the number of messages consumed. Then after a certain time period, we report on the median number of messages consumed per second, per client.

{% highlight python %}
#!/usr/bin/env python

import argparse
import multiprocessing
import random
import time
import redis
import zmq_pubsub


def new_client():
    """
    Returns a new pubsub client instance — either the Redis or ZeroMQ
    client, based on command-line arg.
    """
    if args.redis:
        Client = redis.Redis
    else:
        Client = zmq_pubsub.ZMQPubSub
    return Client(host=args.host)


def publisher():
    """
    Loops forever, publishing messages to random channels.
    """
    client = new_client()
    message = u"x" * args.message_size
    while True:
        client.publish(random.choice(channels), message)


def subscriber():
    """
    Subscribes to all channels, keeping a count of the number of
    messages received. Publishes and resets the total every second.
    """
    client = new_client()
    pubsub = client.pubsub()
    for channel in channels:
        pubsub.subscribe(channel)
    last = time.time()
    messages = 0
    for message in pubsub.listen():
        messages += 1
        now = time.time()
        if now - last > 1:
            client.publish("metrics", str(messages))
            last = now
            messages = 0


def run_workers(target):
    """
    Creates processes * --num-clients, running the given target
    function for each.
    """
    for _ in range(args.num_clients):
        proc = multiprocessing.Process(target=target)
        proc.daemon = True
        proc.start()


def get_metrics():
    """
    Subscribes to the metrics channel and returns messages from
    it until --num-seconds has passed.
    """
    client = new_client().pubsub()
    client.subscribe("metrics")
    start = time.time()
    while time.time() - start <= args.num_seconds:
        message = client.listen().next()
        if message["type"] == "message":
            yield int(message["data"])


if __name__ == "__main__":

    # Set up and parse command-line args.
    global args, channels
    default_num_clients = multiprocessing.cpu_count() / 2
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--num-clients", type=int, default=default_num_clients)
    parser.add_argument("--num-seconds", type=int, default=10)
    parser.add_argument("--num-channels", type=int, default=50)
    parser.add_argument("--message-size", type=int, default=20)
    parser.add_argument("--redis", action="store_true")
    args = parser.parse_args()
    channels = [str(i) for i in range(args.num_channels)]

    # Create publisher/subscriber workers, pausing to allow
    # publishers to hit full throttle
    run_workers(publisher)
    time.sleep(1)
    run_workers(subscriber)

    # Consume metrics until --num-seconds has passed, and display
    # the median value.
    metrics = sorted(get_metrics())
    print metrics[len(metrics) / 2], "median msg/sec"
{% endhighlight %}

The main points of configuration in the above code, are the toggle between Redis and ZeroMQ clients, and the number of pub-sub clients used. A client contains two loops, one that publishes messages, and one that consumes them. Each of these loops are run on a separate OS process using Python's [multiprocessing module][multiprocessing], so the number of processes saturating the CPU is roughly equal to `1 broker + clients * 2`. A handful of other configurable options are also there, such as message size, and the number of pub-sub channels used, but these didn't really yield any meaningful variation in the results.

### Initial Results

Firstly, here are some details around my own setup used:

* OS: Mac OS X Lion 10.7.2 (11C74)
* Processor: 2 GHz Intel Core i7
* Memory: 8 GB 1333 MHz DDR3
* Python: 2.7.1
* Redis: 2.4.2 (with [hiredis][hiredis] parser)
* ZeroMQ: 2.2.0

And here are the initial results:

<em class="center"><img class="noborder" src="/static/img/two-queues-1.png"></em>

These results look quite grim, and have a couple of stand-out points. Firstly, the volume of messages produced and consumed by our benchmark script when run against the ZeroMQ broker, is fairly bound to the number of CPU cores being consumed. We see an increase in message volume per client, as we increase the number of processes being used, until we're utilising all available cores, after which point we see a drop off due to contention. No surprises there really.

The second point is more interesting. Relatively speaking, Redis seems quite slow, and more obviously, we see almost no change based on the amount of concurrent work happening. After a bit of digging around, it turns out the redis-py client will send each pub-sub message over the wire individually, while ZeroMQ will internally manage buffering messages for you, sending them out when it deems optimally appropriate.

So Redis hits a wall quite early here, while ZeroMQ obviously has a huge advantage. In a real-world application this distinction may not exist, with high message volume derived from the number of clients, rather than the amount of messages generated per individual client. For our test vacuum though, it's a real problem. Fortunately the redis-py client provides the ability to pipeline messages in batches, so we can easily get Redis back on even ground with ZeroMQ by providing a custom pub-sub client that makes use of Redis pipelining.

{% highlight python %}
import thread
import threading
import time
import redis


class BufferedRedis(redis.Redis):
    """
    Wrapper for Redis pub-sub that uses a pipeline internally
    for buffering message publishing. A thread is run that
    periodically flushes the buffer pipeline.
    """

    def __init__(self, *args, **kwargs):
        super(BufferedRedis, self).__init__(*args, **kwargs)
        self.buffer = self.pipeline()
        self.lock = threading.Lock()
        thread.start_new_thread(self.flusher, ())

    def flusher(self):
        """
        Thread that periodically flushes the buffer pipeline.
        """
        while True:
            time.sleep(.2)
            with self.lock:
                self.buffer.execute()

    def publish(self, *args, **kwargs):
        """
        Overrides publish to use the buffer pipeline, flushing
        it when the defined buffer size is reached.
        """
        with self.lock:
            self.buffer.publish(*args, **kwargs)
            if len(self.buffer.command_stack) >= 1000:
                self.buffer.execute()

{% endhighlight %}

This ``BufferedRedis`` client is fairly simple. It holds onto messages published until it hits a certain number of messages buffered, 1000 in the code above, and then sends them off. For the low-volume case of our metrics channel in the previous test code, this isn't enough though, so we also periodically flush messages, every 200 milliseconds in a separate thread. Next steps would be to allow the buffer size and flush interval to be configurable, but for our benchmarking purposes, these values work well.

Here are the results again, using the buffered client for Redis:

<em class="center"><img class="noborder" src="/static/img/two-queues-2.png"></em>

That's much better, and we can see here that with the new buffered client, our test routine is making better use of concurrency against Redis. But can we see any real difference between Redis and ZeroMQ brokers yet? The fact these results come out quite closely indicates a chance we may have hit another wall in our benchmarking.

### Go Go Go

With the slightest notch of Go experience under my belt, this seemed like another good opportunity to give Go a spin. With the closeness displayed by our two brokers so far, the possibility of a limitation occurring with the combination of Python and the hardware being used seemed worth exploring.

The Go version of the benchmarking routine isn't particularly interesting, as it mimics the Python version very closely, with the main difference being that we use [goroutines][goroutines] for concurrency, rather than OS processes. The code for the client libraries however, turned out to be hugely different between the Python and Go implementations, with the main distinction being the type systems — Python dynamically typed, and Go statically typed.

Both languages support [duck-typing][duck-typing], whereby calling code can run against different types of data given a common set of members. This is a requirement for our client testing code, in order to be able to swap the Redis and ZeroMQ clients with a single flag. Python's dynamic typing supports duck-typing in the true sense, in that calling code need know nothing about the types of data its working on until it actually runs. In Go however we need to be more explicit, and Go provides support for this via [interfaces][go-interfaces]. An interface in Go is simply a type, defined by a set of function signatures. With interfaces, we can set up a generic client interface, and create client types that implement it, without calling code knowing about the underlying type being used.

Here's what our Redis and ZeroMQ clients look like, when given a common interface that the testing routine can run against:

{% highlight go %}
package pubsub

import (
    "fmt"
    zmq "github.com/alecthomas/gozmq"
    "github.com/garyburd/redigo/redis"
    "strings"
    "sync"
    "time"
)

// A pub-sub message — defined to support Redis receiving different
// message types, such as subscribe/unsubscribe info.
type Message struct {
    Type    string
    Channel string
    Data    string
}

// Client interface for both Redis and ZMQ pubsub clients.
type Client interface {
    Subscribe(channels ...interface{}) (err error)
    Unsubscribe(channels ...interface{}) (err error)
    Publish(channel string, message string)
    Receive() (message Message)
}

// Redis client — defines the underlying connection and pub-sub
// connections, as well as a mutex for locking write access,
// since this occurs from multiple goroutines.
type RedisClient struct {
    conn redis.Conn
    redis.PubSubConn
    sync.Mutex
}

// ZMQ client — just defines the pub and sub ZMQ sockets.
type ZMQClient struct {
    pub *zmq.Socket
    sub *zmq.Socket
}

// Returns a new Redis client. The underlying redigo package uses
// Go's bufio package which will flush the connection when it contains
// enough data to send, but we still need to set up some kind of timed
// flusher, so it's done here with a goroutine.
func NewRedisClient(host string) *RedisClient {
    host = fmt.Sprintf("%s:6379", host)
    conn, _ := redis.Dial("tcp", host)
    pubsub, _ := redis.Dial("tcp", host)
    client := RedisClient{conn, redis.PubSubConn{pubsub}, sync.Mutex{}}
    go func() {
        for {
            time.Sleep(200 * time.Millisecond)
            client.Lock()
            client.conn.Flush()
            client.Unlock()
        }
    }()
    return &client
}

func (client *RedisClient) Publish(channel, message string) {
    client.Lock()
    client.conn.Send("PUBLISH", channel, message)
    client.Unlock()
}

func (client *RedisClient) Receive() Message {
    switch message := client.PubSubConn.Receive().(type) {
    case redis.Message:
        return Message{"message", message.Channel, string(message.Data)}
    case redis.Subscription:
        return Message{message.Kind, message.Channel, string(message.Count)}
    }
    return Message{}
}

func NewZMQClient(host string) *ZMQClient {
    context, _ := zmq.NewContext()
    pub, _ := context.NewSocket(zmq.PUSH)
    pub.Connect(fmt.Sprintf("tcp://%s:%d", host, 5562))
    sub, _ := context.NewSocket(zmq.SUB)
    sub.Connect(fmt.Sprintf("tcp://%s:%d", host, 5561))
    return &ZMQClient{pub, sub}
}

func (client *ZMQClient) Subscribe(channels ...interface{}) error {
    for _, channel := range channels {
        client.sub.SetSockOptString(zmq.SUBSCRIBE, channel.(string))
    }
    return nil
}

func (client *ZMQClient) Unsubscribe(channels ...interface{}) error {
    for _, channel := range channels {
        client.sub.SetSockOptString(zmq.UNSUBSCRIBE, channel.(string))
    }
    return nil
}

func (client *ZMQClient) Publish(channel, message string) {
    client.pub.Send([]byte(channel+" "+message), 0)
}

func (client *ZMQClient) Receive() Message {
    message, _ := client.sub.Recv(0)
    parts := strings.SplitN(string(message), " ", 2)
    return Message{Type: "message", Channel: parts[0], Data: parts[1]}
}
{% endhighlight %}

The [redigo][redigo] Redis library for Go used here is quite different from its Python counterpart. Under the hood, it uses Go's [bufio][go-bufio] package, which in conjunction with a network connection, provides buffered reads and writes over the network, so there's no need for a separate API analogous to redis-py's pipelining, as buffering is a fundamental aspect of the client. As you can see though, in the ``NewRedisClient`` function, we still need to set up mechanics for periodically flushing any buffered data in order to support the low-volume case, so it's not entirely magical.

The astute reader will have noticed we don't implement ``RedisClient.Subscribe`` and ``RedisClient.Publish`` methods — this is due to the unnamed embedded ``redis.PubSubConn`` within ``RedisClient``, which already contains these methods. By embedding it without a name, its methods are directly accessible from the outer type. This is a really powerful feature of Go, allowing very elegant type hierarchies to be constructed using mixins.

### And The Winner Is...

You the reader of course, for making it this far through this post. Seriously though, here are the combined results for both Go and Python versions:

<em class="center"><img class="noborder" src="/static/img/two-queues-3.png"></em>

Before we go any further, it's important to highlight some key differences between the Python and Go test routines. As mentioned, the Go version isn't particularly interesting, as the code is almost identical to the Python version. The *way* it runs however, and makes use of the available hardware, is very different. In the Python version, our best shot at making use of all available cores is to run each publisher and subscriber routine in a separate Python interpreter, each running on a single OS process. Go's goroutines paint an entirely different picture. With only a single pub-sub client, we're able to consume all available CPU cores using a single OS process — Go manages all of the parallelism for you. So we end up achieving the highest volume in messages with a single client, given that it can consume all available cores without any contention coming into play.

So this isn't at all a comparison between Python and Go, since we'd be comparing apple pies to orange juice. But that's fine, as it was never the point. The switch to Go merely allowed us to make better use of the available hardware, in order to reach a point in message throughput where we could potentially see a greater variance between Redis and ZeroMQ.

### Conclusion

What can we take away from all of this? To be brutally honest, not much — I feel like I've only scratched the surface here, and without really diving in and profiling some of the code used, any conclusions drawn at this point would be fairly superficial. It did provide a good avenue for learning all about ZeroMQ and Go, which was a ton of fun, and something I'm definitely going to spend more time with. I also learnt that the buffering strategies used when dealing with a high volume of messages over the network form a critical piece of the puzzle.

You can find all of the Python and Go code I wrote for this in the repo called *two-queues*, on both [GitHub][twoqueues-github] and [Bitbucket][twoqueues-bitbucket].

**Update (next day):** After publishing this, it was well received in the community, with endorsements from both [Pieter Hintjens][hintjens] (creator of ZeroMQ) and [Salvatore Sanfilippo][antirez] (creator of Redis). Some great discussions continued on from there, on [Hacker News][hn-thread], [Reddit][reddit-thread] and [Twitter][twitter-thread] — have a read!

**Update (next week):** Others have come along and made some interesting additions to the source code, check these out too:

  * [Elixir on the Erlang VM](https://github.com/stephenmcd/two-queues/pull/2)
  * [Redis 2.6.10 vs ZeroMQ 3.2.3](https://github.com/stephenmcd/two-queues/issues/1)
  * [MQTT broker addition](https://github.com/stephenmcd/two-queues/pull/5)

[pubsub]: http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern
[real-time]: http://en.wikipedia.org/wiki/Real-time_computing
[drawnby]: http://drawnby.jupo.org
[gamblor]: http://gamblor.jupo.org
[redis]: http://redis.io
[python]: http://python.org
[gevent]: http://www.gevent.org
[golang]: http://golang.org
[golang-meetup]: http://www.meetup.com/golang-syd/
[json]: http://json.org
[msgpack]: http://msgpack.org
[consistent-hashing]: http://www.tom-e-white.com/2007/11/consistent-hashing.html
[zeromq]: http://www.zeromq.org
[zeromq-guide]: http://zguide.zeromq.org/page:all
[redis-py]: https://github.com/andymccurdy/redis-py
[multiprocessing]: http://docs.python.org/2/library/multiprocessing.html
[hiredis]: https://github.com/pietern/hiredis-py
[goroutines]: http://tour.golang.org/#62
[go-interfaces]: http://tour.golang.org/#52
[duck-typing]: http://en.wikipedia.org/wiki/Duck_typing
[redigo]: https://github.com/garyburd/redigo
[go-bufio]: http://golang.org/pkg/bufio/
[twoqueues-github]: https://github.com/stephenmcd/two-queues
[twoqueues-bitbucket]: https://bitbucket.org/stephenmcd/two-queues
[hintjens]: https://twitter.com/hintjens
[antirez]: https://twitter.com/antirez
[hn-thread]: http://news.ycombinator.com/item?id=5269671
[reddit-thread]: http://www.reddit.com/r/programming/comments/1920cd/a_tale_of_two_queues/
[twitter-thread]: https://twitter.com/stephen_mcd/status/305098894138814465
