---
layout: post
title: "CurioDB: A Distributed & Persistent Redis Clone"
tags:
- redis
- scala
- akka
- open source
- data structures
- scalability
- pubsub
- nosql
- databases
---

Last year I started learning [Scala][scala] and [Akka][akka] for my then day-job. This post isn't so much about that learning experience, which is an entire topic in its own right, given the notoriously large learning curve Scala has. Instead I wanted to write about the toy project I then built, that I've called [CurioDB][curiodb] - a distributed and persistent [Redis][redis] clone! Please note that this is a toy project, hence the name "Curio", and any suitability as a drop-in replacement for Redis is purely incidental.

## Scala

Firstly though, let's talk about Scala a little. If you've never heard of Scala, it's an advanced, hybrid [functional][functional] and [object oriented][object-oriented] programming language for the [JVM][jvm], developed by a company called [Typesafe][typesafe]. As I mentioned, I found its reputation for being relatively hard to learn well founded. I can only reiterate all the common points brought up when people write about Scala - the type system goes very deep, personally I've only scratched the surface of it. On one hand this is a good thing. Working with a technology that takes a very long time to achieve mastery in can serve as a constant source of motivation, given the right attitude.

The language itself is very powerful, with an overwhelming number of advanced features. This power comes at a cost though - the syntax at first seems to contain many ambiguities, and in that regard, it reminds me of a very modern [Perl][perl]. I imagine that one developer's Scala may look very different to another's, and that working with Scala on a team would require a relatively decent amount of discipline to conform to a [consistent set of language features and style][scala-style]. On the other hand, that can all be thrown out of the window with a one-person project, as was my case, and as such, learning Scala and developing CurioDB has been a huge amount of fun!

## Akka

Given only the above, I'd be on the fence as to whether Scala as a language itself is a worthwhile time investment in the long-term toolbox, but when you take Akka into consideration, I'm definitely sold. Akka is a framework, also by Typesafe, that allows you to develop massively distributed systems in a safe and transparent way, using the [actor model][actor-model]. This is a weird analogy, but I see Akka as a killer framework for distributed systems in the same way I've seen [Django][django] as a killer framework for web development over the years - both gave me a profound sense of rapid development, by providing just the right level of abstraction that handles all the nitty-gritty details of their respective domains, allowing you to focus specifically on developing your application logic.

## CurioDB

So why build a Redis clone? I've used Redis heavily in the past, and
Akka gave me some really cool ideas for implementing a clone, based
on each key/value pair (or KV pair) in the system being implemented as an actor:

_Concurrency_

Since each KV pair in the system is an actor, CurioDB will happily use
all your CPU cores, so you can run 1 server using 32 cores instead of
32 servers each using 1 core (or use all 1,024 cores of your 32 server
cluster, why not). Each actor operates on its own value atomically,
so the atomic nature of Redis commands is still present, it just occurs
at the individual KV level instead of in the context of an entire
running instance of Redis.

_Distributed by Default_

Since each KV pair in the system is an actor, the interaction between
multiple KV pairs works the same way when they're located across the
network as it does when they're located on different processes on a
single machine. This negates the need for features of Redis like "hash
tagging", and allows commands that deal with multiple keys (`SUNION`,
`SINTER`, `MGET`, `MSET`, etc) to operate seamlessly across a cluster.

_Virtual Memory_

Since each KV pair in the system is an actor, the unit of disk storage
is the individual KV pair, not a single instance's entire data
set. This makes Redis' [abandoned virtual memory feature][redis-vm] a
lot more feasible. With CurioDB, an actor can simply persist its value
to disk after some criteria occurs, and shut itself down until
requested again.

_Simple Implementation_

Scala is concise, you get a lot done with very little code, but that's
just the start - CurioDB leverages Akka very heavily, taking care of
clustering, concurrency, persistence, and a whole lot more. This means
the bulk of CurioDB's code mostly deals with implementing all of the
[Redis commands][redis-commands], so far weighing in at only a paltry
1,000 lines of Scala! Currently, the majority of commands have been
fully implemented, as well as the [Redis wire protocol][redis-protocol]
itself, so [existing client libraries][redis-clients] can be used. Some
commands have been purposely omitted where they don't make sense, such
as cluster management, and things specific to Redis' storage format.

_Pluggable Storage_

Since Akka Persistence is used for storage, many strange scenarios
become available. Want to use [PostgreSQL][postgresql] or
[Cassandra][cassandra] for storage, with CurioDB as the front-end
interface for Redis commands? [This should be possible!][storage-backends]
By default, CurioDB uses Akka's built-in [LevelDB storage][leveldb-storage].

## Design

Let's look at the overall design. Here's a bad diagram representing one server in the cluster, and the flow of a client sending a command:

