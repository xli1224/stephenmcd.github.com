---
layout: post
title: Django Dash 2012 Round-Up
tags:
- python
- django
- django dash
---

The [Django Dash for 2012](django-dash) is now over, and once again it was a ton of fun! The Dash is a 48 hour coding competition for teams of up to three, competing to see who can build the best Django application over a weekend. To top it off, all of the entries are made available as open source.

This year I went solo for the first time, which made it quite gruelling as I had to handle everything from back-end code, interface development, and visual design. I decided to follow the same recipe as our 3rd place entry from last year, [Drawn By](drawnby), specifically by creating an environment where people can
come together and interact in real-time using [WebSockets](websockets). I named my entry [GAMBLOR](gamblor) - it's an online casino where people can move around and chat with each other, while playing casino games with fake money. Check out [GAMBLOR](gamblor) as well as the [source code](gamblor-github) if you're interested, and you can see the game plugin system I built to power the initial games implemented: roulette and craps.

Apart from the staples of [Django](django) and [jQuery](jquery), here are some of the components I used that made GAMBLOR possible in such a short amount of time:

* [gevent-socketio](gevent-socketio) - Provides the Python implementation of [socket.io](socketio), allowing real-time activity to occur in the browser using WebSockets.
* [Redis](redis) - A NoSQL database, similar to [memcached](memcached) but with richer data structures.
* [CSS3](css3) - The design was implemented almost entirely without graphics, using many CSS3 features such as shadows, background gradients, and even 3D transforms for the gaming chips.
* [jquery-transit](jquery-transit) - A library for advanced JavaScript animations, which powered the roulette wheel rotation.
* [jquery-collision](jquery-collision) - Provides collision detection for browser objects, which allowed for avatar movement to be constrained within the game area and around the game tables.

I've put together a table below that lists all of the final entries, with links to their sites and source code. I left out any entries that didn't contain a working site, or didn't seem to function. If I've missed any or you have any other corrections, please [let me know](stephenmcd).

It's interesting to look at some of the recurring themes present within all of the entries. There were multiple entries that fell under each of the following ideas:

* Cloud server management - *Cloud Fish, Gungnir*
* GitHub mashups - *Badger, Heroes of Git & Hub, Mosaic, Try Box*
* Tutorial/class creation - *Django Tutorial, Try Box, Try Try, Tutor Us*
* Photo mashups - *Gif Feed, Green Room, Lemidora, Miracles Live, The Busitizer*
* Portfolio generation - *Folio Bag, Mosaic*
* Map mashups - *Kirchenreich, Quester*

My definite favourites are [Heroes of Git & Hub](heroes-github), which lets you battle your open source projects against others in a D&D style game, and [The Busitizer](busitizer) which I'll just leave for you to check out for yourself.

<table class="zebra-striped">
<tr>
    <th>Title</th>
    <th>Description</th>
    <th class="r">Team Size</th>
    <th></th>
    <th></th>
</tr>
<tr>
  <td>API Tester</td>
  <td><em>Automated tests for APIs</em></td>
  <td class="r">3</td>
  <td><a href="http://apitester.com/">Site</a></td>
  <td><a href="https://github.com/elegion/djangodash2012">Source</a></td>
</tr>
<tr>
  <td>Badger</td>
  <td><em>Get badges for open source</em></td>
  <td class="r">3</td>
  <td><a href="http://badger.timeho.me/">Site</a></td>
  <td><a href="https://github.com/timehome/djangodash2012">Source</a></td>
</tr>
<tr>
  <td>Black Hole</td>
  <td><em>Mail web-app</em></td>
  <td class="r">3</td>
  <td><a href="http://bhwsg.djangostars.com/">Site</a></td>
  <td><a href="https://github.com/romanosipenko/bhwsg">Source</a></td>
</tr>
<tr>
  <td>Cloud Fish</td>
  <td><em>Cloud server manager</em></td>
  <td class="r">3</td>
  <td><a href="http://djangodash2012.daltonmatos.com/">Site</a></td>
  <td><a href="https://github.com/losmiserables/djangodash2012">Source</a></td>
</tr>
<tr>
  <td>Comminator</td>
  <td><em>Hacker News clone</em></td>
  <td class="r">1</td>
  <td><a href="http://djangodash2012.herokuapp.com/">Site</a></td>
  <td><a href="https://github.com/noamsu/djangodash2012">Source</a></td>
</tr>
<tr>
  <td>Crowd Photo</td>
  <td><em>Crowd sourcing photos</em></td>
  <td class="r">2</td>
  <td><a href="http://crowdphoto.org/">Site</a></td>
  <td><a href="https://github.com/buddylindsey/photo-blogger">Source</a></td>
</tr>
<tr>
  <td>Django Gallery</td>
  <td><em>App store for photos</em></td>
  <td class="r">1</td>
  <td><a href="http://jy397.o1.gondor.io/">Site</a></td>
  <td><a href="https://bitbucket.org/mzcomiter/mzcomiterdjangodash">Source</a></td>
