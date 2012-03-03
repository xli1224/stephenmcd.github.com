---
layout: post
title: Rails Quick Start for Djangonauts
tags:
- python
- ruby
- ruby on rails
- django
---

I recently started a new role at a <a href="http://rubyonrails.org/">Ruby on Rails</a> shop, which as a long time <a href="https://www.djangoproject.com/">Django</a> specialist was a really interesting opportunity. There's a lot of competition between the two frameworks' communities, ranging from friendly rivalry and respectful admiration at the mature end of the scale, to all out fanboy fuelled flame-wars at the other.

After you wade through the rivalry, the common wisdom voiced is that they're conceptually the same. If you know <a href="http://python.org/">Python</a>, go with Django and if you know <a href="http://www.ruby-lang.org/">Ruby</a>, go with Rails. After spending several months with Rails I can attest to this being true. At a bird's-eye view both frameworks contain almost identical concepts, implemented with different philosophies stemming from the ideals expressed by the languages they're written in. Both frameworks provide a vastly superior approach to security, modularity and rapid development than <a href="/2010/09/28/on-modern-web-development/">their predecessors do</a>.

An interesting question to ask would be: *which would be the best framework to choose, not knowing either language?* It would be naive of me to believe I am unbiased, but I would certainly recommend Django over Rails. The relative strictness of Python and explicitness of each component in Django, compared to the implicit magic in Rails, is simply much more geared towards creating large-scale systems in a sane and transparent way. To Ruby's credit though, I have developed a real admiration for the language itself, and have continued using it in my own projects - but that's a topic for another post.

Considering how similar the two frameworks are component-wise, one thing I did miss was a side-by-side cheat sheet for working out what each of the concepts were in Rails that I already knew well in Django. I've put one together below to help out anyone who might be picking up either framework while already knowing the other. For clarity, I've also included descriptions of each type of component, for those who haven't used either framework.

<table class="zebra-striped">
<tr>
    <th>Django</th>
    <th>Ruby on Rails</th>
    <th>&nbsp;</th>
</tr>
<tr>
    <td><a href="https://docs.djangoproject.com/en/dev/topics/http/urls/">URL patterns</a></td>
    <td><a href="http://guides.rubyonrails.org/routing.html">Routes</a></td>
    <td>Regular expression definitions for each type of URL and what part of the web site they map to.</td>
</tr>
<tr>
    <td><a href="https://docs.djangoproject.com/en/dev/topics/http/views/">Views</a></td>
    <td><a href="http://guides.rubyonrails.org/action_controller_overview.html">Controllers</a></td>
    <td>The units of code that the above regular expressions map to, that perform application logic and pass data to a rendering layer.</td>
</tr>
<tr>
    <td><a href="https://docs.djangoproject.com/en/dev/topics/templates/">Templates</a></td>
    <td><a href="http://guides.rubyonrails.org/layouts_and_rendering.html">Views</a></td>
    <td>The rendering layer that is given data from the code described above, and performs display logic typically wrapped around HTML code.</td>
</tr>
<tr>
    <td><a href="https://docs.djangoproject.com/en/dev/ref/templates/builtins/">Template tags</a> <em>(built-in)</em></td>
    <td><a href="http://www.ruby-doc.org/stdlib-1.9.3/libdoc/erb/rdoc/ERB.html">Embedded Ruby</a></td>
    <td>The flow-control language that can be used in the rendering layer.</td>
</tr>
<tr>
    <td><a href="https://docs.djangoproject.com/en/dev/howto/custom-template-tags/">Template tags</a> <em>(custom)</em></td>
    <td><a href="http://guides.rubyonrails.org/getting_started.html#view-helpers">Helpers</a></td>
    <td>The system for defining custom functions that can be used in the rendering layer.</td>
</tr>
<tr>
    <td><a href="https://docs.djangoproject.com/en/dev/topics/db/models/">Models</a></td>
    <td><a href="http://guides.rubyonrails.org/getting_started.html#getting-up-and-running-quickly-with-scaffolding">Models</a></td>
    <td>The data-definition layer that maps classes to database tables - the <a href="http://en.wikipedia.org/wiki/Object-relational_mapping">ORM</a>.</td>
</tr>
<tr>
    <td><a href="https://docs.djangoproject.com/en/dev/topics/db/managers/">Managers</a></td>
    <td><a href="http://guides.rubyonrails.org/active_record_querying.html#scopes">Scopes</a></td>
    <td>The way to extend the ORM to define custom database queries.</td>
</tr>
<tr>
    <td><a href="https://docs.djangoproject.com/en/dev/howto/custom-management-commands/">Management commands</a></td>
    <td><a href="http://guides.rubyonrails.org/command_line.html">Rake tasks</a></td>
    <td>Scripts for performing administrative tasks via the command line.</td>
</tr>
<tr>
    <td><a href="https://docs.djangoproject.com/en/dev/glossary/#term-project">Project</a></td>
    <td><a href="http://guides.rubyonrails.org/getting_started.html#creating-the-blog-application">App</a></td>
    <td>An entire application built with the framework.</td>
</tr>
<tr>
    <td><a href="https://docs.djangoproject.com/en/dev/intro/tutorial01/#creating-models">App</a></td>
    <td><a href="http://guides.rubyonrails.org/plugins.html">Plugin</a></td>
    <td>The way in which all components in the framework can grouped together in separate areas of functionality.</td>
</tr>
<tr>
    <td><a href="http://south.aeracode.org/">South</a> <em>(third-party)</em></td>
    <td><a href="http://guides.rubyonrails.org/migrations.html">Migrations</a></td>
    <td>The system used for automatically applying changes in the ORM definition to the underlying database tables, such as adding and removing columns.</td>
</tr>
<tr>
    <td><a href="https://docs.djangoproject.com/en/dev/ref/contrib/admin/">Admin</a></td>
    <td><a href="https://github.com/sferik/rails_admin">RailsAdmin</a> <em>(third-party)</em></td>
    <td>A web-based interface for authenticating administrative users and providing CRUD tools for managing data.</td>
</tr>
<tr>
    <td colspan="3">
    <p>The following table lists software that aren't part of Django or Rails, but are core parts of the Python and Ruby eco-systems, and go hand-in-hand with using either framework.</p>
    </td>
</tr>
<tr>
    <th>Python</th>
    <th>Ruby</th>
    <th>&nbsp;</th>
</tr>
<tr>
    <td><a href="http://www.virtualenv.org/">Virtualenv</a></td>
    <td><a href="http://beginrescueend.com/">RVM</a></td>
    <td>The system used for running isolated environments bound to a particular language version, combined with a set of install libraries.</td>
</tr>
<tr>
    <td><a href="http://www.pip-installer.org/">PIP</a></td>
    <td><a href="http://gembundler.com/">Bundler</a></td>
    <td>The package manager for installing libraries.</td>
</tr>
<tr>
    <td><a href="http://www.wsgi.org/">WSGI</a></td>
    <td><a href="http://en.wikipedia.org/wiki/Rack_(web_server_interface)">Rack</a></td>
    <td>A standard specification for applications to interface with HTTP, allowing for a single application entry point and middleware to be implemented.</td>
</tr>
<tr>
    <td><a href="http://fabfile.org/">Fabric</a></td>
    <td><a href="http://en.wikipedia.org/wiki/Capistrano">Capistrano</a></td>
    <td>A system for automating tasks on remote servers from a local machine, typically as part of a deployment process.</td>
</tr>
</table>

Not all of these pairings are a perfect one-to-one match conceptually, but should be good enough to get an overall view of what each concept is within both frameworks.