![Image](http://i.imgur.com/9KkP9uZ.png)

* An outside client sends a command to the server actor
  ([Server.scala][server-source]). There's at most one per cluster node
  (which could be used to support load balancing), and at least one per
  cluster (not all nodes need to listen for outside clients).
* Upon receiving a new outside client connection, the server actor will
  create a Client Node actor ([System.scala][system-source]), it's
  responsible for the life-cycle of a single client connection, as well
  as parsing the incoming and writing the outgoing Redis wire protocol.
* Key Node actors ([System.scala][system-source]) manage the key space
  for the entire system, which are distributed across the entire
  cluster using consistent hashing. A Client Node will forward the
  command to the matching Key Node for its key.
* A Key Node is then responsible for creating, removing, and
  communicating with each KV actor, which are the actual Nodes for each
  key and value, such as a string, hash, sorted set, etc
  ([Data.scala][data-source]).
* The KV Node then sends a response back to the originating Client
  Node, which returns it to the outside client.
* Some commands require coordination with multiple KV Nodes, in which
  case a temporary Aggregate actor
  ([Aggregation.scala][aggregation-source]) is created by the Client
  Node, which coordinates the results for multiple commands via Key
  Nodes and KV Nodes in the same way a Client Node does.
* PubSub is implemented by adding behavior to Key Nodes and Client
  Nodes, which act as PubSub servers and clients respectively
  ([PubSub.scala][pubsub-source]).

## Disadvantages over Redis

* I haven't measured it, but it's safe to say memory consumption is
  much poorer due to the JVM. Somewhat alleviated by the virtual memory
  feature.
* It's slower, but not by as much as you'd expect. Without any
  optimization, it's roughly about half the speed of Redis. See the
  performance section below.
* PubSub pattern matching may perform poorly. PubSub channels are
  distributed throughout the cluster using consistent hashing, which
  makes pattern matching impossible. To work around this, patterns get
  stored on every node in the cluster, and the `PSUBSCRIBE` and
  `PUNSUBSCRIBE` commands get broadcast to all of them. This needs
  rethinking!
* No [Lua scripting][lua-scripting]. :-(

Mainly though, Redis is an extremely mature and battle-tested project
that's been developed by many over the years, while CurioDB is a one-man
hack project worked on over a few months. As much as this article
attempts to compare them, they're really not comparable in that light.

## Performance

These are the results of `redis-benchmark -q` on an early 2014
MacBook Air running OSX 10.9 (the numbers are requests per second):

{: .table .table-striped}
Benchmark      | Redis    | CurioDB  | %
---------------|----------|----------|----
`PING_INLINE`  | 68965.52 | 51546.39 | 74%
`PING_BULK`    | 70921.98 | 48543.69 | 68%
`SET`          | 67704.80 | 44843.05 | 66%
`GET`          | 70621.47 | 44662.79 | 63%
`INCR`         | 71581.96 | 41288.19 | 58%
`LPUSH`        | 70472.16 | 40436.71 | 57%
`LPOP`         | 69589.42 | 9694.62  | 14%
`SADD`         | 69686.41 | 41305.25 | 59%
`SPOP`         | 70771.41 | 41271.15 | 58%
`LPUSH`        | 70372.98 | 40225.26 | 57%
`LRANGE_100`   | 24319.07 | 11795.24 | 49%
`LRANGE_300`   | 9894.13  | 6295.25  | 64%
`LRANGE_500`   | 7449.90  | 4763.27  | 64%
`LRANGE_600`   | 5765.68  | 3976.46  | 69%
`MSET`         | 46728.97 | 14607.07 | 31%

## Conclusion

That's it so far! I had a lot of fun building [CurioDB][curiodb], and Akka has really blown me away. If nothing else, I hope this project can provide a great showcase for how trivial Akka makes building distributed systems.

[scala]: http://www.scala-lang.org/
[akka]: http://akka.io/
[curiodb]: https://github.com/stephenmcd/curiodb
[redis]: http://redis.io/
[functional]: https://en.wikipedia.org/wiki/Functional_programming
[object-oriented]: https://en.wikipedia.org/wiki/Object-oriented_programming
[jvm]: https://en.wikipedia.org/wiki/Java_virtual_machine
[typesafe]: http://www.typesafe.com/
[perl]: https://www.perl.org/
[scala-style]: http://twitter.github.io/effectivescala/
[actor-model]: https://en.wikipedia.org/wiki/Actor_model
[django]: https://www.djangoproject.com/
[redis-vm]: http://redis.io/topics/virtual-memory
[redis-commands]: http://redis.io/commands
[redis-protocol]: http://redis.io/topics/protocol
[redis-clients]: http://redis.io/clients
[postgresql]: http://www.postgresql.org/
[cassandra]: http://cassandra.apache.org/
[storage-backends]: http://akka.io/community/#snapshot-plugins
[leveldb-storage]: http://doc.akka.io/docs/akka/snapshot/scala/persistence.html#Local_snapshot_store
[server-source]: https://github.com/stephenmcd/curiodb/blob/master/src/main/scala/Server.scala
[system-source]: https://github.com/stephenmcd/curiodb/blob/master/src/main/scala/System.scala
[data-source]: https://github.com/stephenmcd/curiodb/blob/master/src/main/scala/Data.scala
[aggregation-source]: https://github.com/stephenmcd/curiodb/blob/master/src/main/scala/Aggregation.scala
[pubsub-source]: https://github.com/stephenmcd/curiodb/blob/master/src/main/scala/PubSub.scala
[lua-scripting]: http://redis.io/commands/eval
