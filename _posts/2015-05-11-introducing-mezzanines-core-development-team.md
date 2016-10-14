---
layout: post
title: "Introducing Mezzanine's Core Development Team"
tags:
- open source
- django
- python
- mezzanine
- cartridge
- drum
---

Today I'm thrilled to announce the formation of the inaugural core development team for [Mezzanine][mezzanine]. This is a huge milestone for the project, formally growing beyond having only myself as the single developer making each final design decision and approving all contributions, to a team of people with the same level of responsibility for the project that I've always had. In truth, this announcement simply recognises the informal team structure that's been in place for several years now, at least in my mind — I recall offline conversations with colleagues about Mezzanine from years ago, where I'd note how the project had implicitly formed a core team, and that I really needed to formalise it. Unfortunately laziness has always prevailed until now, but better late than never!

In practical terms, the core team will all have commit access to Mezzanine and its associated projects, like [Cartridge][cartridge] and [Drum][drum]. We'll all be reviewing each other's work where appropriate, as I always have, but moving forward, my own work will be reviewed too, which should mean less bugs! Naturally, everyone on the team can also speak on behalf of the project, so now their word should be taken as mine always has.

What does this mean for my involvement in Mezzanine? Not much — I won't be involved any less than before. I've recently started a new role at Google which is really exciting, and was asked if this would mean I'd have less time for my open source work — in fact the opposite is true. Part of my role at Google is working with the open source community, and participating in non-Google open source projects is [actively encouraged][google-in-authors]. Again, most importantly though, the core team forming simply recognises the structure that's been in place for years now, which I'll talk about by introducing each of the team.

### Josh Cartmell

[Josh][josh] first got involved with Mezzanine back in 2010. Since then he's been a cornerstone of supporting the Mezzanine community on the mailing list, topping it with the highest number of messages sent. Aside from his outstanding contribution in supporting the community, Josh has also been heavily involved in Mezzanine advocacy around front-end development, having built the [Mezzatheme][mezzatheme] theme portal, as well as writing many articles on [customising the look and feel of Mezzanine][josh-blog]. Josh has also contributed to the code base over the years, including the work for [multi-tenant themes][site-themes].

### Ken Bolton

Since first getting involved with Mezzanine back in 2011, [Ken][ken] has also been a cornerstone of Mezzanine support. At the risk of sounding too whimsical, he and Josh have been my left and right wings that have kept the mailing list afloat over the years. During this time Ken has also made many code contributions to the project, including major extensions to [Mezzanine's template loading mechanism][template-loading-docs]. Ken is also a Mezzanine advocate, having written several articles on the topic of [configuring both development and production deployment environments for Mezzanine][ken-blog].

### Alex Hill

[Alex][alex] has been involved with Mezzanine since 2012. While relatively unheard of on the mailing list, Alex has been by far the [greatest contributor to Mezzanine's code base][commits-graphs] over the years. To both the benefit and detriment of the project, I've always been terribly scrupulous when reviewing code contributions, yet over the years, somehow Alex has managed to bypass this entirely by consistently contributing features and fixes in precisely the same way I aim to — both stylistically and architecturally. Don't tell him, but I actually don't review his contributions anymore, I just blindly accept them. I've considered Alex my right-hand man as far as the code base goes for quite some time now.

### Eduardo Rivas

[Ed][ed] began working with Mezzanine in 2012, and in my mind has impressively made a broader range of contributions to the project than anyone else. As a native Spanish speaker, he has not only been the primary maintainer of the Spanish translations of Mezzanine itself, but has also been heavily involved in everything related to localisation and internationalisation in the project, from the way we manage translations, translations of the documentation, and multi-lingual content. Ed has also been responsible for maintaining compatibility with the latest version of [Bootstrap][bootstrap], the front-end framework we use with Mezzanine. On top of all that, Ed has also done extensive work to [Mezzanine's built-in deployment tool][mezzanine-deploy-docs], to provide better compatibility with different hosting providers and deployment strategies.

### Mathias Ettinger

Fun fact: I only became aware of [Mathias][mathias]' work on Mezzanine this year, but when researching how long everyone has been involved with the project for, I discovered he's actually been around since 2012 as well! But this year Mathias completed the huge task of implementing one of Mezzanine's most often requested features: [multi-lingual content][multi-lingual-pr]. Since then he has wholeheartedly supported this work by responding to the community's feedback, resolving issues, and providing a great deal of documentation on [how to implement a multi-lingual Mezzanine project][multi-lingual-docs]. While multi-lingual content won't be available until the upcoming next release, his work here so far has been incredibly impressive.

Finally, I think it's worth listing a handful of qualities that Josh, Ken, Alex, Ed and Mathias have clearly demonstrated, which ultimately led me to asking them to form the new team.

- Long term involvement in the project
- "Gets" the Mezzanine philosophy
- Supports the community patiently and professionally
- Able to correct me when I'm wrong

There are definitely more people outside of the initial team who have made great contributions to Mezzanine in the past, and fit the above criteria too. If you're one of these people and feel you should be a member of the core team, please let me know.

Again, I'm thrilled to finally give recognition to the people who have done so much to shape Mezzanine into what it is today. Please join me in [officially welcoming][mailing-list-announcement] the core Mezzanine team!

[mezzanine]: http://mezzanine.jupo.org
[cartridge]: http://cartridge.jupo.org
[drum]: http://drum.jupo.org
[google-in-authors]: https://twitter.com/stephen_mcd/status/596117549122596864
[josh]: https://joshc.io/
[mezzatheme]: http://mezzathe.me/
[josh-blog]: http://bitofpixels.com/blog/tag/mezzanine/
[site-themes]: http://mezzanine.jupo.org/docs/multi-tenancy.html#per-site-themes
[ken]: http://bscientific.org/
[template-loading-docs]: http://mezzanine.jupo.org/docs/content-architecture.html#page-templates
[ken-blog]: http://bscientific.org/blog/category/devops/
[alex]: https://github.com/alexhill
[commits-graphs]: https://github.com/stephenmcd/mezzanine/graphs/contributors
[ed]: https://github.com/jerivas
[bootstrap]: http://getbootstrap.com/
[mezzanine-deploy-docs]: http://mezzanine.jupo.org/docs/deployment.html
[mathias]: https://github.com/Kniyl
[multi-lingual-pr]: https://github.com/stephenmcd/mezzanine/pull/1019
[multi-lingual-docs]: https://github.com/stephenmcd/mezzanine/blob/master/docs/multi-lingual-sites.rst
[mailing-list-announcement]: https://groups.google.com/forum/#!topic/mezzanine-users/Pt5fwkTBBUE
