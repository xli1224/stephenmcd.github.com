---
layout: post
title: "Does Mezzanine Scale?"
---

The question of scalability with regard to
[Mezzanine](http://mezzanine.jupo.org/) and
[Django](https://www.djangoproject.com/) recently came on up on the
[mezzanine-users mailing list](http://groups.google.com/group/mezzanine-
users/topics), to which I offered the following reply.

Mezzanine and Django itself are fantastic choices for someone concerned with
scaling for high traffic.

The [Mozilla add-ons](https://addons.mozilla.org) site that hosts all Firefox
plugins, and [Disqus](http://disqus.com/) which is currently the world's
highest traffic commenting system, both run on Django. Each of these have been
quoted at [500 million hits per day](http://www.djangocon.eu/talks/18/) and [1
billion per month](http://www.quora.com/Django/What-is-the-highest-traffic-
website-built-on-top-of-Django) respectively.

One of the keys to scaling sites like these is the wealth of options available
for caching in the Django ecosystem, and the ability to then scale out the
number of both application servers running Django, and caching servers
typically running [memcached](http://memcached.org/), with very little
modification to your application code. Django comes out-of-the-box with the
ability to switch on [site-wide
caching](https://docs.djangoproject.com/en/1.3/topics/cache/#the-per-site-
cache), [per page caching](https://docs.djangoproject.com/en/1.3/topics/cache
/#the-per-view-cache) and [template fragment
caching](https://docs.djangoproject.com/en/1.3/topics/cache/#template-
fragment-caching). Beyond that there are also third-party Django applications
that implement object level caching such as [Django Cache
Machine](http://jbalogh.me/projects/cache-machine/) and [Johnny
Cache](http://packages.python.org/johnny-cache/), for even finer-grained
control with little modification to your code.

Both Mezzanine and [Cartridge](http://cartridge.jupo.org/) have been designed
from the ground up with scalability in mind. Particular care has been taken to
avoid any [n+1 queries](http://www.pbell.com/index.cfm/2006/9/17
/Understanding-the-n1-query-problem), for example rendering out multiple
instances of Mezzanine's navigation tree containing any number of nested
levels of navigation will only ever run a single database query. Same with
Cartridge's products. What this means is that you can go very far traffic-
wise, using a single server without even thinking about caching. Once you do
then the ability to add application and cache servers is trivial, and will
take you incredibly far using a single database. Once you start needing
multiple database servers Django also comes with the built-in ability to
[route models across different
databases](https://docs.djangoproject.com/en/1.3/topics/db/multi-db/), so
there are extra options there beyond your typical master/slave database
replication scenario.

I've only touched on the topic to provide an overview of what's available, and
you should certainly research it further for your particular scenario, but as
you can see scalability is a core concern baked into Django and Mezzanine, so
you can choose these with confidence.

