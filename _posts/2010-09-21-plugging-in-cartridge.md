---
layout: post
title: Plugging In Cartridge
tags:
- django
- python
- mezzanine
- cartridge
- ecommerce
- n+1 queries
---
I'm happy to announce the first release of
[Cartridge](http://cartridge.jupo.org/) - a
[Django](http://djangoproject.com/) shopping cart application I started
working on back in 2009. The development path that Cartridge has taken has
been a strange one. I stopped working on it throughout 2010 in order to get
the ball rolling with a project called [Mezzanine](http://mezzanine.jupo.org/)
that I've [written about previously](http://blog.jupo.org/2010/06/11
/mezzanine-just-another-django-cms/). Many parts of Mezzanine actually
originated in Cartridge and once development of Mezzanine was well under way
it made the most sense for continued development of Cartridge to occur as a
plug-in for Mezzanine which has now come to fruition.

Beyond creating a kick-ass shopping cart application for Django, the main
design goal I originally had for Cartridge was to address some of the mistakes
I felt existed in other offerings available both within and outside of the
Django community. These areas I've aimed to address are as follows:

### Performance

The [Django ORM](http://docs.djangoproject.com/en/dev/topics/db/models/) is a
double-edged sword that while saving you a lot of time can also do a lot of
damage when used without regard to the underlying SQL queries being performed.
I've come across examples in templates where queries are being performed
inside loops nested inside more loops resulting in abysmal performance. Fixing
these problems wasn't simply a case of refactoring template logic as these
issues were core to the design of how prices and variations were modelled. The
only solution was to throw a ton of fine-grained
[memcached](http://memcached.org) usage at the problem, but this should be a
optional approach to scalability - not a minimum requirement for keeping the
site from falling offline. Cartridge has been designed with performance in
mind from the start with a range of denormalised data structures providing
O(n) performance as the number of products and categories grow.

### Intuitive Interfaces

An end user should be able to use an admin system for the first time and
discover an interface that is logical and intuitive. Having to go through a
handful of screens to set up a single product requires users to mentally train
themselves to remember a work-flow that isn't entirely natural. If the former
is achievable then the latter is definitely unacceptable. The number of forms
and fields in an interface can be described as a conversation between the
system and its user, and this conversation should be as quick and painless as
possible. Cartridge provides single interfaces for creating products,
categories, discounts and other types of shop data, with only applicable
fields making up these forms.

### Bloated Code

Having a system that implements every single feature that might ever be
required in a shopping cart implementation certainly makes for an easy sell,
however as this list grows these features become more obscure and less likely
to be required in an average implementation. This can result in a convoluted
code base that is very difficult to apply customizations to - an inevitable
requirement given the unique nature of shopping cart implementations.
Cartridge addresses this issue by implementing only the features typically
required by all shopping cart implementations, leaving custom features up to
the developer who will find that due to a tight feature list that the code
base and data models remain very clean and easy to work with.

Aside from these features that distinguish it from other shopping cart
applications, Cartridge comes with a standard set of features that you'd
expect to find:

  * Hierarchical categories (via Mezzanine pages)
  * Easily configurable product options (colours, sizes, etc)
  * Hooks for shipping calculations and payment gateway
  * Sale pricing and discount codes
  * Stock management
  * Product popularity
  * Thumbnail generation
  * Built-in test suite
  * Separation of presentation (no embedded markup)
  * Smart categories (by price range, colour, etc)
  * Configurable number of checkout steps

The [live demo of Mezzanine](http://mezzanine.jupo.org/) now includes
Cartridge so go ahead and try it out! If you're interested in hacking on
Cartridge then the source code is freely available under a [BSD
license](http://www.linfo.org/bsdlicense.html) at both
[GitHub](http://github.com/stephenmcd/cartridge) and
[Bitbucket](http://bitbucket.org/stephenmcd/cartridge).
