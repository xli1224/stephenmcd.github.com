---
layout: post
title: 'Bitwise Lua Operations in Redis'
tags:
- lua
- redis
- python
- nosql
- hacks
---

I've recently spent a good deal of time learning and writing code in the [Lua programming language][lua]. It's a nice little language, very similar to others such as [Python][python], [JavaScript][javascript] and [Ruby][ruby] - [Algol based][algol-based], [object oriented][object-oriented], [dynamically typed][dynamically-typed] and [interpreted][interpreted], with [first class functions][first-class-functions] available. Lua itself doesn't contain any particularly unique features, and if you're savvy with the above languages you'll pick up the basics in a number of hours. What does make Lua unique though, is its relatively small size and speed, which makes it a popular choice for embedding scripting capabilities inside other programs.

[Redis][redis] is one piece of software that embeds Lua for scriptability, and it was this setup that brought me to Lua in the first place. I recently [wrote about Redis][two-queues] where I described it in more detail, but if you're unfamiliar with it, it's a key-value store - similar to [memcached][memcached] on the surface, but with a much richer variety of data types and operations.

What specifically led me to Lua in Redis, is the ability it provides to perform complex atomic operations. Consider the operation of multiplying a number - not particularly complex, but a good starting point. Redis provides commands for retrieving a number, writing a number, and even incrementing a number, but not multiplying it, so multiplication becomes a three step operation: read the number from Redis, multiply it locally, then set the new value. But what happens if two clients perform this almost simultaneously?

- Client "A" reads the number 3, with the intention of multiplying its current value by 2
- Client "B" also reads the number 3, with the same intention
- Client "A" has read the value, locally multiplied it by 2 to get 6, which it then writes back to Redis
- Client "B" does the same, writing the value of 6

What has happened to the fact client "A" performed multiplication? It's lost forever. What we need is a way for all the steps in the multiplication operation to be executed atomically, which would have resulted in a final value of 12 being stored, in the example above. Redis itself is single threaded, and so all of the commands it provides are atomic by default. Many of these actually deal specifically with the type of *check and set* scenario described in the multiplication example above, such as [writing new values to hash fields only if they don't already exist][redis-hsetnx], and [atomically incrementing integer values][redis-incr].

In my current project, there are dozens and dozens of different types of operations on Redis such as the multiplication example above, which are all required to be atomic, and fall outside the scope of any of the commands provided in Redis by default. Redis does provide some support for custom atomic operations with its [MULTI][redis-multi] and [WATCH][redis-watch] commands, however MULTI is only useful when each step in the sequence of operations isn't dependant on another, and the WATCH command in my opinion isn't a very intuitive API. Redis doesn't leave you hanging though, and the support for embedded Lua means the sky is the limit for implementing custom atomic operations.

#### Lua AND Redis OR Lua AND Bitwise Operators

Many of these custom atomic operations I've recently had to implement require basic [bitwise operators][bitwise], something that I quickly discovered Lua itself lacks. As I mentioned, it is in fact quite a small language. The lack of bitwise operators in Lua came as quite a surprise to me, as they're something developers generally take for granted in higher level languages, a category which Lua falls squarely under.

