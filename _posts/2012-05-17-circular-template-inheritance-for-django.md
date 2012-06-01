---
layout: post
title: Circular Template Inheritance for Django
tags:
- django
- python
- mezzanine
---

One of Django's many great features is its powerful [template inheritance][template-inheritance]. A decade ago we would use simple concepts like include files
for platforms such as ASP and PHP, allowing us to create reusable template snippets that could be embedded in multiple pages. Later, ASP.NET and Ruby on Rails would improve on this with their master/layout concepts, allowing us to define a base skeleton template for a site, with an area that all other pages would inject their content into. Django takes this approach even further with its template inheritance. It allows templates to extend other (parent) templates, with those parent templates containing named blocks that can be overridden. The blocks in the parent template can contain default content, and when overriding these blocks, the default content can be overridden, left as is, or even prefixed with or appended to, as the child template will have access to the default content in the parent template's block. This is analogous to object oriented programming, where base classes can be subclassed, and have their methods overridden, with access to the super-class's methods to be called at whatever point is deemed appropriate.

#### Overriding vs Extending

Another powerful feature of Django's is its [template loaders][template-loaders]. Each loader implements an approach for finding and loading the contents of a template when it's requested by name. A typical Django project will contain multiple template loaders, and when a template is loaded by name, that name will be passed through each of the loaders sequentially, until one of the loaders finds the template.

The two most commonly used template loaders are the ``filesystem`` loader and the ``app_directories`` loader. The ``filesystem`` loader will look at the ``TEMPLATE_DIRS`` setting, and search each of the directory paths in it for the requested template. The ``app_directories`` loader is similar, but will look for a directory called "templates" in each of the apps listed in the ``INSTALLED_APPS`` setting.

{% highlight python %}
TEMPLATE_LOADERS = (
    "django.template.loaders.filesystem.Loader",
    "django.template.loaders.app_directories.Loader",
)

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIRS = (os.path.join(PROJECT_ROOT, "templates"),)
{% endhighlight %}

Reusable Django apps will often provide a default set of templates where applicable, and the app's views functions will load these templates by name. With both the ``filesystem`` and ``app_directories`` template loaders configured, the app's version of the template will be loaded, unless a template with the same name is found in the project's templates directory, since the ``filesystem`` loader is listed first in the ``TEMPLATE_LOADERS`` setting. This allows a project developer to easily override the templates for a third-party app by copying it into their project's templates directory, in order to customise the look and feel of the app.

A problem arises for the project developer however, when the app's template contains sufficiently complex features, like many extendable template blocks, template variables, and more. Once they copy the template to their project's templates directory, they're essentially forking it, that is, they'll no longer be able to seamlessly make use of any new features for that template in future versions of the third-party app. Worst case is that an upgrade to the app will break their project, until they copy the new version of the template and customize it again, or upgrade their own copy by hand to be compatible with the latest version of the app.

With a complex template like this, more often than not the project developer may simply want to change it in a very small way, such as modifying the content in one of its blocks. Wouldn't it be nice if you could use template inheritance to extend the app's template, and simply override the relevant blocks as desired? Unfortunately this isn't possible with Django due to circular template inheritance. The app's view will be looking for the template to load by a given name. If we want our project's version to be used, we need to use the same template name for it to be loaded. If our project's version of the template tries to extend a template with the same name, Django will load our project's template again when looking for the parent template to extend, resulting in an infinite loop that will never complete. Django's template inheritance isn't smart (or stupid) enough to ignore the absolute path of the current template being used, when searching for the parent template to extend.

#### Alternative Approaches

The general approach to dealing with this problem, is for app developers to separate the name of of the template being loaded by their view, from the parts of the template that a project developer may want to customise. This might involved breaking all of the features up into separate include files that can be overridden individually. Another approach is to make each view load an empty template that extends the real template - developers can then override the empty template, end
extend the real template as required.

These ideas were recently [brainstormed on the Mezzanine mailing list][mailing-list-template-thread], in an effort to make Mezzanine's templates more customisable.
While these approaches might work extremely well for individual Django apps that only provide a handful of default templates, the question of complexity and maintenance comes up with larger-scale projects like Mezzanine which contains almost 100 template files at the moment. All of a sudden we're looking at a minimum of doubling the number of template files - even more if we get more granular with includes. We've lost the simplicity of simply checking which template a view loads, and copying it to our project for customisation. So the question was proposed as to how could we possibly get circular template inheritance to work - if that was possible, we'd have a fantastic tool for both overriding and extending templates at once, without any wide-sweeping changes to the template structure across the entire project. Read on for the gory details of how it's quite possible.

