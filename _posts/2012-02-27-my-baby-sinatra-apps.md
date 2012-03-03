---
layout: post
title: My Baby Sinatra Apps
tags:
- ruby
- sinatra
- django
- ruby on rails
- orm
- n+1 queries
- heroku
- paas
- devops
- git
- github
- mercurial
- bitbucket
- open source
- linkedin
- klout
---

It was almost a year ago that I took up a new role using [Ruby on Rails][ruby on rails]. I've previously talked about my [thoughts on Rails][thoughts on rails], and given my experience with [Django][django] I probably wouldn't consider using Rails for my own projects. What I did explore in my time with [Ruby][ruby] was another framework called [Sinatra][sinatra] which I used to build several apps. Firstly I'll go over Sinatra and some of the related pieces in the stack, and then I'll cover the apps I built.

#### Sinatra

Sinatra is a micro-framework, which differs from mega-frameworks like Rails and Django, in that Sinatra is bare-bones. It mostly deals with mapping URLs to request handlers, and not much more beyond that. No templating, no [ORM][orm], no middleware. All of these features can be slotted in using third party libraries where required. This makes for a very pleasant development experience with smaller sized apps - instead of having to do everything the *Django/Rails way*, you're free to pick and choose the parts you need, and weave them together in the best way you see fit. You're working at a relatively lower level, with much less scaffolding, and a lot more flexibility and control.

[Python][python] has its own counterparts in this space as well, such as [Bottle][bottle] and [Flask][flask]. However at the time I was looking to dive further into Ruby, and Sinatra seemed like a great way to lean into it.

If you're new to web development, or an experienced developer coming to Ruby or Python from [older stacks like ASP.NET or PHP][older stacks], I'd highly recommend starting out with a micro framework like Sinatra or Flask, before moving onto their bigger siblings Rails and Django. You'll get a great feel for their respective languages, without getting bogged down in the frameworks themselves.

#### DataMapper

You can't go very far these days developing a web application, without needing some form of persistent storage such as a database, and a library to work with it that goes beyond hand-written SQL. [Django has its own ORM][django orm] which is very powerful, but suffers from lacking a blessed, seamless migration tool. Rails has [Active Record][active record], which has grown into the defacto ORM in the Ruby eco-system, and has its own set of problems. The main issue I had with Active Record was that there was no clear definition of what fields a particular model implemented, aside from diving directly into the database itself. It coincides clearly with the notion that [Rails contains too much magic][rails magic]. Compare this to Django's declarative ORM, where each model's class contains an explicit blueprint of which fields and methods the model implements. The value of this in quickly picking up a new code base is highly under-stated, if the popularity of Active Record is anything to go by.

I began looking for an ORM solution for Sinatra and quickly came across a project called [DataMapper][datamapper], and was incredibly pleased. Not only does it provide the same declarative style that Django's ORM does, it goes above and beyond that with features that blow both Django's ORM and Active Record out of the water.

Firstly it provides the ability to automatically migrate models. Arguments against magic aside, this is an amazing feature. Simply change the model, and the changes are migrated to the database when next instantiated.

Secondly, DataMapper completely eliminates the [N+1 query problem][nplus1 queries]. When iterating through data and accessing other models via related fields, DataMapper will query the database when the first relationship is accessed, retrieving all required data pertaining to the outer loop, building up all of the instance relationships on the fly prior to accessing them. Yes, it sees into the future and protects you from obliterating your database, a mistake all too common in web development. It's worth noting that Django introduced this feature in the yet to be released 1.4 with the [prefetch_related][prefetch related] method. This is another great example of the explicitness of Python compared to the implicitness of Ruby.

Whether you're building a web application or not, if you're accessing a database from Ruby, consider using DataMapper. It's a great piece of software.

#### Heroku

The explosion in Ruby and Python development frameworks over the last half decade has been a boon to web development. Security, modularity, shelf life, and time to market have all dramatically improved thanks to dynamic languages, the frameworks that have developed around them, and the open source communities that make them possible. It's not all fun and games however. Deployment of these applications has grown considerably more complex. Gone are the days of using FTP to upload some PHP scripts to a server, and hitting refresh on the web page to test your changes. We now have to deal with a wide variety of deployment tasks, from reloading application processes, database migrations, dependency management and much more.

Naturally the community has risen to solve these problems, a movement sometimes referred to as [DevOps][devops], with tools in place such as [Ruby's Capistrano][capistrano], [Python's Fabric][fabric], and configuration management tools to map complex deployments such as [Chef][chef] and [Puppet][puppet]. While the learning curve is steep, with enough time invested up front, deployments can become as simple as pushing a button, and are more robust and integrated with quality assurance than ever before.

