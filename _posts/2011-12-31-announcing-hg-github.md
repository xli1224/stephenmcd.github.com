---
layout: post
title: Announcing hg-github
tags:
- version control
- mercurial
- git
- github
- bitbucket
- open source
- hacks
---

The two front-runners in source code management these days are undoubtedly [Git][1] and [Mercurial][2]. Distributed version control has clearly proven itself as the superior model over older centralised systems like [SVN][3], particularly in the context of open source development, where the ability to fork repositories and push and pull branches between them facilitates a much more efficient and streamlined work-flow.

My personal opinion about the difference between the two is similar to [my take on Django and Rails][4]. Relative to their alternatives, the two are far more similar than different, essentially providing the same concepts and features, but with quite different underlying philosophies in their implementations. For this reason I choose the less popular Mercurial over Git to manage all of my projects. Firstly I feel it has a more natural and intuitive UI (I'm not referring to a graphical interface here, but the actual commands it implements and their arguments). Another key factor is that Mercurial is written in Python, which means hacking on it and building extensions for it is a breeze.

What makes Git more popular than Mercurial? One major factor is their respective online hosting services, [GitHub][5] for Git and [Bitbucket][6] for Mercurial. If you're unfamiliar with these sites, they're like Facebook for programmers who share projects and collaborate together on code rather than post photos and videos. While both of these sites mostly implement the same core features, GitHub has always been several steps ahead of Bitbucket in terms of overall polish, and being first to market with new features. This difference has led GitHub to become far more popular than its Mercurial counterpart, and as a result, Git far more popular than Mercurial.

With the majority of open source activity occurring on GitHub, what then is a Mercurial user to do? Limiting your projects to the audience of Bitbucket means missing out on a lot of potential collaboration. Fortunately some time ago, the team at GitHub developed a Mercurial extension called [hg-git][7]. It allows you to transfer code back and forth between a Mercurial repository on your machine to a Git repository on another machine, like GitHub for example, taking care of all the translation required between Git and Mercurial. After several years of using hg-git, it's one of the only pieces of software that continues to amaze me. Think of [Google's language translator][8], which on a good day can provide some very quirky translations when converting text from one language to another. hg-git performs the same task, but has no room for error when translating a source code repository from Mercurial to Git, and back again. Admittedly hg-git has a much easier job to do than translating human languages with all their ambiguities. Still, I am constantly impressed by the task it performs.

So hg-git allows me to develop my projects using Mercurial and have them shared on both GitHub and Bitbucket, allowing for maximum collaboration which is fantastic. It's not entirely seamless however. I still need to perform a couple of manual steps such as adding GitHub paths to my repo configuration, and creating Mercurial tags that map to the Git branches I want to work with. I need to do this each time I set up a new repository, be it for starting a new project, or forking a project of my own or someone else's. Recently I had to do this about half a dozen times in the space of an hour while working on a few different projects, and I thought to myself that I should be able to automate it. The result is a Mercurial extension I've called [hg-github][9] which automatically takes care of these manual steps required. It also wraps hg-git, so you don't need to install both extensions, as hg-github pulls in and takes care of all the hard work that hg-git does.

### Overview

Once hg-github is installed, assuming the default remote location of your repository is on Bitbucket, the GitHub path is automatically added and given the name ``github``, so you can push to it with the following command:

{% highlight sh %}
$ hg push github
{% endhighlight %}

For other named Bitbucket locations, the name ``github-NAME`` is given, where ``NAME`` is the name of the path located on BitBucket. For example consider the following ``.hg/hgrc`` repo config:

{% highlight ini %}
[paths]
default = ssh://hg@bitbucket.org/stephenmcd/hg-github
somefork = ssh://hg@bitbucket.org/stephenmcd/hg-github-temp
{% endhighlight %}

hg-git will add entries to the config file as follows. Note that the config file isn't actually written to:

{% highlight ini %}
[paths]
default = ssh://hg@bitbucket.org/stephenmcd/hg-github
somefork = ssh://hg@bitbucket.org/stephenmcd/hg-github-temp

github = git+ssh://git@github.com/stephenmcd/hg-github.git
github-somefork = git+ssh://git@github.com/stephenmcd/hg-github-temp.git
{% endhighlight %}

hg-github assumes you have the same username on GitHub and Bitbucket. If you have a different GitHub username, you can specify it by adding the following section to your global ``.hgrc`` file. For example my GitHub username is ``stephenmcd``:

{% highlight ini %}
[github]
username = stephenmcd
{% endhighlight %}

[1]: http://git-scm.com
[2]: http://mercurial.selenic.com/
[3]: http://subversion.tigris.org/
[4]: /2011/07/30/rails-quick-start-for-djangonauts
[5]: http://github.com
[6]: http://bitbucket.org
[7]: http://hg-git.github.com/
[8]: http://translate.google.com/
[9]: https://github.com/stephenmcd/hg-github