#### Hacks Inside

Fair warning: the rest of this post describes an unorthodox approach that allows circular template inheritance to work. It's a little bit crazy, it's a little bit cool. Some would call it a terrible hack, your mileage may vary. If you're going to use it, consider the actual problem it solves, and whether or not it applies to your situation. Understand what it does, test it, and weigh it up against the alternative approaches described earlier.

The problem can be boiled down to one of state - when Django's ``extends`` template tag is used and the parent template to extend is searched for, the tag contains no knowledge of the extending template calling it. If it did, we could theoretically exclude its path from those being used to search for the parent template. So a possible solution might involve two steps:

* Make the ``extends`` tag aware of the path for the template that's calling it.
* Search for a template with the same name, preferably using Django's template loaders, and exclude the path of the template doing the extending.

Both of these steps are achievable thanks to the grace of the ``filesystem`` and ``app_directories`` template loaders. When either of these loads a template, they
mark the template object returned with an ``origin`` attribute, which contains the full path of the template file that was loaded.

From this point we could go ahead and fulfill the second step by searching all other possible file-system paths for a template with the same relative template path, excluding the absolute path we've extracted from the template origin, but ideally we'd like to leverage the template loaders to do this. Fortunately this is a breeze given the way template loaders work. Each of the template loaders can accept a list of directories to use, and will fall back to a default if none are specified. The ``filesystem`` loader will use the directories defined by the ``TEMPLATE_DIRS`` setting, and the ``app_directories`` loader will use a list of template directories for all of the ``INSTALLED_APPS`` which it builds up when first loaded. I've never seen these used in practice, but there they are just begging to be exploited as the perfect solution to our template searching problem. Django's ``find_template`` function allows you to pass in a list of directories, which will then be forwarded on to each of the template loaders when called to find a template.

#### Extending Extends

Now that we have the theoretical hooks needed, it's time to implement our template tag. Again we find ourselves in the situation where the pieces of Django we need to touch are structured perfectly to do what we need. The ``extends`` tag is implemented using the ``ExtendsNode`` class. It contains a ``get_parent`` method, which is responsible for loading the parent template object that is being extended. So all we need to do is subclass ``ExtendsNode`` and override ``get_parent``. I've dubbed this approach "overextending", since it allows you to both override and extend a template at the same time.

{% highlight python %}
from django.conf import settings
from django.template.loader import get_template, find_template
from django.template.loader_tags import ExtendsNode

class OverExtendsNode(ExtendsNode):

    def get_parent(self, context):

        # This is the list of template directories for ``INSTALLED_APPS``
        # that the ``app_directories`` template loader uses. We can't
        # import it at the module level, as this template tag needs to be
        # added to built-ins so that it can be loaded without a call to
        # the ``loads`` tag.
        from django.template.loaders.app_directories import app_template_dirs

        # Load the parent template, which is actually the template
        # this tag is being called from. We'll then look at the first
        # template node in it, which is the same instance as the template
        # tag being called. We then resolve its parent arg as well, and
        # compare it to the first parent loaded, and if equal, we know
        # that circular inheritance has been triggered.
        parent = self.parent_name.resolve(context)
        t = get_template(parent)
        if t.nodelist and isinstance(t.nodelist[0], ExtendsNode):
            first_node_template = t.nodelist[0].parent_name.resolve(context)
            if first_node_template == parent:
                # Build a list of all template directories to search in.
                all_dirs = list(app_template_dirs + settings.TEMPLATE_DIRS)
                # Remove the path of the current template, to exclude it
                # from the search.
                template_dirname = t.origin.name[:-len(parent) - 1]
                all_dirs.remove(template_dirname)
                return find_template(parent, all_dirs)[0]
        return t
{% endhighlight %}

All that remains is creating the ``overextends`` template tag function that uses ``OverExtendsNode``. For this we can pretty much copy pasta Django's ``extends`` tag function, replacing ``ExtendsNode`` with ``OverExtendsNode``.

#### Diving Deeper - Unlimited Inheritance Levels

Keeping in mind that this approach is is specifically geared towards solving the problem of both overriding and extending a template in a third party app, that is, one we don't want to modify the source code of, our approach so far works. But what if we wanted to overextend a template that also overextends _another_ template? Say for example our project template overextends a template in third-party app "A", which is dependent on a template in third-party "B", that it _also_ overextends. This is quite an edge case, but the code above would fail in this scenario. When the template in app "A" tries to overextend the template in app "B", it would exclude itself from the search path, and end up loading our project's version of the template, and we're back to square one with circular inheritance never completing.

