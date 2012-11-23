---
layout: post
title: How I Now Know Node
tags:
- coffeescript
- javascript
- node.js
- sockets
---
Having remained utterly faithful to [Python](http://python.org/) and
[Django](http://www.djangoproject.com/) over the last year, and dedicating all
of my available time to open source projects like
[Mezzanine](http://mezzanine.jupo.org) and
[Cartridge](http://cartridge.jupo.org), with the new year at hand I though it
was about time to take a break and add some new technology to my repertoire.
During his [keynote speech at Djangocon.eu
2010](http://djangoconeu.blip.tv/file/3674233/), the creator of Django [Jacob
Kaplan-Moss](http://jacobian.org/) states “it will challenge what you think
you know about web/server architecture” when referring to
[Node.js](http://nodejs.org). Since then it has been sitting in the back of my
mind as something I definitely needed to check out, so I decided to dive in
head first.

Node.js is a general purpose JavaScript development environment geared towards
writing network servers. It uses an event-based, non-blocking architecture
which allows your web application to scale to thousands of concurrent
connections without needing a finite pool of threads or processes. JavaScript
is executed using [Google's V8
engine](http://code.google.com/apis/v8/intro.html) which ranks very highly in
speed [compared to other dynamic
languages](http://shootout.alioth.debian.org/u32/which-programming-languages-
are-fastest.php), so not only does Node.js scale elegantly, it's damn fast.

Having recently built [Grillo](http://github.com/stephenmcd/grillo), a console
based chat server, I'd been considering what it would be like to put together
a web-based version. In fact I had achieved [something
similar](http://code.google.com/p/cmdsvr/) in the past using [Python's
BaseHttpServer module](http://docs.python.org/library/basehttpserver.html),
and while functional for a few hundred connections, my approach would never
scale, as either a separate thread or process would be required for each open
connection. The event driven architecture of scaling a web server for an
increasing number of open connections is mostly a solved problem, especially
in the Python community with projects like
[Twisted](http://twistedmatrix.com/) and
[Tornado](http://www.tornadoweb.org/). However Node.js is different in that
its non-blocking evented model is a first class citizen by design.

With a useful project at hand to try Node.js on, I set about creating what
I've named [Grillode](http://chat.jupo.org/about) (yes you guessed it: Grillo
+ Node). It's a web-based chat server with a set of configuration options that
lets you run it in various modes, such as a customer support queue, or with
[Chatroulette](http://en.wikipedia.org/wiki/Chatroulette) style random match-
ups. I've released the source onto
[GitHub](http://github.com/stephenmcd/grillode) and
[Bitbucket](http://bitbucket.org/stephenmcd/grillode), and also have [a demo
up and running](http://chat.jupo.org/).

The process of putting Grillode together led me through many parts of the
ecosystem that has developed around Node.js - following is an overview of the
pieces I ended up working with.

#### Node Package Manager (NPM)

[NPM](http://npmjs.org/) is a command line utility that gives you access to a
central online repository of packages built for Node.js. It works wonderfully
when installed correctly, but on my machine I encountered a handful of issues
where it ended up recreating various system directories all throughout my home
directory. After setting up various symlinks by hand, I did get it to work
after many failed attempts at installing it. This issue was definitely
specific to my machine as I was then able to go ahead and install NPM
seamlessly on several different servers.

Once everything was working correctly it made deployment of Grillode a breeze.
By specifying all of its dependencies in a [package.json](https://github.com/s
tephenmcd/grillode/blob/master/package.json) file, NPM was able to installed
everything required in a single step.

#### Express

[Express](http://expressjs.com/) provides basic URL routing to functions that
will typically perform some application logic and hand off data to a template
to be rendered. It contains integration points for a handful of different
templating libraries and it also contains a simple middleware system. I'd
definitely consider it to be a micro framework, but it's a great start at
whipping your Node.js application into a well defined structure.

#### Socket.io

[Socket.io](http://socket.io/) takes all the leg work out of maintaining an
open connection to the browser. You start by attaching it to your Node.js
server which then automatically makes available the client-side JavaScript
required. This provides the communication channel between the client and the
server, which attempts to use [web
sockets](http://en.wikipedia.org/wiki/WebSockets) when available, and
transparently falls back to Flash sockets or even old-school AJAX polling if
the former options aren't supported by the browser.

It then provides all of the methods and event handlers for connecting and
sending data over the connection. The beauty behind how this is implemented is
that it exposes these methods and events almost identically to both the
Node.js server, and the browser client - instantly you have available two-way
communication between the browser and the server via an open connection,
without requiring any new requests to the server.

#### CoffeeScript

As many others have done, I've often compared JavaScript to Python in that
they both share an object model defined by a hash table of names and object
members, which can be introspected and dynamically modified. While this is a
very elegant model, JavaScript boasts syntax reminiscent of the turn of the
century, cluttered with semicolons and braces, and missing a handful of
features found in modern languages such as list comprehensions and much more.
Well [the war on semicolons is over](http://www.americanscientist.org/issues/i
d.3489,y.0,no.,content.true,page.1,css.print/issue.aspx) with the explosion in
popularity of languages such as Python and Ruby showing this to be true.

[CoffeeScript](http://coffeescript.org) is a language inspired by Python and
Ruby which gets compiled directly into JavaScript. It therefore retains all
the properties of JavaScript such as its data types, objects and methods, but
provides a much more modern and clean syntax with some fantastic sugar, such
as list comprehensions, class-based object construction, string interpolation
and more.

Experimentally, CoffeeScript can be run directly in the browser in place of
JavaScript by including the compiler JavaScript file itself, but much more
interestingly it can be used as an execution environment for Node.js, which
will perform the compilation to JavaScript when the Node.js application is
first started. I found my experience to match reports of up to 30% in
reduction of the amount of code required.

#### Coffeekup

When looking into what was available for templating, I started out with
[EJS](http://github.com/visionmedia/ejs) which basically gives you executable
JavaScript within your template files. I found this to provide a poor
separation between display and application code, something that Django gets
right by providing a limited template language that has basic flow control,
but makes writing non-trivial logic difficult to do.

I then discovered a Node.js template library called
[Coffeekup](http://coffeekup.org/), that tied in very closely with the time I
had already spent with CoffeeScript. Coffeekup allows you to define your HTML
entirely in CoffeeScript. I'm still undecided on whether this is a thing of
beauty or horror. It's very surreal to work with web page markup expressed
entirely in programming code. I guess there's somewhat of an undeserved
feeling of the presentation being too closely tied to programming logic. There
is a magical feeling in having your server code, client code and presentation
code all in the exact same language, coupled with the given language being
CoffeeScript which is incredibly clean.

#### Conclusion

I really enjoyed working with Node.js and the young ecosystem surrounding it.
At this point in time, I wouldn't consider it for a typical project over a
full stack framework like Django with the elegance of Python, however it
definitely serves as a fantastic choice for a very specific criteria -
scalable, real time web applications.