Modern deployments such as these require experts. This is where [Platform as a Service (PaaS)][paas] offerings come in. PaaS providers are modern hosting companies that take care of all the dirty work in configuring servers and automating deployments for you. Typically they'll expose a distributed version control server using [Git][git] or [Mercurial][mercurial] that you can push code commits to. The process of pushing commits then triggers deployment, automatically performing all of the required tasks. PaaS providers will also provide all of the related services required, such as databases, message queues, caching servers and so forth.

Are PaaS providers a magic bullet? Absolutely not. Every application will have a tipping point where it grows beyond the "one size fits all" approach provided by PaaS offerings. You're also at the mercy of the provider when it comes to uptime, so mission critical applications with strict service level agreements may require much more fine grained control in their hosting environments. Never forget that [you are the only one responsible for your service's availability][availability]. However for smaller, stock, non-critical applications, PaaS providers are a dream come true, that remove most of the complexities around service provisioning, configuration and application deployment.

The most well known of these providers is [Heroku][heroku], who were the first to popularise the PaaS architecture. Not only does Heroku offer a [rich variety of add-on services][heroku addons] that I was looking for, like [Varnish][varnish], [Memcached][memcached], and [PostgreSQL][postgres], they also provide free hosting for low capacity sites - ideal for the types of applications I ended up building with Sinatra.

So with Sinatra, DataMapper and Heroku combined, I developed several small applications that scratched particular itches for me, in order to build up a good working knowledge of Ruby.

#### Linked Out

I don't keep an up to date CV anymore. If I pick up a new skill, or start a new role, I'll update [my LinkedIn profile][linkedin profile]. It's the quickest and easiest way to keep my professional information up to date. For better or worse though, over the last few years LinkedIn has turned into a mass hunting ground for recruiters. I used take the time to enter into a dialogue with each and every recruiter that contacted me, after all anything less would be rude, but over time I realised the futility in this, as the practice by recruiters  to blast out boilerplate introductions to anyone who matched a keyword search, became more and more common. But I digress. The state of recruitment aside, these conversations would inevitably lead to recruiters asking for a CV they could present to their clients. LinkedIn profiles contain a "download as PDF" feature, which I would always refer recruiters to, but LinkedIn embeds their logo within the PDF, and over time as they've added new profile features, the PDF download hasn't picked these up. What I'd always wanted was an easy way to export my profile as a clean PDF, containing only the information relevant to a CV. I also wanted to be able to share the tools with anyone else who wanted to use it, so a baby Sinatra app seemed like the perfect fit.

There's a great [Ruby library for interacting with LinkedIn's API][linkedin ruby], and [PDFKit][pdfkit] for converting HTML to PDF, which meant that I could format the CV using HTML and CSS, and all I then needed to do was convert that directly to PDF.

The app I ended up building is called [Linked Out][linked out]. It has a very simple flow to it. You first authenticate via LinkedIn's [oAuth](oauth) service, and then you're redirected back to Linked Out, where you can create a PDF version of your profile. As an added bonus I hooked into LinkedIn's connections API, so you also get the option of creating a CV for any of your LinkedIn connections - no need for recruiters to bother people with CV requests, they can create the CVs themselves.

LinkedIn is somewhat lacking when it comes to formatting large blobs of text in profiles. People tend to create all sorts of formatting themselves, typically to create bulleted lists. So Linked Out contains some smarts to look for these different types of free-text formats, converting them into proper lists and headings where appropriate.

Need to fend off pesky recruiters with a nice looking CV? Go and update your LinkedIn profile, and give [Linked Out][linked out] a try.

#### Klout Feed

If you're unfamiliar with [Klout][klout], it's a reputation measurement system that gives you a daily score based on your online interactions. It looks at your Twitter account as well as other social media services, and applies an algorithm based on the number of mentions you receive, retweets, and favourites, also taking into account the Klout score for each of the people who trigger these. It then assigns you a score out of 100 which you can measure on a daily basis to gauge how effectively you're using Twitter. According to Klout at least.

Klout has been described as many things, from a revolutionary game-changer in social media, to a vapid and narcissistic waste of time. Personally I found it to be an entertaining distraction. It did keep me coming back each day to check my score.

Now I'm one of a [dying breed][rss dying] that still uses RSS exclusively to keep track of everything going on online. Updates from my LinkedIn connections, contributions and issues for [my projects][my projects] on GitHub, [Google Groups][google groups] mailing lists, and of course various news sites and blogs. They all contain RSS feeds which I can catch up on, in one single interface. But not Klout. You need to log into their site each time you want to check you score. There's an interesting point here. If you want to keep users coming back to your site and piss them off at the same time, create a great service but make sure you don't include an RSS feed for the data your users are interested in.

To solve this I put together an app called [Klout Feed][klout feed]. It uses Klout's API to provide an RSS feed for each user, publishing their score and its change each day. The flow isn't as seamless as Linked Out's. Klout doesn't provide any form of application integration the same way LinkedIn, Twitter and Facebook do. Just a per-user API key with daily limits assigned to it. So with Klout Feed you first need to head on over to Klout and grab an API key, then bring that back to Klout Feed to get the URL for your score's RSS feed.

