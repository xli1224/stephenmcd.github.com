---
layout: post
title: Higher Order Types for Redis
tags:
- redis
- python
- kouio
- data structures
---

Several months ago I wrote about an approach I came up with for embedding [Lua][lua] libraries in [Redis][redis], in my post [Bitwise Lua Operations in Redis][bitwise-lua-redis]. At the time I was developing a library that would allow me to use regular [Python types][python-types] such as lists and sets, which would then be backed by Redis each time they were modified. The end goal was to be able to compose these types together, to form the structures I needed for [Kouio, the RSS reader][kouio] that [Adam O'Byrne][adam] and I have built together. Things like a [FIFO queue][fifo-queue] that would only accept unique items, while supporting blocking operations with timeouts, [multisets][multiset] for storing unread counts, and more.

I wanted a library that would let me build these components in a natural way, without having to deal with each of the underlying Redis commands. The end result I came up with is called [HOT Redis][hot-redis], which originally stood for *Higher Order Types for Redis*, specifically, types backed by Redis that could be used to build richer composite types. Some may argue that what I've built doesn't meet the [strict definition of higher order types][higher-order-types], such as those found in languages like [Scala][scala] and [Haskell][haskell], in which case the recursive acronym *HOT Object Toolkit for Redis* can be used, which should appease the most luscious of bearded necks.

#### Usage

Each of the types provided by HOT Redis strive to implement the same method signatures and return values as their Python built-in and standard library counterparts. The main difference is each type's ``__init__`` method. Every HOT Redis type's ``__init__`` method will optionally accept ``initial`` and ``key`` keyword arguments, which are used for defining an initial value to be stored in Redis for the object, and the key that should be used, respectively. If no key is provided, a key will be generated, which can then be accessed via the ``key`` attribute:

{% highlight python %}
>>> from hot_redis import List
>>> my_list = List()
>>> my_list.key
'93366bdb-90b2-4226-a52a-556f678af40e'
>>> my_list_with_key = List(key="foo")
>>> my_list_with_key.key
'foo'
{% endhighlight %}

Once you've determined a strategy for naming keys, you can then create HOT Redis objects and interact with them over the network, for example here is a ``List`` created on a computer we'll refer to as computer A:

{% highlight python %}
>>> list_on_computer_a = List(key="foo", initial=["a", "b", "c"])
{% endhighlight %}

then on another computer we'll creatively refer to as computer B:

{% highlight python %}
>>> list_on_computer_b = List(key="foo")
>>> list_on_computer_b[:]  # Performs: LRANGE foo 0 -1
['a', 'b', 'c']
>>> list_on_computer_b += ['d', 'e', 'f']  # Performs: RPUSH foo d e f
{% endhighlight %}

and back to computer A:

{% highlight python %}
>>> list_on_computer_a[:]  # Performs: LRANGE foo 0 -1
['a', 'b', 'c', 'd', 'e', 'f']
>>> 'c' in list_on_computer_a  # Works like Python lists where expected
True
>>> list_on_computer_a.reverse()
>>> list_on_computer_a[:]
['f', 'e', 'd', 'c', 'b', 'a']
{% endhighlight %}

The last interaction here is an interesting one. Python's ``list.reverse()`` is an in-place reversal of the list, that is, it modifies the existing list, rather than returning a reversed copy. If we were to implement this naively, we would first read the list from Redis, reverse it locally, then store the reversed list back in Redis again. But what if another client were to modify the list at approximately the same time? One computer's modification to the list would certainly overwrite the other's. In this scenario, and *many* others, HOT Redis provides its own Lua routine specifically for reversing the list in-place, within Redis atomically.

#### Data Types

The following table is the complete list of types provided by HOT Redis, mapped to their Python counterparts and underlying Redis types, along with any special considerations worth noting.

<table class="table table-striped">
<thead valign="bottom"><tr>
<th>HOT Redis</th>
<th>Python</th>
<th>Redis</th>
<th>Notes</th>
</tr></thead>
<tbody valign="top">
<tr>
<td>List</td>
<td>list</td>
<td>list</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>Set</td>
<td>set</td>
<td>set</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>Dict</td>
<td>dict</td>
<td>hash</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>String</td>
<td>string</td>
<td>string</td>
<td>Mutable - string methods that normally create a new string object in Python will mutate the string stored in Redis</td>
</tr>
<tr>
<td>ImmutableString</td>
<td>string</td>
<td>string</td>
<td>Immutable - behaves like a regular Python string</td>
</tr>
<tr>
<td>Int</td>
<td>int</td>
<td>int</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>Float</td>
<td>float</td>
<td>float</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>Queue</td>
<td>Queue.Queue</td>
<td>list</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>LifoQueue</td>
<td>Queue.LifoQueue</td>
<td>list</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>SetQueue</td>
<td>N/A</td>
<td>list + set</td>
<td>Extension of <code>Queue</code> with unique members</td>
</tr>
<tr>
<td>LifoSetQueue</td>
<td>N/A</td>
<td>list + set</td>
<td>Extension of <code>LifoQueue</code> with unique members</td>
</tr>
<tr>
<td>BoundedSemaphore</td>
<td>threading.BoundedSemaphore</td>
<td>list</td>
<td>Extension of <code>Queue</code> leveraging Redis' blocking list pop operations with timeouts, while using Queue's <code>maxsize</code> arg to provide BoundedSemaphore's <code>value</code> arg</td>
</tr>
<tr>
<td>Semaphore</td>
<td>threading.Semaphore</td>
<td>list</td>
<td>Extension of <code>BoundedSemaphore</code> without a queue size</td>
</tr>
<tr>
<td>Lock</td>
<td>threading.Lock</td>
<td>list</td>
<td>Extension of <code>BoundedSemaphore</code> with a queue size of 1</td>
</tr>
<tr>
<td>RLock</td>
<td>threading.RLock</td>
<td>list</td>
<td>Extension of <code>Lock</code> allowing multiple <code>acquire</code> calls</td>
</tr>
<tr>
<td>DefaultDict</td>
<td>collections.DefaultDict</td>
<td>hash</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>MultiSet</td>
<td>collections.Counter</td>
<td>hash</td>
<td>&nbsp;</td>
</tr>
</tbody>
</table>

#### Conclusion

That's all for now, but I'm really keen to grow the range of data structures provided by HOT Redis. One of the nice things about such a narrowly defined library like this is the ability to craft a [very thorough test suite][hot-redis-tests], simply by executing every method on every type, and doing the same for each of the Python built-in and standard library counterparts, finally comparing the results. This should really ease contributing new types - so if you have any ideas for additions, [go right ahead and dive in][hot-redis].

[lua]: http://www.lua.org/
[redis]: http://redis.io
[bitwise-lua-redis]: /2013/06/12/bitwise-lua-operations-in-redis/
[python-types]: http://docs.python.org/3/library/stdtypes.html
[fifo-queue]: http://en.wikipedia.org/wiki/FIFO_(computing)
[multiset]: http://en.wikipedia.org/wiki/Multiset
[hot-redis]: https://github.com/stephenmcd/hot-redis
[higher-order-types]: http://en.wikipedia.org/wiki/Kind_(type_theory)
[scala]: http://www.scala-lang.org/
[haskell]: http://www.haskell.org/
[kouio]: https://kouio.com
[adam]: https://twitter.com/adamobyrne
[hot-redis-tests]: https://github.com/stephenmcd/hot-redis/blob/master/hot_redis/tests.py