</tr>
<tr>
  <td>Django Tutorial</td>
  <td><em>Interactive Django tutorial</em></td>
  <td class="r">3</td>
  <td><a href="http://dj.kuban.pro/">Site</a></td>
  <td><a href="https://github.com/genbit/djangodash2012">Source</a></td>
</tr>
<tr>
  <td>Folio Bag</td>
  <td><em>Portfolio generator</em></td>
  <td class="r">1</td>
  <td><a href="http://enigmatic-temple-5417.herokuapp.com/">Site</a></td>
  <td><a href="https://github.com/krkmetal/djangodash2012">Source</a></td>
</tr>
<tr>
  <td>Folivora</td>
  <td><em>Dependency manager</em></td>
  <td class="r">3</td>
  <td><a href="http://folivora.herokuapp.com/">Site</a></td>
  <td><a href="https://github.com/rocketDuck/folivora">Source</a></td>
</tr>
<tr>
  <td>GAMBLOR</td>
  <td><em>Real-time multi-user casino</em></td>
  <td class="r">1</td>
  <td><a href="http://gamblor.jupo.org">Site</a></td>
  <td><a href="https://github.com/stephenmcd/gamblor">Source</a></td>
</tr>
<tr>
  <td>Gif Feed</td>
  <td><em>Collection of Gifs</em></td>
  <td class="r">1</td>
  <td><a href="http://www.giffeed.com/">Site</a></td>
  <td><a href="https://github.com/dudarev/giffeed">Source</a></td>
</tr>
<tr>
  <td>Green Room</td>
  <td><em>Dressing room opinion app</em></td>
  <td class="r">3</td>
  <td><a href="http://mygreenroom.herokuapp.com/">Site</a></td>
  <td><a href="https://github.com/virtuallight/greenroom">Source</a></td>
</tr>
<tr>
  <td>Gungnir</td>
  <td><em>Cloud server manager</em></td>
  <td class="r">3</td>
  <td><a href="http://gungnir.me/">Site</a></td>
  <td><a href="https://github.com/jawnb/badatcomputers">Source</a></td>
</tr>
<tr>
  <td>Heroes of Git & Hub</td>
  <td><em>Battles of Github projects</em></td>
  <td class="r">2</td>
  <td><a href="http://hgh.dev8.ru/">Site</a></td>
  <td><a href="https://github.com/quantum13/hgh">Source</a></td>
</tr>
<tr>
  <td>Ipse Dixit</td>
  <td><em>Collection of quotes</em></td>
  <td class="r">3</td>
  <td><a href="http://intense-cliffs-3966.herokuapp.com/">Site</a></td>
  <td><a href="https://github.com/rollstudio/DjangoDash">Source</a></td>
</tr>
<tr>
  <td>Kirchenreich</td>
  <td><em>Maps mashup for churches</em></td>
  <td class="r">3</td>
  <td><a href="http://turmfalke.kirchenreich.org/">Site</a></td>
  <td><a href="https://github.com/mfa/kirchenreich">Source</a></td>
</tr>
<tr>
  <td>Lemidora</td>
  <td><em>Photo sharing</em></td>
  <td class="r">3</td>
  <td><a href="http://lemidora.com/">Site</a></td>
  <td><a href="https://github.com/webriders/octoblog">Source</a></td>
</tr>
<tr>
  <td>Lictor</td>
  <td><em>Stack trace visualizer</em></td>
  <td class="r">3</td>
  <td><a href="http://lictor.tetronix.org/">Site</a></td>
  <td><a href="https://github.com/ussi/django-lictor">Source</a></td>
</tr>
<tr>
  <td>Like I'm 5ive</td>
  <td><em>Dictionary / wiki tool</em></td>
  <td class="r">3</td>
  <td><a href="http://www.likeim5ive.com/">Site</a></td>
  <td><a href="https://github.com/checoze/like-im-5ive">Source</a></td>
</tr>
<tr>
  <td>Miracles Live</td>
  <td><em>Instagram/Flickr mashup of world wonders</em></td>
  <td class="r">3</td>
  <td><a href="http://miracleslive.com/">Site</a></td>
  <td><a href="https://github.com/Chodex/djangodash2012">Source</a></td>
</tr>
<tr>
  <td>Mosaic</td>
  <td><em>Open source project portfolio generator</em></td>
  <td class="r">2</td>
  <td><a href="http://zh246.o1.gondor.io/">Site</a></td>
  <td><a href="https://github.com/sema/django-2012">Source</a></td>
</tr>
<tr>
  <td>Old Mail</td>
  <td><em>Group email collboration</em></td>
  <td class="r">3</td>
  <td><a href="http://www.theoldmail.com/">Site</a></td>
  <td><a href="https://github.com/jmoswalt/djangodash2012">Source</a></td>