[Ian Anderson][ian anderson] has since gone ahead and written [a how-to article][klout ifttt] on combining Klout Feed with the [If This Then That][ifttt] service. The result is that you can get email or SMS notifications each time your Klout score changes.

#### One True Repo

Most open source projects use [Git][git] or [Mercurial][mercurial] for version control, and are hosted on either [GitHub][github] or [Bitbucket][bitbucket] respectively. Some people like myself host their projects on both sites. I've talked about my setup for [hosting on GitHub and Bitbucket][hg-github intro] before. Both sites provide totals for the number of interested developers following the project, and the number who have forked the project. A fork is when someone creates a copy of a project, usually with the intent of adding some news features or fixes, and pushing them back to the original source.

What I've always wanted is a combined API for totaling followers and forks across both services for a single project hosted on both sites, and also for all projects for a given user on both sites. This is what I tackled for my next Ruby project, which I called [One True Repo (OTR)][otr].

OTR's original form was as a library that other developers could embed in their project, so I built it as a Ruby gem that you can both include in your own project, or simply run from the command line and pipe the data it returns into other programs. The next step was to build a baby Sinatra app that provided a hosted version of the API that people could query. The project itself contains everything for all three of these forms - the library, the command-line tool, and the Sinatra web app.

Querying the [GitHub API][github api] was trivial and all the information I wanted was provided by it very easily. The [Bitbucket API][bitbucket api] wasn't quite up to scratch for this however. Remarkably it doesn't expose follower and fork count on each project. Some screen-scraping was therefore required to get these totals for each of a user's projects.

Do you mirror your open source projects across both GitHub and Bitbucket? Ever wonder how many people are following all your projects on both services? Give [One True Repo][otr] a try.

#### Conclusion

As you can see from some of these apps, the Sinatra on Heroku combination is the perfect fit for small mashups that act as glue between other popular APIs. Free of charge, rapid development, and a great pool of libraries to choose from in the Ruby eco-system.

[ruby on rails]: http://rubyonrails.org/
[thoughts on rails]: /2011/07/30/rails-quick-start-for-djangonauts/
[django]: https://www.djangoproject.com/
[ruby]: http://www.ruby-lang.org/
[sinatra]: http://www.sinatrarb.com/
[orm]: http://en.wikipedia.org/wiki/Object-relational_mapping
[python]: http://python.org/
[bottle]: http://bottlepy.org/
[flask]: http://flask.pocoo.org/
[older stacks]: /2010/09/28/on-modern-web-development/
[django orm]: https://docs.djangoproject.com/en/dev/topics/db/models/
[active record]: http://ar.rubyonrails.org/
[rails magic]: http://bens.me.uk/2009/going-off-the-rails
[datamapper]: http://datamapper.org/
[nplus1 queries]: http://www.pbell.com/index.cfm/2006/9/17/Understanding-the-n1-query-problem
[prefetch related]: https://docs.djangoproject.com/en/dev/ref/models/querysets/#prefetch-related
[devops]: http://en.wikipedia.org/wiki/DevOps
[capistrano]: https://github.com/capistrano/capistrano
[fabric]: http://docs.fabfile.org/
[chef]: http://www.opscode.com/chef/
[puppet]: http://puppetlabs.com/
[paas]: http://en.wikipedia.org/wiki/Platform_as_a_service
[git]: http://git-scm.com/
[mercurial]: http://mercurial.selenic.com/
[availability]: http://www.whoownsmyavailability.com/
[heroku]: http://www.heroku.com/
[heroku addons]: https://addons.heroku.com/
[varnish]: https://www.varnish-cache.org/
[memcached]: http://memcached.org/
[postgres]: http://www.postgresql.org/
[linkedin profile]: http://www.linkedin.com/in/stephenmcd
[linkedin ruby]: https://github.com/pengwynn/linkedin
[pdfkit]: https://github.com/jdpace/PDFKit
[linked out]: http://linkedout.jupo.org/
[oauth]: http://en.wikipedia.org/wiki/OAuth
[klout]: http://klout.com/
[rss dying]: http://camendesign.com/blog/rss_is_dying
[my projects]: https://github.com/stephenmcd
[google groups]: http://groups.google.com/group/mezzanine-users
[klout feed]: http://klout-feed.jupo.org/
[ian anderson]: http://iag.me/
[klout ifttt]: http://iag.me/socialmedia/guides/how-to-get-your-klout-score-emailed-or-tweeted-to-you-every-day/
[ifttt]: http://ifttt.com/
[github]: https://github.com/
[bitbucket]: https://bitbucket.org/
[hg-github intro]: /2011/12/31/announcing-hg-github/
[otr]: http://otr.jupo.org
[github api]: http://developer.github.com/
[bitbucket api]: https://api.bitbucket.org/
