---
layout: post
title: "Distributed Transactions in Actor Systems"
tags:
- redis
- scala
- akka
- open source
- pubsub
- nosql
- databases
- java
- jvm
- lua
---

The last time I wrote about [CurioDB][curiodb-post], I discussed [adding support for Lua scripting][lua-post], which was a ton of fun to work on. The scripting support could only be described as a toy however, due to one major omission - it had no form of transaction isolation, which is one of the main benefits of Lua scripting in Redis, which CurioDB attempts to mimic. The transactional nature of Lua scripting comes for free with Redis, given that it restricts scripting to a single, single-threaded server. This means that Lua scripts in Redis can run multiple commands atomically, making it a popular way to run transactions.

What would this look like in CurioDB though? The short answer is that it's very different. CurioDB is built with [Akka][akka], which means it is implemented as an [actor system][actor-model], where each key and value are represented as an individual actor. A simple way to think about this, is to imagine each actor as an individual server that can accept requests, initiate new requests, create new servers, and return responses. With CurioDB, this conceptually means *a separate server, for every key stored with a value*, and each of these may be executing code in parallel at any point in time, on any machine in the cluster. With this view, it's plain to see that transactions in CurioDB are no free lunch as they are with Redis. The good news however, stems from the original benefit sought by building CurioDB with Akka, in that the actor model forces concurrency - once we have a problem solved for concurrent actors on a single machine, the same solution applies to our cluster of many machines, and in this case, distributed transactions are then achieved. In case you hadn't guessed it already, [CurioDB now supports distributed transactions][transaction-commits], both by way of the `MULTI` and `EXEC` commands, and for Lua scripts with the `EVAL` and `EVALSHA` commands.

It took several months to get transactions working and polished in CurioDB, partly due to only having a limited amount of spare time these days to dedicate to open source, but also due to taking the time to study some database fundamentals, and thinking about how they would apply to what I was trying to do. It turned out that staples such as [two-phase commit (2PC)][2pc], [multiversion concurrency control (MVCC)][mvcc], and [transaction isolation levels][isolation], ideas I had a basic working knowledge of from using SQL databases for many years, would provide the foundation for adding distributed transactions to CurioDB.

### 2PC

From [Wikipedia][2pc]:

> Two-phase commit is a distributed algorithm that coordinates all the processes that participate in a distributed atomic transaction on whether to commit or abort (roll back) the transaction.

I mentioned each key and value stored in CurioDB is represented as an actor, but there are other actors as well. Each client connection is also managed by an individual actor, called a Client Node, which would be the *process* in the above definition. A Client Node acts as a transaction coordinator in 2PC parlance. They're responsible for coordinating initial agreement with each KV Node (the actors that store a key and value) that will participate in the transaction, aggregating responses for all executed (but uncommitted) commands, and then finally coordinating the commit phase for each participating Node. Each of these phases are implemented as states in a state machine - a very common pattern for actors in Akka, which provides specific APIs for dealing with state transitions and much more.

Coupled with MVCC which is described next, one of the benefits of using 2PC is that it provides the ability to perform rollback on errors during a transaction, which is something [Redis does not provide][redis-rollback]. This is the default behaviour in CurioDB, since it's arguably what's expected, but can alternatively be configured to commit on error, matching the behaviour of Redis if desired.

### MVCC & Transaction Isolation

Like many computing concepts, terms like *multiversion concurrency control* sound somewhat bewildering until you sit down and understand them, at which point they're surprisingly simple. [MVCC][mvcc] simply refers to storing multiple values at the same time for any given piece of data. In CurioDB, this is done using a map that contains each transaction's version, as well as the current committed version of the value, or "main" value. When a transaction begins, the main value is copied into the map, stored against its transaction ID, and from that point, all commands received within the transaction will read and write to the transaction version until the transaction is committed, at which point the transaction version is copied back to the main value.

This naturally lends itself to supporting different levels of [transaction isolation][isolation], which simply controls what happens when a value is read within a transaction. Here are the levels you can use in CurioDB:

* `repeatable` (default): Inside a transaction, only the transaction's
  version will be read, otherwise when outside of a transaction, the
  current committed version will be read.
* `committed`: Inside or outside of a transaction, the current
  committed version will be read.
* `uncommitted`: Inside or outside of a transaction, the most recently
  written version will be read, even if uncommitted.

Missing from CurioDB but typically found in transactional databases is a fourth, strictest isolation level, called `serializable`. This level relates to how values are read during range queries, which neither Redis nor CurioDB have a notion of.

### Conclusion

Implementing distributed transactions in CurioDB was very challenging and equally fun, and I really learnt a lot. The biggest take-away for me would be this: even when casting the idea of actor systems aside, I found that the combination of state machines and message passing, provides an extremely simple and powerful way to build distributed systems.

[curiodb-post]: /2015/07/08/curiodb-a-distributed-persistent-redis-clone/
[lua-post]: /2015/08/08/embedding-lua-in-scala-with-java-oh-my/
[akka]: http://akka.io/
[actor-model]: https://en.wikipedia.org/wiki/Actor_model
[transaction-commits]: https://github.com/stephenmcd/curiodb/compare/324e879338...8c33a334ad
[2pc]: https://en.wikipedia.org/wiki/Two-phase_commit_protocol
[mvcc]: https://en.wikipedia.org/wiki/Multiversion_concurrency_control
[isolation]: https://en.wikipedia.org/wiki/Isolation_(database_systems)
[redis-rollback]: http://redis.io/topics/transactions#why-redis-does-not-support-roll-backs
