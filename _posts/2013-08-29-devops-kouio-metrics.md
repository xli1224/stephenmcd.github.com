---
layout: post
title: 'DevOps at Kouio: Metrics'
tags:
- python
- statsd
- graphite
- devops
- metrics
- monitoring
- kouio
- django
- node.js
- redis
- hacks
---

It's been almost two months since [Adam O'Byrne][adam] and I launched [Kouio, a Google Reader replacement][kouio] we've built together. It's been a wild ride and we've both learnt a lot in a very short period of time. With Kouio, we've had the blessing of what I refer to as _DevOps by default_, the all too common scrappy start-up scenario, where only a single engineer (in this case yours truly) has built the back-end application, while also being responsible for all operational aspects such as provisioning servers, installing and tuning services, monitoring, and everything else involved in keeping the application up and running smoothly. What I'll talk about in this post is the monitoring aspect - the hows and whys of what has worked really well for us.

First a little background. Looking at the user interface for Kouio, you'll find it primarily revolves around a single page web app, which on the surface looks fairly simplistic, but contains many components hidden away behind the scenes, all working together to bring you the magic:

* The public website (blog, documentation, etc)
* [RESTful API][rest-api] which serves both the client app plus third-party apps
* [WebSocket][websockets] server which provides real-time feed updates
* Cache service for session data and frequently accessed content
* Primary database, which stores among other things, the [RSS][rss] feeds themselves, and the tens and tens of millions of related articles
* Queueing system that manages both the [pub-sub][pub-sub] service for real-time feed updates, and the worker queues that take care of a variety of tasks, such as:
* Retrieving RSS feeds
* Retrieving website icons
* Exporting articles to external services ([Evernote][evernote], [Readbility][readability], etc)
* Payment processing

As you can see, there are a lot of moving pieces involved in bringing together a simple looking RSS reader. With such a variety of distinct components, an obvious problem we face is visibility - how exactly can we know what all the pieces of the system are doing at one point in time? How can we visualise the state of the entire system coherently as a whole?

#### Graphite / StatsD

I decided to solve this problem using the popular software combination of [Graphite][graphite] and [StatsD][statsd]. Graphite is a tool that deals with storing time-series metrics, as well as providing a very powerful graphing interface (built with [Django][django] no less) for visualising and reporting on metrics collected. StatsD which is built with [Node.js][node] then provides the service for collecting event streams over [UDP][udp], and aggregating collected metrics at high volume.

These tools appealed to me for several reasons. Firstly I wanted something highly hackable that we could customise to fit our needs. StatsD and each of the different Graphite components all follow the [Unix philosophy of doing one thing, and doing it very well][unix-philosophy]. Not only that, given they're built with [Python][python] and [JavaScript][javascript] which Adam and I are very experienced in, the Graphite / StatsD pair seemed like our best bet in terms of customisation, over larger _all encompassing_ monitoring systems backed by plug-ins, such as [Nagios][nagios] or [Munin][munin]. Secondly these tools were built and expanded upon by companies with a great open source culture at large scale, places like [Orbitz][orbitz], [Etsy][etsy], and even [Mozilla][mozilla], who released [django-statsd][django-statsd] for [monitoring the Firefox Add-ons Marketplace][monitoring-firefox-addons], which we're now also using with great results.

#### Collecting Metrics

With Graphite and StatsD installed, the final step involved was actually collecting metrics. Mozilla's django-statsd package gives you a lot out of the box here. Without any configuration, it automatically adds counters and timers to many areas of Django, such as the ORM, caching and unit tests. The really interesting integration though is at the view layer. Counters and timing metrics are collected for all view functions, with each metric further segmented in a ton of ways, from the application name and URL parts, right down to the HTTP verbs used and status codes returned - all incredibly insightful for an application like Kouio that implements a public-facing RESTful API.

Monitoring the Django application was only half of the picture though. I still needed to capture system level metrics and other miscellaneous parts of our application state. I found a handful of open source projects available related to collecting metrics into Graphite, but instead of using any of these I opted to put together a quick solution using the [psutil][psutil] Python library:

{% highlight python %}
import os
import time

from django.conf import settings
from django.contrib.auth.models import User
from django.core.management.base import NoArgsCommand
from django.db.models import Sum
import psutil
import redis
import statsd

# The getsentry.com client
from raven.contrib.django.raven_compat.models import client as raven_client

from kouio.feeds.models import Feed, Item


statsd_client = statsd.StatsClient()
redis_client  = redis.Redis()
last_disk_io  = psutil.disk_io_counters()
last_net_io   = psutil.net_io_counters()
time.sleep(1)

def io_change(last, current):
    return dict([(f, getattr(current, f) - getattr(last, f))
                 for f in last._fields])

