---
layout: post
title: "2011: My Year in Review"
tags:
- osx
- ruby
- django
- django dash
- open source
---

Another year has gone by and another obligatory _year in review_ post is due. 2011 was a
year full of change for me. I changed jobs twice, spent half the year coding in a new language, moved interstate, and switched my primary operating system.

### Ruby

After working at [Citrus][1] for almost nine years, I was well overdue for a change of scenery, so when I was approached by [Impact Data][2] to come and work for them using [Ruby on Rails][3], I welcomed the opportunity. My time there was short and sweet however, as after six months I decided to move back home to Sydney, but it was a really rewarding experience working with an incredibly smart team on a technology stack that was new to me. I had a great time learning Ruby, forming a strong appreciation for its elegance, and it was very interesting along the way making plenty of [comparisons between Rails and Django][4]. Naturally I started using Ruby in my own projects, getting to know [Sinatra][5] for a handful of apps that I built. I'll be writing a more detailed post about those soon, so stay tuned!

### Django Dash

For the second year in a row I entered the [Django Dash][6] hackathon. This time around I wanted to do something that really pushed Django outside of its typical usage patterns. I'd recently read Cody Soyland's introductory blog post on [using WebSockets with Django][7], and so I came up with an idea I called [Drawn By][8], a collaborative drawing app where people could create sketches together in real-time, save them to an image they can download, and rate others' sketches in the gallery.

 I got to use a variety of technology I hadn't used before which was really fun. I used [gevent][9] as the evented web server for maintaining open socket connections with the browser, the NoSQL database [Redis][10] for queuing events and storing temporary pixel data, and the browser's [Canvas API][11] for front-end drawing interaction and rendering. I set a relatively high goal for ourselves this year with what we wanted to achieve, but we pulled it off nicely in the end.

 This year we came 3rd place out of around 50 entries, which was a great improvement on the previous year's result of 8th. The most important result however was the creation of [django-socketio][12], which was extracted from Drawn By and released as open source. It brings together all of the scaffolding for using WebSockets with Django, and implements an events and channels system for building your own applications around it. [I previously wrote about django-socketio][13] right after releasing it, and since then it has gained quite a lot of traction, with a handful of developers contributing back fixes and new features.

### Open Source

I actually spent less time this year contributing to open source than I did the previous year, but I steamed ahead nonetheless with a lot of new projects, as well as continued development and support for my major works, [Mezzanine][14] and [Cartridge][15]. Both these projects have reached a very mature level over the course of 2011, thanks to tons of contributions from the [Mezzanine and Cartridge community][16], which continues to grow steadily. Here's a list of the projects I released as open source over the year:

  * [Drawn By][8]: Collaborative real-time sketching. (Django / Python)
  * [django-socketio][12]: WebSockets for Django. (Django / Python)
  * [Virtualboxing][17]: Comparison utilities for [Riak][18] and [MongoDB][19]. (Ruby)
  * [Grillode][20]: Multi-purpose chat server. ([Node][21] / [CoffeeScript][22])
  * [Linked Out][23]: Create PDF resumes for [LinkedIn][24]. (Sinatra / Ruby)
  * [Klout Feed][25]: Daily [Klout][26] scores via RSS. (Sinatra / Ruby)
  * [Babbler][27]: A [Twitter][28] bot. (Python)
  * [One True Repo][29]: Combined [GitHub][30] and [Bitbucket][31] API. (Sinatra / Ruby)
  * [hg-github][32]: A [Mercurial][33] extension for GitHub. (Mercurial / Python)
  * [sphinx-me][34]: A [Sphinx][35] documentation generator. (Python)

### OSX

As I mentioned, towards the end of the year I moved back to Sydney. An opportunity came up to work with [Fairfax][36], the largest media organisation in Australia. Fairfax is building a new publishing platform using Django, so my experience with content management and Django was a natural fit. Mostly though, it was a chance for me to move back home and be closer to my family, after being away from them in Melbourne for a decade.

When I started at Fairfax, I was surprised to find the entire team running OSX. I wasn't surprised so much by the choice itself, as OSX is very popular in the Django and wider development community, but more so by my own lack of experience with it, having solely used Linux for the last half decade. I decided to give it a go and found it to be on par with Linux as a development environment.

My biggest gripe was breaking down the mental muscle I'd built up around the shortcut keys for wrangling text. At first I was fumbling on OSX, but after a few days of using OSX during the day and Linux at night, I found that I wasn't efficient with either of them - I needed consistency. I was also long overdue for a new machine. I originally had my eye on some of the MacBook Air clones like the [Acer UltraBook][37] and [Asus ZenBook][38], but I couldn't find any information about running Linux on these, and I wasn't prepared to go through the pain of working it out if anything went wrong. So I bit the bullet and picked up a 13 inch MacBook Air.

All I need at the software level is visible application shortcuts, keyboard-driven application switching, a decent [editor][39], [terminal][40], [web browser][41] and [package manager][42], and I'm good to go. In that regard, OSX and Linux are equivalent for my use, each with their own minor flaws. What I am really loving is the hardware. The keyboard seems laid out in a way that lets me type faster than ever, and the solid state drive means everything is instantaneous - that paired with the best battery life I've ever experienced, and it's a dream machine.

[1]: http://citrus.com.au
[2]: http://impactdata.com.au
[3]: http://rubyonrails.org
[4]: http://blog.jupo.org/2011/07/30/rails-quick-start-for-djangonauts/
[5]: http://www.sinatrarb.com
[6]: http://djangodash.com
[7]:http://codysoyland.com/2011/feb/6/evented-django-part-one-socketio-and-gevent/
[8]: http://drawnby.jupo.org
[9]: http://www.gevent.org
[10]: http://redis.io
[11]: http://en.wikipedia.org/wiki/Canvas_element
[12]: https://github.com/stephenmcd/django-socketio
[13]: http://blog.jupo.org/2011/08/13/real-time-web-apps-with-django-and-websockets/
[14]: http://mezzanine.jupo.org
[15]: http://cartridge.jupo.org
[16]: http://groups.google.com/group/mezzanine-users/topics
[17]: https://github.com/stephenmcd/virtualboxing
[18]: http://basho.com/products/riak-overview/
[19]: http://www.mongodb.org
[20]: http://chat.jupo.org
[21]: http://nodejs.org
[22]: http://coffeescript.org
[23]: http://linkedout.jupo.org
[24]: http://linkedin.com
[25]: http://klout-feed.jupo.org
[26]: http://klout.com
[27]: http://github.com/stephenmcd/babbler
[28]: http://twitter.com
[29]: http://otr.jupo.org
[30]: http://github.com
[31]: http://bitbucket.org
[32]: http://blog.jupo.org/2011/12/31/announcing-hg-github/
[33]: http://mercurial.selenic.com/
[34]: https://github.com/stephenmcd/sphinx-me
[35]: http://sphinx.pocoo.org/
[36]: http://fairfax.com.au
[37]: http://us.acer.com/ac/en/US/content/s-series-home
[38]: http://zenbook.asus.com/au/design/
[39]: http://www.sublimetext.com
[40]: http://www.iterm2.com
[41]: http://www.google.com/chrome/
[42]: http://mxcl.github.com/homebrew/
