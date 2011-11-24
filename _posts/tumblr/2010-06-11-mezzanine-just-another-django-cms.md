--- 
layout: post
title: "Mezzanine: Just Another Django CMS?"
tags: 
- django
- python
- php
- cms
- mezzanine
---
Ask any developer that has put together a [Django admin
interface](http://docs.djangoproject.com/en/dev/intro/tutorial02/) and they'll
tell you that it's an amazing piece of technology that allows you to whip up
an admin system for your web application in a number of minutes rather than
days. Unfortunately this power can be a double-edged sword as without enough
time and thought up front, a developer can easily end up creating an interface
that's almost impossible for its intended audience to work with.

I've seen this issue manifest itself in two ways. The first is the bare-bones
case where the options available for creating the admin interface are simply
left out, resulting in a spartan admin that does little to guide the user on
how to use it. The second could be described as the opposite end of the scale
where there is actually far too much going on in the admin interface at the
cost of simplicity and intuitiveness. This can often be the result of gluing
together a range of resuable apps that each have their own approach to
providing admin interfaces with the end result looking like a [Rube Goldberg
machine](http://en.wikipedia.org/wiki/Rube_Goldberg_machine). These scenarios
are bad for customers and bad for Django. When end-users think of Django, they
think of the admin interface - that's what Django is to them so it's critical
to get this component right.

I recently had [Wordpress](http://wordpress.org/) suggested to me as a
solution to this problem and it's easy to see why. The Wordpress install base
alone speaks huge volumes while its admin interface is incredibly user-
friendly. It also benefits from not requiring technical expertise to get a
simple website with pages and a blog up and running. However I felt this idea
overlooked the underlying issue of poorly configured Django admin interfaces,
while taking a step backwards by investing in [PHP](http://php.net/) - a
relatively inelegant technology with a very limited application scope.

My solution to the problem was to tackle the underlying issue more directly by
creating a Django application which I've called
[Mezzanine](http://github.com/stephenmcd/mezzanine). The approach I've taken
is to have functionality on par with Wordpress that can be used as a starting
point when developing basic websites. This meant putting a lot of thought into
the admin options used, as well as including a custom version of the [django-
grappelli admin skin](http://code.google.com/p/django-grappelli/) to come up
with a modern looking and intuitive admin interface. The other key approach
I've taken is to include as much functionality as possible directly in the
application itself for the sake of a consistent and lightweight code base that
can easily be hacked on. It's worth noting that this is in total contrast to
other Django website applications such as
[Mingus](http://github.com/montylounge/django-mingus) and
[Pinax](http://pinaxproject.com/), and that this difference really comes down
to a question of scope. Pinax for example is capable of a much wider range of
functionality than what I'm aiming for with Mezzanine out of the box which is
to cater for basic websites with the following features:

  * Hierarchical page navigation
  * Save as draft and preview on site
  * Drag-n-drop page ordering
  * WYSIWYG editing
  * SEO friendly URLs and meta data
  * Mobile device detection and templates
  * Blogging engine
  * Tagging
  * Custom templates per page or blog post
  * [Gravatar](http://gravatar.com/) integration
  * [Google Analytics](http://www.google.com/analytics/) integration
  * [Twitter](http://twitter.com) feed integration
  * [bit.ly](http://bit.ly/) integration
  * Sharing via Facebook or Twitter
  * Built-in threaded comments, or:
  * [Disqus](http://disqus.com/) integration

![](http://media.tumblr.com/tumblr_l3su7jFBHM1qa0qji.png)

The Mezzanine admin dashboard

I've open sourced the initial version of Mezzanine with a BSD license on both
[github](http://github.com/stephenmcd/mezzanine) and
[bitbucket](http://bitbucket.org/stephenmcd/mezzanine) - it still has a long
way to go so jump right in and fork away.