</tr>
<tr>
  <td>Pelican Migrator</td>
  <td><em>Migrate blogs to Pelican</em></td>
  <td class="r">3</td>
  <td><a href="http://djangodash12.trilandev.com/">Site</a></td>
  <td><a href="https://github.com/xobb1t/djangodash12">Source</a></td>
</tr>
<tr>
  <td>Project Starter</td>
  <td><em>Landing page generator</em></td>
  <td class="r">2</td>
  <td><a href="http://projectstarter.herokuapp.com/">Site</a></td>
  <td><a href="https://github.com/ivanvpenchev/project-starter">Source</a></td>
</tr>
<tr>
  <td>Promisely</td>
  <td><em>Collection of promises</em></td>
  <td class="r">3</td>
  <td><a href="http://promise.ly/">Site</a></td>
  <td><a href="https://github.com/triple-threat/django-dash">Source</a></td>
</tr>
<tr>
  <td>Publican</td>
  <td><em>Business ledger app</em></td>
  <td class="r">1</td>
  <td><a href="http://publican.rhodesmill.org/">Site</a></td>
  <td><a href="https://github.com/brandon-rhodes/publicanus">Source</a></td>
</tr>
<tr>
  <td>Quester</td>
  <td><em>Create quest games on a world map</em></td>
  <td class="r">3</td>
  <td><a href="http://quester.me/">Site</a></td>
  <td><a href="https://github.com/OShalakhin/quester-me">Source</a></td>
</tr>
<tr>
  <td>Red Check</td>
  <td><em>Spell checker for websites</em></td>
  <td class="r">3</td>
  <td><a href="http://www.redcheck.org/">Site</a></td>
  <td><a href="https://bitbucket.org/ruslanbakiev/djangodash">Source</a></td>
</tr>
<tr>
  <td>Slug.in</td>
  <td><em>Custom URL shortener</em></td>
  <td class="r">3</td>
  <td><a href="http://slug.in/">Site</a></td>
  <td><a href="https://github.com/yetizzz/zzz">Source</a></td>
</tr>
<tr>
  <td>Tamli</td>
  <td><em>Social bookmarking</em></td>
  <td class="r">1</td>
  <td><a href="http://peaceful-atoll-3989.herokuapp.com/">Site</a></td>
  <td><a href="https://github.com/aldeka/gentlerobots">Source</a></td>
</tr>
<tr>
  <td>The Busitizer</td>
  <td><em>Add Gary Busey to Facebook photos</em></td>
  <td class="r">3</td>
  <td><a href="http://busitizer.com/">Site</a></td>
  <td><a href="https://github.com/csinchok/busitizer">Source</a></td>
</tr>
<tr>
  <td>The Hack Box</td>
  <td><em>Hackathon manager</em></td>
  <td class="r">3</td>
  <td><a href="http://thehackbox.com/">Site</a></td>
  <td><a href="https://github.com/rootart/hackbox">Source</a></td>
</tr>
<tr>
  <td>Try Box</td>
  <td><em>Online IDE for programming tutorials</em></td>
  <td class="r">3</td>
  <td><a href="http://try-box.com/">Site</a></td>
  <td><a href="https://github.com/sophilabs/try-django">Source</a></td>
</tr>
<tr>
  <td>Try Try</td>
  <td><em>Interactive programming tutorials</em></td>
  <td class="r">2</td>
  <td><a href="http://www.try-try.me/">Site</a></td>
  <td><a href="https://github.com/imankulov/trytry">Source</a></td>
</tr>
<tr>
  <td>Tutor Us</td>
  <td><em>Create & run online classes</em></td>
  <td class="r">3</td>
  <td><a href="http://rocky-brook-2492.herokuapp.com/">Site</a></td>
  <td><a href="https://github.com/reinbach/tutorus">Source</a></td>
</tr>
<tr>
  <td>Wikipedia Analytics</td>
  <td><em>Create charts from Wikipedia data</em></td>
  <td class="r">2</td>
  <td><a href="http://wptables.moshayedi.net/">Site</a></td>
  <td><a href="https://bitbucket.org/pykello/djangodash2012">Source</a></td>
</tr>
</table>

[django-dash]: http://djangodash.com/archive/2012/
[drawnby]: http://drawnby.jupo.org
[websockets]: http://en.wikipedia.org/wiki/WebSocket
[gamblor]: http://gamblor.jupo.org
[gamblor-source]: https://github.com/stephenmcd/gamblor
[django]: https://www.djangoproject.com/
[jquery]: http://jquery.com/
[gevent-socketio]: http://pypi.python.org/pypi/gevent-socketio/
[socketio]: http://socket.io/
[redis]: http://redis.io/
[memcached]: http://memcached.org/
[css3]: http://en.wikipedia.org/wiki/Cascading_Style_Sheets#CSS_3
[jquery-transit]: http://ricostacruz.com/jquery.transit/
[jquery-collision]: http://eruciform.com/jquerycollision/
[stephenmcd]: http://twitter.com/stephen_mcd
[heroes-github]: http://hgh.dev8.ru/
[busitizer]: http://busitizer.com/
