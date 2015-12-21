---
layout: post
title: "Embedding Lua, in Scala, using Java, Oh My!"
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

Last month I unveiled [CurioDB][curiodb], a distributed and persistent [Redis][redis] clone built with [Scala][scala] and [Akka][akka]. Since then the project has moved forward at a steady pace, with a [couple of contributors][curiodb-contributors] jumping on board (and fixing my bugs), as well as some really cool new features, such as the addition of a Lua scripting API that mimics the one found in Redis, which I'd like to write about.

<!--
First, a grim digression. Like many seemingly overly productive developers, I imagine I sometimes use programming as an escape from hardships in life. Some of the greatest hacks I've ever realised have occurred at real low-points for me, where I'd bury my head in the computer instead of dealing with reality. Last month when my grandmother died, it was very hard. It was the first time I've ever had to deal with death, so how did I react? It seems that once again, I subconsciously knocked out a bunch of code, in order to try and keep my mind off of what had happened. I don't really know how to articulate anything more than that on the topic, but in some way or another, this recent work is dedicated to the memory of her.

<em class="center">
    <img src="/static/img/grandma.jpg" width="600">
    <br>With my grandmother on her 99th birthday, earlier this year.
</em>
-->

### LuaJ

I was reading over the list of features that CurioDB lacks [compared to Redis][curiodb-vs-redis], that I'd previously documented. It contained the item "no Lua scripting", which I'd written confidently at the time, certain that I wouldn't possibly be able to implement something so serious in my toy project. But then I thought to myself, "why not?", and after a bit of research, I discovered the fantastic [LuaJ library][luaj], which transformed the task from a significant engineering feat, into yet another case of merely gluing some libraries together.

LuaJ provides a complete API for compiling and running Lua scripts, and exposing JVM code to them as Lua functions. LuaJ also makes a complete range of Lua data types available to your JVM code. I purposely refer to the JVM ([Java Virtual Machine][jvm]) here rather than Java the language, as in my case, it's actually Scala being used to code against LuaJ, which makes the overall accomplishment seem even more death-defying.

### Obligatory Blog Snippets

Let's take a look. First up, we'll compile and run a snippet of Lua (sans imports and class scaffolding, which you can pick up from [the final result in CurioDB][scripting-source] if you wish):

{% highlight scala %}
// The global namespace we'll run the script in, which we could preload
// variables into if needed.
val globals = JsePlatform.standardGlobals()

// A tiny string of Lua code - it returns the second string from a
// table called "names" (Lua tables use 1-based indexes).
val script = "names = {'foo', 'bar', 'baz'}; return names[2]"

// Running the script returns a LuaValue object, which from our Lua
// code above, we know to be a string, so we cast it to one and print
// the value, which should be "bar".
val result = globals.load(script).call()
println(result.asjstring)
{% endhighlight %}

As simple as that. Now let's look at passing Lua variables from JVM land into a Lua script, and pulling Lua variables back out as JVM objects:

{% highlight scala %}
// The same table declared above in Lua, but this time in Scala.
val names = LuaValue.listOf(Array("foo", "bar", "baz").map(LuaValue.valueOf))

// Create the global namespace again, and pass the Lua table into it.
val globals = JsePlatform.standardGlobals()
globals.set("names", names)

// Our Lua code is inline here, and just returns the variable "names".
val result = globals.load("return names").call()

// The result is our original table back in Scala, where we can access
// items by index, just as we previously did in Lua.
println(result.get(2).asjstring)
{% endhighlight %}

There you have it - JVM objects representing Lua variables, moving into and back out of Lua code. Now let's look at the reverse, calling JVM code from inside Lua. To do this, we implement a class representing a Lua function:

{% highlight scala %}
// Simple function that takes a string, and prefixes it with "Hello ".
class SayHelloFunction extends OneArgFunction {
  override def call(name: LuaValue) =
    LuaValue.valueOf("Hello " + name.tojstring)
}

// Again, build the global namespace, this time adding the function
// object to it with a given name, and calling it from within Lua.
val globals = JsePlatform.standardGlobals()
globals.set("say_hello", new SayHelloFunction())
val result = globals.load("return say_hello('grandma')").call()
println(result.asjstring)  // prints "Hello grandma".
{% endhighlight %}

That's it, the full round trip - Lua calling JVM code, and vice versa. With that working, the rest is up to your imagination. I've only scratched the surface of what LuaJ provides - all of the data types found in Lua, its standard library, and much more.

[The final result][scripting-source] was a little more involved than the above implies. CurioDB is carefully designed to be non-blocking, using [tell rather than ask][tell-vs-ask], where [actors][actor-model] only ever send messages forwards, without expectation of a reply. The challenge here was introducing the synchronous `redis.call` API into a fundamentally asynchronous system. The solution involved modelling the scripting API as a client actor, with a controlled amount of blocking, much like the way TCP and HTTP connections are managed in the system.

### Call-ception

A really fun and whacky side effect of implementing this possibly a little *too correctly* (for lack of a better term), is that it unintentionally allows the Lua API to recursively call itself:

{% highlight sh %}
$ redis-cli EVAL "return redis.call('EVAL', 'return redis.call(\'EVAL\', \'return redis.call(\\\\\'TIME\\\\\')\', 0)', 0)" 0
1) (integer) 227734
2) (integer) 541653
{% endhighlight %}

Is this a feature, or a bug? The scripting API in Redis specifically disallows this, most likely for good reason.

[scala]: http://www.scala-lang.org/
[akka]: http://akka.io/
[curiodb]: https://github.com/stephenmcd/curiodb
[redis]: http://redis.io/
[curiodb-contributors]: https://github.com/stephenmcd/curiodb/graphs/contributors
[jvm]: https://en.wikipedia.org/wiki/Java_virtual_machine
[curiodb-vs-redis]: https://github.com/stephenmcd/curiodb#disadvantages-over-redis
[luaj]: http://www.luaj.org/luaj/3.0/README.html
[scripting-source]: https://github.com/stephenmcd/curiodb/blob/master/src/main/scala/Scripting.scala
[tell-vs-ask]: http://techblog.net-a-porter.com/2013/12/ask-tell-and-per-request-actors/
[actor-model]: https://en.wikipedia.org/wiki/Actor_model