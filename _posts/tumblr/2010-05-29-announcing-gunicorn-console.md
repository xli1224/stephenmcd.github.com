---
layout: post
title: "Announcing gunicorn-console"
---

Like a lot of Django shops our software stack consists of two layers up front:
a public facing web/proxy server and an application server sitting behind it.
For a long time we've enjoyed success using [nginx](http://nginx.org/en/) and
[Apache](http://httpd.apache.org/) to fill these roles respectively, but as an
application server the 800 pound gorilla that is Apache can really be
overkill, which over time we've found can have quite a cost around lack of
granular control. So we recently decided to try out the up and coming
[gunicorn](http://gunicorn.org/) which is currently gaining in popularity
throughout the Django community and so far it's been very smooth.

One of the interesting features it provides is the ability to handle various
kill signals which map to functions such as adding and removing worker
processes as well as reloading the master process, all on the fly without
dropping a single client connection. So after a brief honeymoon period I then
came up with the following list of questions that mightn't be apparent when
serving a single application, but really come into play when serving dozens of
applications this way on a single server:

  * How can we deal with the signals interface without knowledge of process IDs?
  * How can we gain visiblity around the ports being used?
  * How can we gain visiblity around the number of worker procesess being used?
  * How can we gain visiblity around the amount of memory being used per application?

All of these can be answered with a small amount of command-line-fu, however I
wanted this process to be ridiculously easy for our entire team. For quite
some time I've wanted to put together a console application using the [curses
library](http://docs.python.org/howto/curses.html) so a simple management
console for gunicorn seemed like the perfect opportunity to do so and as such,
[gunicorn-console](http://github.com/stephenmcd/gunicorn-console) was born.

![](http://media.tumblr.com/tumblr_l35p9x2tmU1qa0qji.jpg)

As pictured above, after firing up a few gunicorn instances with varying
parameters gunicorn-console gives you the following interface in all its 8bit
glory:

![](http://media.tumblr.com/tumblr_l35pgbDlII1qa0qji.gif)

If you're hosting multiple applications served up via gunicorn then gunicorn-
console should make managing them easier. I've released it with a BSD license
on both [github](http://github.com/stephenmcd/gunicorn-console) and
[bitbucket](http://bitbucket.org/stephenmcd/gunicorn-console) using the
amazing [hg-git extension](http://hg-git.github.com/), so go ahead and make it
better!

**Update, May 30:** I ended this post with a request for others to contribute and after only a day someone already has. [Adam Vandenberg](http://adamv.com/) went ahead and forked the project with [some patches](http://github.com/adamv/gunicorn-console/commit/0f9bc2672f4cc0b1d560b353304d374d5c927120) to get it running on OSX, so a big thanks goes to him.

