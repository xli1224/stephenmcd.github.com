--- 
layout: post
title: FTP Browser for gedit
tags: 
- gedit
- linux
- python
- gnome
---
Many major Linux distributions such as Ubuntu ship with
[gedit](http://projects.gnome.org/gedit/) as the default text editor. It has
all the standard features you'd expect in an editor such as syntax
highlighting, a tabbed interface and the ability to integrate external tools.
Most importantly it's highly extensible with the ability to [create plug-
ins](http://live.gnome.org/Gedit/Plugins) for it written in Python or C.

One great plug-in that's been written is [gedit-ftp-
browser](http://code.google.com/p/gedit-ftp-browser/), an FTP client that
embeds itself into the editor giving you the ability to remotely edit files
over FTP. I've just been accepted as a contributor to the project which I'm
really excited about. [I've implemented a "Save As"
feature](http://code.google.com/p/gedit-ftp-
browser/source/diff?spec=svn5&r=5&format=side&path=/trunk/FTP.py) allowing the
user to create and upload new files over FTP. Next up I'll be working on the
ability to manage multiple FTP servers via profiles.