while True:

    memory          = psutil.phymem_usage()
    disk            = psutil.disk_usage("/")
    disk_io         = psutil.disk_io_counters()
    disk_io_change  = io_change(last_disk_io, disk_io)
    net_io          = psutil.net_io_counters()
    net_io_change   = io_change(last_net_io, net_io)
    last_disk_io    = disk_io
    last_net_io     = net_io

    gauges = {
        "memory.used":        memory.used,
        "memory.free":        memory.free,
        "memory.percent":     memory.percent,
        "cpu.percent":        psutil.cpu_percent(),
        "load":               os.getloadavg()[0],
        "disk.size.used":     disk.used,
        "disk.size.free":     disk.free,
        "disk.size.percent":  disk.percent,
        "disk.read.bytes":    disk_io_change["read_bytes"],
        "disk.read.time":     disk_io_change["read_time"],
        "disk.write.bytes":   disk_io_change["write_bytes"],
        "disk.write.time":    disk_io_change["write_time"],
        "net.in.bytes":       net_io_change["bytes_recv"],
        "net.in.errors":      net_io_change["errin"],
        "net.in.dropped":     net_io_change["dropin"],
        "net.out.bytes":      net_io_change["bytes_sent"],
        "net.out.errors":     net_io_change["errout"],
        "net.out.dropped":    net_io_change["dropout"],
        "queue.pending":      redis_client.llen("kouio-feed-list"),
        "totals.users":       User.objects.count(),
        "totals.feeds":       Feed.objects.count(),
        "totals.items":       Item.objects.count(),
    }

    thresholds = {
        "memory.percent":     80,
        "disk.size.percent":  90,
        "queue.pending":      20000,
        "load":               20,
    }

    for name, value in gauges.items():
        print name, value
        statsd_client.gauge(name, value)
        threshold = thresholds.get(name, None)
        if threshold is not None and value > threshold:
            bits = (threshold, name, value)
            message = "Threshold of %s reached for %s: %s" % bits
            print message
            raven_client.captureMessage(message)

    time.sleep(1)
{% endhighlight %}

Writing our own code here affords us full flexibility. We're able to integrate directly with Django's ORM and [Redis][redis] to keep track of growth and other parts of state within the system. You'll see we also implement some basic threshold monitoring. We're able to keep this as simple as you could imagine by integrating it with [Sentry][sentry], the system we use for tracking exceptions in the application. By treating these thresholds as application exceptions, we don't need to worry about our threshold checks spiralling out of control with millions of notifications - that's all handled for us by Sentry.

How does this all look once it's up and running? It's worth mentioning installation was hardly straight-forward, requiring half a dozen components sourced and built in different ways - one of the downsides of not using an off-the-shelf product. Once everything was set up though, I really went to town with our initial dashboard, arranging and colourising every single metric I thought remotely useful:

<em class="center"><a class="no-pjax" href="/static/img/metrics1-large.png"><img src="/static/img/metrics1.png"></a></em>

After a couple of weeks, I was able to greatly refine the dashboard, adding new metrics as I discovered them, and throwing out a ton that didn't turn out as useful as I originally thought, ending up with a more useful dashboard:

<em class="center"><a class="no-pjax" href="/static/img/metrics2-large.png"><img src="/static/img/metrics2.png"></a></em>

Mission accomplished. I was then able to perform lots of different experiments around tuning our database, workers and RESTful API, while visualising the effect on the system as a whole:

<em class="center"><a class="no-pjax" href="/static/img/metrics3-large.png"><img src="/static/img/metrics3.png"></a></em>

Incidentally, the best performance gains involved re-working our query indexes, as well as some awful little tricks using [PostgreSQL CTEs][postgresql-ctes] - but that's a story for another post.

#### Real-time Graphs

What good is all of this if we can't watch the graphs animate pixel by pixel as seconds tick by? Graphite provides a really powerful API for producing graphs, however the output is still static PNG files. What I did was modify the [Graphite dashboard template][graphite-dashboard-template] with the following JavaScript snippet, which iterates through each of the graphs and reloads them one by one in succession, producing the desired effect:

{% highlight javascript %}
var current = -1;
var container = document.getElementsByClassName('graph-area-body')[0];
var imgs = container.getElementsByTagName('img');

setInterval(function() {
    current += 1;
    if (current >= imgs.length) {
        current = 0;
    }
    var rand = '&rand=' + Math.random();
    imgs[current].src = imgs[current].src.split('&rand=')[0] + rand;
}, 1000);
{% endhighlight %}

[adam]: https://twitter.com/adamobyrne
[kouio]: https://kouio.com
[rest-api]: http://en.wikipedia.org/wiki/Representational_state_transfer#RESTful_web_APIs
[websockets]: http://en.wikipedia.org/wiki/WebSocket
[rss]: http://en.wikipedia.org/wiki/RSS
[pub-sub]: http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern
[evernote]: http://evernote.com
[readability]: http://readability.com/
[graphite]: http://graphite.wikidot.com/
[statsd]: https://github.com/etsy/statsd/
[django]: https://www.djangoproject.com/
[node]: http://nodejs.org
[udp]: http://en.wikipedia.org/wiki/User_Datagram_Protocol
[unix-philosophy]: http://en.wikipedia.org/wiki/Unix_philosophy
[python]: http://python.org
[javascript]: http://en.wikipedia.org/wiki/JavaScript
[nagios]: http://www.nagios.org
[munin]: http://munin-monitoring.org
[orbitz]: http://www.infoq.com/news/2008/06/orbitz-opensource-erma
[etsy]: http://codeascraft.com/2011/02/15/measure-anything-measure-everything/
[mozilla]: http://www.mozilla.org/
[django-statsd]: https://github.com/andymckay/django-statsd
[monitoring-firefox-addons]: http://blog.mozilla.org/webdev/2012/01/06/timing-amo-user-experience/
[psutil]: https://pypi.python.org/pypi/psutil
[redis]: http://redis.io
[sentry]: https://getsentry.com
[postgresql-ctes]: http://www.postgresql.org/docs/9.2/static/queries-with.html
[graphite-dashboard-template]: https://github.com/graphite-project/graphite-web/blob/master/webapp/graphite/templates/dashboard.html
