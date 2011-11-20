---
layout: post
title: "On Modern Web Development"
---

Web development technology has come an incredibly long way over the last
decade. Unfortunately in local markets like Australia where I reside, the tech
sector seems to languish years behind the United States and Europe. We saw
this happen with broadband adoption at the turn of the century where most
Australians were still on dial-up for years after the rest of the world
enjoyed widely available cable and ADSL.

Fast forward to 2010; and the same situation has occurred with web
development. Anyone who follows the startup scene focused around San Francisco
and NYC will be familiar with the most popular development technologies
available - [Ruby](http://www.ruby-lang.org/en/),
[Python](http://python.org/), [Scala](http://www.scala-lang.org/) and many
more. Contrast this to the Australian space where the majority of development
houses have been sitting for many years on technologies such as ASP.NET and
PHP, which reached their peak in popularity over half a decade ago.

Why are the majority of shops in markets like mine so complacent when it comes
to their technology stacks? Is it CTOs that haven't written a line of code in
years and their fear of the unknown? Is it a lack of willingness to invest in
keeping their developers' skill-sets up to date and marketable? On these
things I can only speculate. What I can speak about knowledgeably however are
some of the reasons these latest technologies far outshine their predecessors,
and if only a single technology manager reads this post and decides to act on
it then it was well worth the time spent writing it.

We chose [Django](http://www.djangoproject.com/) several years ago so that's
what I'll be making reference to in the following comparisons, however you
could just as easily swap it out with [Ruby on Rails](http://rubyonrails.org/)
or any other modern platform and the points would be more or less equivalent.

 ASP.NETPHPJavaDjango

Efficiency

✘

✘

✘

✔

Security

✘

✘

✔

✔

Freedom

✘

✔

✘

✔

Developers

✔

✔

✔

✘

Mature Applications

✔

✔

✔

✘

#### Efficiency

I recently came across this fantastic quote:

"IDEs: a form of automation needed when the environment in question erects
artificial barriers."

Have you ever tried writing C# or Java in a plain text editor? It is an
exercise in futility as these languages sport incredibly verbose syntax and
deeply nested libraries which require specialised tools simply to write code.
What about the developer that needs to work with all of these different
technologies each day, can they be expected to be experts in several different
IDEs and switch between them freely? If only these different programming
environments could be used from the same editor - what a joy it would be as a
practicing polyglot!

On the plus side languages like C# and Java are relatively clean and
consistant when compared to abominations such as PHP, which truly is a
disorganized mess - functions named using both verb_noun and noun_verb, lots
of similar functions with no apparent naming convention (Eg: `sort(),
arsort(), asort(), ksort(), natsort(), natcasesort(), rsort(), usort(),
array_multisort(), uksort()`) and a weak type system that can lead to bugs
which are difficult to discover.

These languages stand in great contrast to modern dynamic languages such as
Python and Ruby. Ask any Python or Ruby developer which IDE they use and the
majority of them will tell you they don't need one. These languages are terse,
use flat heirarchies in their libraries and are incredibly expressive.

#### Security

Aside from the recent [Padding Oracle
Exploit](http://securitytracker.com/alerts/2010/Sep/1024459.html), ASP.NET has
remained fairly secure over the years. Unfortunately the other parts of the
stack, IIS and SQL Server, that it's exclusively tied to have been the
punching bag of the network security world throughout the last decade with
viruses such as [Code
Red,](http://en.wikipedia.org/wiki/Code_Red_(computer_worm)) [SQL
Slammer](http://en.wikipedia.org/wiki/SQL_Slammer) and more, leaving countless
websites either defaced or knocked entirely offline. With a track record like
this it truly is a wonder how anyone would knowingly choose to build public
facing Internet services based on a Windows stack.

Inversely we have PHP that while typically deployed on a LAMP stack built with
security in mind, the language itself makes writing secure applications an
extemely disciplined task. One need look no further than the [ongoing range of
security issues](http://secunia.com/advisories/product/6745/?task=advisories)
that have plagued applications such as Wordpress over the years: SQL
injection, cross site scripting (XSS), remote code execution - it's like an
all-you-can-eat smorgasbord of web application exploits.

Django in contrast runs on top of a secure LAMP stack and is designed from the
ground up with security in mind. It's protected by default against SQL
injection, XSS and cross site request forgeries. A developer would actually
have to make a concerted effort to create an exploitable Django application.
Also like many open source projects a security issue in Django isn't dealt
with because a corporation deems it to be the most cost effective decision. In
the very few and far between occasions when security issues have inevitably
been discovered, turn-around time for resolving these has been within a 24
hour period - not weeks or even months as is often the case with corporate
vendors that lack the agility and motivation to act responsibly.

#### Freedom

A common misconception about open source software is that it lacks the
reliability of support that comes with choosing a commercial vendor. This is a
short sighted view now plaguing many businesses. When Microsoft introduced
.NET it made the skill-sets of thousands of VB developers redundant. What
happens when Microsoft announces that .NET is to be deprecated in their next
technical adventure? The problem here is that a public company with an
obligation to generate as much profit as it can controls the technology path
of billions of dollars of software. Sometimes it's in their best financial
interest to create fantastic technology, and sometimes it's in their best
financial interest to tear it all down again.

There is then the issue of acquisition. Companies like Microsoft and Oracle
have a long and successful history of acquiring their competitors simply to
discontinue their competing technology - let's hope the vendor you're in bed
with isn't _too_ good.

Even Java, which for all intents and purposes is an open source technology has
recently shown that it isn't immune to the flaw of corporate ownership with
[Oracle suing Google](http://news.cnet.com/8301-30684_3-20013546-265.html)
over its use on Android phones. Will Android developers find that their time
and effort invested in this platform will all be for naught?

Python and Django are both licensed under [Permissive Free Software
Licenses](http://en.wikipedia.org/wiki/Permissive_free_software_license),
which allow anyone to go ahead and do whatever the hell they like with them.
They are owned by the [Python Software Foundation](http://www.python.org/psf/)
and the [Django Software Foundation](http://www.djangoproject.com/foundation/)
respectively. These are non-profit bodies that for the most part exist to
enforce the IP rights of each technology. These technologies are community
driven with one goal in mind: to create best of breed technology. There is no
financial motivation here and so we thus find ultimate reliability with this
software stack being impervious to the risks described above - it cannot be
made redundant by any financially driven corporate strategy as the licensing
and foundations have been specifically put in place to prevent this from being
possible. An interesting corollary to this is that these technologies go
relatively unheard of without the backing of large corporations promoting
them. Next time you're the target of a technology sales pitch consider the
high likelihood that you're not looking at the best technology in its given
application domain - best of breed doesn't need to be sold at all, it sells
itself.

#### Developers

ASP.NET, Java and PHP developers outnumber Python and Ruby developers by the
hundreds if not thousands. This is a great selling point to technical decision
makers - the ability to quickly and easily hire developers when the need
arises is critical. But what of the quality of these developers? An
interesting question to pose is why a developer who specializes in .NET or PHP
chose their particular technology. Answer: because that's what everyone else
uses. You certainly won't find a developer who has gone out and thoroughly
investigated a broad range of different languages coming back and choosing
.NET over everything else. Those who have done so have chosen their languages
on its technical merits. These are the passionate developers with a love for
their craft, not those who are merely in it for a paycheck and whose
workmanship will reflect as much. Paul Graham referred to this in 2004 in his
incredibly insightful essay [The Python
Paradox](http://www.paulgraham.com/pypar.html).

#### Mature Applications

The final point I'd like to cover is the maturity of applications developed on
top of any given platform. This is where modern languages fall short as by
definition they simply haven't gained enough penetration for mature
applications to have been developed yet. This is where there is opportunity.
This is where the next generation of mature web applications will be built
using web application frameworks like [Django](http://www.djangoproject.com/)
and [Rails](http://rubyonrails.org/) that are designed from the ground up for
rapid customization over long software life-cycles while maintaining the
original design integrity of your application - something only a very
disciplined developer can maintain with something like PHP, which in almost
all cases will eventually end up as spaghetti code.

Applications like [Wordpress](http://wordpress.org/) and
[Magento](http://www.magentocommerce.com/) may work fine off the shelf for an
end user, but what type of path have you created for your customer by
implementing technology that gets closer and closer to its end of life the
more it's customized?

In conclusion - developers and CEOs, challenge your technical decision makers
to overcome their complacency and invest in technology of the future. Push
your employer, your peers and most importantly yourself forward. Invest your
time in efficient, secure and unencumbered technology.