To make matters more comical, I found that Lua 5.2 actually provides [bitwise operators as part of its standard library][lua-bitwise-5-2], but guess which version of Lua is embedded in Redis? 5.1! And it seems like an [upgrade won't be happening any time soon][redis-issue-lua-upgrade]. Fortunately there are many [third-party bitwise operator libraries for Lua][lua-bitwise-third-party], so it's not all doom and gloom. The final blocker though, was the fact that Lua scripts in Redis aren't able to access external libraries in any way. The remainder of this post will cover how you can embed any third-party Lua library into Redis, and in this particular case, provide bitwise operators to any atomic Redis operations written in Lua.

#### Named Lua Functions in redis-py

First a little background on my setup. I define all of my Lua scripts as named functions in a file, playfully named `atoms.lua`. Here's a snippet from it, a `list_pop` function which atomically pops an item from a Redis list, given the item's index - an operation that Redis doesn't provide within its own set of commands:

{% highlight lua %}
function list_pop()
    local l = redis.call('LRANGE', KEYS[1], 0, -1)
    local i = tonumber(ARGV[1]) + 1
    local v = table.remove(l, i)
    redis.call('DEL', KEYS[1])
    redis.call('RPUSH', KEYS[1], unpack(l))
    return v
end
{% endhighlight %}

Now my actual application is written in Python, so what I do next is extend the [redis-py][redis-py] client to support loading my Lua functions, and calling them directly by name:

{% highlight python %}
import redis

class LuaRedisClient(redis.Redis):

    def __init__(self, *args, **kwargs):
        super(LuaRedisClient, self).__init__(*args, **kwargs)
        for name, snippet in self._get_lua_funcs():
            self._create_lua_method(name, snippet)

    def _get_lua_funcs(self):
        """
        Returns the name / code snippet pair for each Lua function
        in the atoms.lua file.
        """
        with open("atoms.lua", "r") as f:
            for func in f.read().strip().split("function "):
                if func:
                    bits = func.split("\n", 1)
                    name = bits[0].split("(")[0].strip()
                    snippet = bits[1].rsplit("end", 1)[0].strip()
                    yield name, snippet

    def _create_lua_method(self, name, snippet):
        """
        Registers the code snippet as a Lua script, and binds the
        script to the client as a method that can be called with
        the same signature as regular client methods, eg with a
        single key arg.
        """
        script = self.register_script(snippet)
        method = lambda key, *a, **k: script(keys=[key], args=a, **k)
        setattr(self, name, method)
{% endhighlight %}

There's no magic language interoperability going on here - just a little library sugar for dealing with Lua functions by name. The function name is actually stripped entirely from the Lua code we provide to Redis - that's how Lua scripts work in Redis, they're simply chunks of procedural code, an important point that will come into play with our overall approach for embedding third-party libraries.

With that in place, we can now call the atomic `list_pop` Lua function directly from the Python client:

{% highlight python %}
>>> client = LuaRedisClient()
>>> client.rpush("key", "foo", "bar", "baz")
>>> client.list_pop("key", 1)
'bar'
{% endhighlight %}

#### Lua AND Redis AND Bitwise Operators

As mentioned above, version 5.1 of Lua which Redis embeds doesn't contain bitwise operators, however they're available via third-party libraries. The one I chose to work with is a library called [LuaBit][luabit]. It's worth mentioning that a requirement for this hack to work, is that any external Lua libraries we plan to use must be written purely in Lua and not in C. Fortunately LuaBit fits this bill.

Now again, considering Lua scripts in Redis are simply great big strings of code, the solution for embedding LuaBit becomes obvious: we simply modify our extended Python client to inject the parts of the library we need into each Redis script that requires it:

{% highlight python %}
import redis

class LuaRedisClient(redis.Redis):

    def __init__(self, *args, **kwargs):
        super(LuaRedisClient, self).__init__(*args, **kwargs)
        requires_luabit = ("number_and", "number_or", "number_xor",
                           "number_lshift", "number_rshift")
        with open("bit.lua", "r") as f:
            luabit = f.read()
        for name, snippet in self._get_lua_funcs():
            if name in requires_luabit:
                snippet = luabit + snippet
            self._create_lua_method(name, snippet)

    def _get_lua_funcs(self):
        """
        Returns the name / code snippet pair for each Lua function
        in the atoms.lua file.
        """
        with open("atoms.lua", "r") as f:
            for func in f.read().strip().split("function "):
                if func:
                    bits = func.split("\n", 1)
                    name = bits[0].split("(")[0].strip()
                    snippet = bits[1].rsplit("end", 1)[0].strip()
                    yield name, snippet

    def _create_lua_method(self, name, snippet):
        """
        Registers the code snippet as a Lua script, and binds the
        script to the client as a method that can be called with
        the same signature as regular client methods, eg with a
        single key arg.
        """
        script = self.register_script(snippet)
        method = lambda key, *a, **k: script(keys=[key], args=a, **k)
        setattr(self, name, method)
{% endhighlight %}

I've simply defined the list of all the Lua function names that reference LuaBit, in the `requires_luabit` variable. When each of these functions get registered in Redis, the source for LuaBit gets injected into them. A great big monstrous hack, no doubt.

One final requirement was modifying the function signatures inside LuaBit. Lua scripts in Redis are restricted from function statements, but we can work around this by converting any of these into anonymous function definitions:

{% highlight lua %}
-- Original function statement
local function bit_and(m, n)
    ...
end

-- Converted to an anonymous function
local bit_and = function(m, n)
    ...
end
{% endhighlight %}

That's it. My method here for determining dependencies is as crude as you could get. Extending this further using a [directed graph][directed-graph] would not require much more work, and would allow for much more complicated dependency hierarchies.

[lua]: http://www.lua.org/
[python]: http://python.org
[javascript]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[ruby]: http://www.ruby-lang.org
[algol-based]: http://en.wikipedia.org/wiki/Generational_list_of_programming_languages#ALGOL_based
[object-oriented]: http://en.wikipedia.org/wiki/Object-oriented_programming
[dynamically-typed]: http://en.wikipedia.org/wiki/Dynamic_language
[interpreted]: http://en.wikipedia.org/wiki/Interpreter_(computing)
[first-class-functions]: http://en.wikipedia.org/wiki/First-class_functions
[redis]: http://redis.io
[two-queues]: /2013/02/23/a-tale-of-two-queues/
[memcached]: http://memcached.org/
[redis-hsetnx]: http://redis.io/commands/hsetnx
[redis-incr]: http://redis.io/commands/incr
[redis-multi]: http://redis.io/commands/multi
[redis-watch]: http://redis.io/commands/watch
[bitwise]: http://en.wikipedia.org/wiki/Bitwise_operation
[lua-bitwise-5-2]: http://www.lua.org/manual/5.2/manual.html#6.7
[redis-issue-lua-upgrade]: https://github.com/antirez/redis/issues/253
[lua-bitwise-third-party]: http://lua-users.org/wiki/BitwiseOperators
[redis-py]: https://github.com/andymccurdy/redis-py
[redis-lua-upgrade]: http://github.com/antirez
[luabit]: http://luaforge.net/projects/bit/
[directed-graph]: /2012/04/06/topological-sorting-acyclic-directed-graphs/