This is less of an edge case and much more likely, with frameworks like Mezzanine, where it's common for people to create themes as third-party apps. The theme provides a set of templates and static files, and gets added to ``INSTALLED_APPS`` just as a regular Django app would. With the approach of overextending introduced into the eco-system, theme developers may overextend Mezzanine's templates, and project developers may overextend the theme's templates. Taking this into account, our approach so far looks quite handicapped.

Again we have a state problem - the second and subsequent calls to ``overextends`` have no knowledge of the previous calls, so they can't exclude the chain of template directories that have been so far excluded when overextending.

We can solve this problem by making use of the template context to store the state of directories excluded so far when using ``overextends``. We store a dictionary mapping template names to lists of directories available. In the code above, we build the full list of directories to use each time ``overextends`` is called. If we maintain that list in the template context, removing from it each time ``overextends`` is used, we can support unlimited levels of circular template inheritance.

Here's a complete version along with the ``overextends`` tag function, supporting multiple levels of circular template inheritance, and handling a few other edge cases that may come up, such as template origins not existing, and template objects as parent args.

{% highlight python %}
from django.conf import settings
from django import template
from django.template import Template, TemplateSyntaxError
from django.template.loader import get_template, find_template
from django.template.loader_tags import ExtendsNode

register = template.Library()

class OverExtendsNode(ExtendsNode):

    def get_parent(self, context):

        # This is the list of template directories for ``INSTALLED_APPS``
        # that the ``app_directories`` template loader uses. We can't
        # import it at the module level, as this template tag needs to be
        # added to built-ins so that it can be loaded without a call to
        # the ``loads`` tag.
        from django.template.loaders.app_directories import app_template_dirs

        # Load the parent template, which is actually the template
        # this tag is being called from. We'll then look at the first
        # template node in it, which is the same instance as the template
        # tag being called. We then resolve its parent arg as well, and
        # compare it to the first parent loaded, and if equal, we know
        # that circular inheritance has been triggered.
        parent = self.parent_name.resolve(context)
        t = get_template(parent)
        if t.nodelist and isinstance(t.nodelist[0], ExtendsNode):
            first_node_template = t.nodelist[0].parent_name.resolve(context)
            if first_node_template == parent:
                template_dirname = lambda t: t.origin.name[:-len(parent) - 1]
                # Set up the context dictionary that will map overextended
                # template names to list of unused template directories.
                context_name = "OVEREXTENDS_DIRS"
                if context_name not in context:
                    context[context_name] = {}
                if parent not in context[context_name]:
                    all_dirs = list(app_template_dirs + settings.TEMPLATE_DIRS)
                    context[context_name][parent] = all_dirs
                    # This is the first circular extend for this
                    # template name. Remove the initial directory for
                    # the first inheritence step.
                    context[context_name][parent].remove(template_dirname(t))
                next = find_template(parent, context[context_name][parent])[0]
                # Remove the origin for the next parent (the one we'll
                # be using) from the cached list of available template
                # directories, so that it won't be used on subsequent
                # circular extends for this template name.
                context[context_name][parent].remove(template_dirname(next))
                return next
        return t

@register.tag
def overextends(parser, token):
    """
    Extended version of Django's {% literal %}{% extends %}{% endliteral %} tag that allows circular
    inheritance to occur, eg a template can both be overridden and
    extended at once.
    """
    bits = token.split_contents()
    if len(bits) != 2:
        raise TemplateSyntaxError("'%s' takes one argument" % bits[0])
    parent_name = parser.compile_filter(bits[1])
    nodelist = parser.parse()
    if nodelist.get_nodes_by_type(ExtendsNode):
        raise TemplateSyntaxError("'%s' cannot appear more than once "
                                  "in the same template" % bits[0])
    return OverExtendsNode(nodelist, parent_name)
{% endhighlight %}

The final step required is to automatically add our ``overextends`` tag to Django's built-in tags. Django's ``ExtendsNode`` uses a feature where it gets marked as having to be the first tag in a template (``ExtendsNode.must_be_first`` is set to ``True``). This means that it (and subsequently our ``ExtendsNode`` subclass) need to be available without having to load the template library that implements it. This is as simple as calling the ``django.template.loader.add_to_builtins`` function from your project's settings module, passing it the Python dotted path as a string for the module that contains out ``overextends`` tag.

[template-inheritance]: https://docs.djangoproject.com/en/dev/topics/templates/#template-inheritance
[template-loaders]: https://docs.djangoproject.com/en/dev/ref/templates/api/#loader-types
[mailing-list-template-thread]: https://groups.google.com/group/mezzanine-users/browse_thread/thread/b14c9d71ffc86644#

