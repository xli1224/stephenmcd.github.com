---
layout: post
title: An Open Source Brief
tags:
- python
- django
- open source
- mezzanine
---
You'd be forgiven for reading the title of this post and thinking it's about a
crazy approach to project briefing that somehow mimics open source development
- as interesting as that sounds, it isn't the case and my motives are much
more simplistic and sinister. What I'd like to do here is put a brief together
for an open source project called [Mezzanine](http://mezzanine.jupo.org). This
brief isn't specifically geared towards programmers so if you think this isn't
for you then please continue reading and let me prove you wrong.

_What is Mezzanine?_

Anyone who [follows my updates](http://twitter.com/stephen_mcd) will know it's
an open source CMS framework I've been working on over the last couple of
months. It now has a [concrete feature
set](http://mezzanine.jupo.org/docs/overview.html#features) having come
remarkably far in a very short amount of time. This might lead you to believe
an entire team of people have been working on it but in fact it's mostly been
myself alone - it's thanks to the incredibly rapid development that using
[Django](http://djangoproject.com) brings you that so much has been done so
quickly. For those readers who aren't familiar with it please go ahead and
check out the [overview](http://mezzanine.jupo.org/docs/overview.html) in the
[documentation](http://mezzanine.jupo.org/docs/), play around with the [live
demo](http://mezzanine.jupo.org/blog/) and have a read of my [previous article](http://blog.jupo.org/2010/06/11/mezzanine-just-another-django-cms/) that
talks about why I started Mezzanine and what I hope to achieve.

_Why would I want to help?_

Perhaps you're an end user of a poorly designed CMS and you've often wished
you could do something about it. Perhaps you're a developer that's had the
unfortunate experience of trying to extend a seemingly user-friendly CMS
that's built using archaic technology, and wished you could be working with
something that's much more cutting edge and elegantly designed. Perhaps you're
someone who "gets" open source at a deeper level but always felt as someone
who isn't a coder that you couldn't contribute. Perhaps you're in business
development and you're tired of trying to sell "enterprise" crap with
completely absurd price tags. If you have anything to do with web development
then there's something in this for you.

_What do I get out of it?_

As much as you put in of course. The experience of contributing to open source
software on paper can often be a competitive advantage over other candidates
for a job interview or even development contracts for your business. There's
also the chance of notoriety - imagine being responsible for the user
interface or branding of the next [Wordpress](http://wordpress.org/). Imagine
your staff are core contributors to one of the web's leading development
tools. Again the success of the project will only match its contributions so
it's ultimately up to you.

_What can I do to help?_

A common misconception about open source software is that it's something that
only coders can participate in. Unfortunately the result of this is that the
majority of open source software ends up being only contributed to by coders
and is incredibly lacking in a variety of areas. I'm talking about visual
branding, copy-writing, UI development - all these areas that fall outside of
coding but are equally crucial in successfully shipping a professional piece
of software. Mezzanine has now reached a point where it can only continue to
move forward at a consistent pace by bringing in these skills that I don't
specialise in. So without further ado, here are the specific roles I think
need filling and what the focus of each would be.

### Graphic Designer

The entire project is desperately in need of some visual love. At the simplest
level it could really use some basic branding such as a logo and "powered by"
buttons. Then there's the [Mezzanine website](http://mezzanine.jupo.org),
[documentation](http://mezzanine.jupo.org/docs/) and [default
site](http://mezzanine.jupo.org/blog/) that are all currently quite spartan
looking.

### Interface Developer

So far the template mark-up for the default site is as minimal as can be.
While this is intentional to some extent in order to best serve those that
would come along and customise it for their projects, I think this idea could
be improved upon with a greater level of modularity. I'm also keen to
introduce a CSS framework like [Blueprint](http://blueprintcss.org/) into the
default site. Once that's all in order then I'd like to address what theming
would look like. Is this simply a matter of packaging up copies of the
templates as separate themes? A great milestone for Mezzanine would be to have
a handful of built-in themes created, as well as documenting the process for
creating your own.

### UX Designer

I've introduced a handful of user interface elements into Mezzanine that could
definitely use some ironing out from a usability and accessibility
perspective. The main contender is the navigation tree in the admin that's
used for managing the hierarchy of the entire site as well as being the entry
point for accessing most of the content management. There's the dashboard
interface for the admin area which is in a very early stage. There's the
overall layout for both the [project's own site](http://mezzanine.jupo.org)
and the [default site](http://mezzanine.jupo.org/blog/). Lastly and of great
importance, there's the [entire system for in-line
editing](http://mezzanine.jupo.org/docs/inline-editing.html) which is featured
in the default site - making this feature as user-friendly as possible is
critical.

### Technical Writer

Mezzanine currently has a good start on
[documentation](http://mezzanine.jupo.org/docs/) but at the moment it's mostly
focused on developers. I'd eventually like to have a lot more material aimed
at both end users of Mezzanine as well as marketing material geared towards
business decision makers.

### Product Evangelist

This is probably the easiest task of all. We simply need the word to be
spread. Learn about Mezzanine and use whatever medium you like to let the
world know how great it is, be it [Twitter](http://twitter.com), mailing lists
or blog posts.

This list isn't entirely complete and some of the tasks certainly overlap. If
you think you fit the bill or know anyone else who would get a kick out of
working on Mezzanine then there's no time like the present to get started.
There aren't any obligations with this so contributions of any size are
welcome. If you'd like to get involved but don't know where to start just
[post a message to the mailing list](http://groups.google.com/group/mezzanine-
users) and let's talk!
