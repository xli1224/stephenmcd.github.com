---
layout: post
title: "Grillo, a Terminal Based Chat Server and Client"
---

I recently came across the [Rosetta Code Project](http://rosettacode.org/).
It's a community contributed wiki that contains [hundreds of solutions to
programming problems](http://rosettacode.org/wiki/Category:Programming_Tasks),
implemented in [hundreds of different programming
languages](http://rosettacode.org/wiki/Category:Programming_Languages), which
is great source of entertainment for a programming languages enthusiast such
as myself. The main focus of the project isn't to demonstrate individual
solutions on their own, but to provide comparisons between different
programming languages and how they approach the same task.

The wiki also contains various dynamic reports, such as [which tasks have yet
to be implemented for each particular programming language](http://rosettacode
.org/wiki/Category:Unimplemented_tasks_by_language). I took a look at [the
Python
page](http://rosettacode.org/wiki/Reports:Tasks_not_implemented_in_Python) to
see if there were any interesting tasks remaining that I could potentially
provide a solution to, and as I expected there were only a few relatively
obscure tasks that were yet to have solutions provided.

One task remaining for Python that did catch my eye was to [demonstrate a
simple chat server using sockets](http://rosettacode.org/wiki/Chat_server).
I've always been especially fond of network programming, from web crawlers to
XMLRPC to lower level sockets, I seem to really enjoy writing code that runs
over the Internet without necessarily being related to web development, so I
went ahead and added a [Python solution for the chat server
task](http://rosettacode.org/wiki/Chat_server#Python).

I honestly had so much fun working on this that I decided to extend it even
further. Firstly I refactored it into a more object oriented approach which
allowed for creating both server and client tools which could be run
concurrently using separate threads of control. I then added several commands
that could be run directly in chat by any user, for example listing the
current users who were logged in.

I then decided to publish the code for my chat server and client onto both
[GitHub](https://github.com/stephenmcd/grillo) and
[Bitbucket](https://bitbucket.org/stephenmcd/grillo), after giving it the name
"Grillo". It's named after the [Italian
phone](http://en.wikipedia.org/wiki/Grillo_telephone) of the same name,
developed in 1965. They both share the common theme of being a very small
communications device for their class, while being implemented with relatively
basic technology.

Given that there are many richer and more powerful applications available for
implementing the features Grillo provides, at the least it serves as a good
example of how to do basic socket programming in Python, as well as a
demonstrating some simple tricks for controlling threads. At the best case
someone will pick up the code base and extend it further in ways I haven't
anticipated - here's hoping!

