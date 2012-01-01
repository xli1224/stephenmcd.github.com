---
layout: post
title: Hasta la Vista, Windows
tags:
- linux
- x.org
---
Earlier this week I had the pleasure of removing my final Windows install
after wiping my machine at work and installing Ubuntu on it. It was during the
late 90s that I first tried out Linux after getting my hands on a Redhat 6.1
CD from the cover of a magazine I'd bought. I didn't keep it installed for
very long and after a few more tries over the years with Mandrake (now
Mandrivia) and Damn Small Linux, it wasn't until 2005 when I installed
Slackware 10.2 as my primary operating system at home and really cut my teeth
on it in order to test how cross-platform my Python projects were. It was a
great experience learning about all the various sub-systems, compiling
software and libraries from source, embracing the command line and modifying
some of the internal scripts to get things working the way I wanted.

Fast forward to 2010 and in my workplace the migration from a Microsoft
development shop to a Linux/Python shop after several years is finally
complete, paving the way for this latest install. I did experience a couple of
hiccups that hadn't happened before. Firstly I have dual wide-screen monitors
at work and I rotate one of them 90 degrees in order to maximize the amount of
visible code on my screen. The display properties in Ubuntu only gave me the
ability to flip the display 180 degrees which seemed quite odd so I then tried
to manually rotate the display with the
[xrandr](http://en.wikipedia.org/wiki/RandR) command which reported my overall
virtual screen size as being too small for the rotation. I resolved this with
the update below to my x.org configuration to use a virtual screen size large
enough to handle the rotation while including the second monitor.

{% highlight css %}
Section "Screen"
    Identifier "Configured Screen Device"
    Device "Configured Video Device"
    SubSection "Display"
        Virtual 2880 1440
    EndSubSection
EndSection
{% endhighlight %}

The second issue was more a lack of foresight on my part than a problem with
the new install itself. After a vanilla install of any modern operating system
you'll undoubtedly be required to download a series of updates that have
occurred since the version you've installed was initially released. The
difference with most Linux distributions is that almost all of your software
is managed in this way from installing to updating, it all goes through the
same service known as a package manager - one of the many things with Linux
that once you're used to using you won't know how you ever worked without it.
So away I went with the initial round of updates which left the package
manager busy for several hours, during which time some issues arose with a
project that immediately required my attention. Unfortunately I needed to
install a handful of libraries to get up and running and with the package
manager busy I was left in a real bind. Fortunately I was able to use one of
our test servers remotely to resolve the issue but the lesson learnt here is
that for a new development system it's best to leave the initial system update
until after your development environment is completely set up.
