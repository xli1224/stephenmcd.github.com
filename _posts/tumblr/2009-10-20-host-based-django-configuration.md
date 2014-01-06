---
layout: post
title: Host-Based Django Configuration
tags:
- django
- python
- hacks
---

Lately I've noticed people posting various different takes on making the
default Django settings a lot more dynamic. The development and deployment
requirements for the projects I work on tend to be far from straight-forward
and over time I've come up with my own approach to Django settings, so here it
is.

The simplest approach typically involves importing all the names from a custom
settings module at the end of the project's standard settings module,
providing the ability to override settings on a per machine basis.

{% highlight python %}
try:
    from local_settings import *
except ImportError:
    pass
{% endhighlight %}

This still requires modifying `local_settings.py` on a per machine basis.
Another approach that builds on this is to import a custom settings module
from a `host_settings` package that has a unique name derived from the current
machine the site is running on - this gives the advantage of being able to
specify custom settings per machine and have each of these settings modules
reside in the version control system, without the same file having to be
modified on a per machine basis.

{% highlight python %}
from socket import gethostname
try:
    exec ("from host_settings.%s import *" %
        gethostname().replace("-", "_").replace(".", "_"))
except ImportError:
    pass
{% endhighlight %}

This simple version of the `host_settings` approach I've seen attempts to deal
with the differences between a valid hostname and a valid module name with the
two calls to replace, but ignores the fact a hostname could begin with a
number which would be an invalid module name. Other versions of this approach
handle this correctly and involve calling the `__import__` built-in, iterating
over and updating each name in the settings module individually, but once we
look at some further requirements below and how to deal with them we'll find
this isn't necessary.

Let's take a step back for a moment and talk about some of the requirements I
mentioned before. Where I work a project can end up deployed in a dozen
different locations - a handful of developer machines and various different
servers managing the project life cycle. Due to a variety of non-technical
reasons it's often required that various versions of a project run side by
side in the same location, so with a project called `project_x` we end up with
`project_x_feature_a` and `project_x_feature_b` sitting in the same location -
all of a sudden all of our references to `project_x` are broken. So we end up
taking the approach in our code that the actual name of a project's directory
is a moving target and should never be referenced - we never import from
`package_x` and anything in our settings module that would typically reference
this we set dynamically.

{% highlight python %}
import os
project_path = os.path.dirname(os.path.abspath(__file__))
project_dir = project_path.split(os.sep)[-1]
MEDIA_URL = "/site_media/"
MEDIA_ROOT = os.path.join(project_path, MEDIA_URL.strip("/"))
TEMPLATE_DIRS = (os.path.join(project_path, "templates"),)
ADMIN_MEDIA_PREFIX = "/media/"
ROOT_URLCONF = "%s.urls" % project_dir
{% endhighlight %}

So that removes any hard-coded reference to the project's directory name,
however we sometimes have to go as far as having host specific settings that
vary across these different project versions residing on the same machine,
such as a different database for example. The ultimate goal here is to not
have any files in the project's version control repository that are manually
edited for a specific instance of the project. So using the `host_settings`
approach from earlier on, we continue on from the code above by using the
`project_dir` variable when referencing the machine specific `host_settings`
module so that each of the `host_settings` modules are named not only after
the machine they exist for, but the project directory as well.

{% highlight python %}
from socket import gethostname
host_settings_module = "%s_%s" % (project_dir,
    gethostname().replace("-", "_").replace(".", "_").lower())
host_settings_path = os.path.join(project_path, "host_settings",
    "%s.py" % host_settings_module)
if not os.path.exists(host_settings_path):
    try:
        f = open(host_settings_path, "w")
        f.close()
    except IOError:
        print "couldnt create host_settings module: %s " % host_settings_path
try:
    exec "from host_settings.%s import *" % host_settings_module
except ImportError:
    pass
TEMPLATE_DEBUG = DEBUG
{% endhighlight %}

As an added bonus, we try to create the `host_settings` module if it's missing
and warn if we're unable to create it.
