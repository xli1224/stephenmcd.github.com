---
layout: post
title: Django Model Field Injection
tags:
- django
- mezzanine
- python
- orm
---

As a creator and maintainer of several popular reusable [Django](https://www.djangoproject.com/) applications, one of the most commonly requested features I'm asked for is the ability to customise the fields that a model implements. This topic comes up often on the [Mezzanine mailing list](http://groups.google.com/group/mezzanine-users), and during [this particular thread](http://groups.google.com/group/mezzanine-users/browse_thread/thread/1f1669b0091a88d5) we researched ways that fields could be dynamically injected into models at run-time.

#### Other Approaches

It's worth taking a look at other approaches to the general problem, and what their drawbacks are, in order to provide context for what the final solution needs to achieve.

One approach is to implement as many of the model classes as possible as [abstract base classes](https://docs.djangoproject.com/en/dev/topics/db/models/#abstract-base-classes), so that users can subclass these with their own models. This approach makes sense for certain types of customisation, and it's what I've done with [django-forms-builder](https://github.com/stephenmcd/django-forms-builder/blob/master/forms_builder/forms/models.py) for example. Some caveats exist with this approach however. Firstly, [relationship fields](https://docs.djangoproject.com/en/dev/ref/models/fields/#module-django.db.models.fields.related) can't be defined on the abstract models, so these need to be implemented in concrete models either within the same app, or by the user implementing their own subclasses. Secondly, any functionality that references your models, such as [views](https://docs.djangoproject.com/en/dev/topics/http/views/) or [middleware](https://docs.djangoproject.com/en/dev/topics/http/middleware/), needs to either have configurable settings for choosing which models to use, or be reimplemented entirely by the user to make use of their custom fields.

Another approach is to simply recommend that users subclass the models that the app provides using [multi-table inheritance](https://docs.djangoproject.com/en/dev/topics/db/models/#multi-table-inheritance). Unfortunately this will introduce unnecessary overhead with the extra database queries required when accessing the instances of the subclasses. Best case is that this amounts to an extra query or two in a view dealing with a single instance. Worst case is that when this approach is used with a queryset in a template, an extra query is performed for each instance returned - the classic [N+1 query problem](http://stackoverflow.com/questions/97197/what-is-the-n1-selects-problem).

#### Dynamic Injection

The ideal approach would allow users to directly modify models with their own code, outside of the models' apps, without the models themselves having to implement any special hooks for customisation. The end result being an optimal database design, with no extra API requirements for the relevant models. It just so happens that this is possible by using several features that Django exposes, and combining them together in a particular way.

The approach boils down to three concepts:

  * Dynamically adding fields to model classes
  * Ensuring Django's model system respects the new fields
  * Getting the load ordering correct for the above to work

Django's model fields provide an undocumented `contribute_to_class` method. This method serves as a fancy version of `setattr` and takes a value and attribute name to use as arguments. Internally it then takes care of all the house-keeping required for a field to be added to a model.

The other feature of Django we'll use is the [`class_prepared`](https://docs.djangoproject.com/en/dev/ref/signals/#class-prepared) signal. This signal is emitted each time a model class is declared and loaded for the first time by Django's model system.

{% highlight python %}
from django.db.models import CharField
from django.db.models.signals import class_prepared

def add_field(sender, **kwargs):
    """
    class_prepared signal handler that checks for the model named
    MyModel as the sender, and adds a CharField
    to it.
    """
    if sender.__class__.__name__ == "MyModel":
        field = CharField("New field", max_length=100)
        field.contribute_to_class(sender, "new_field")

class_prepared.connect(add_field)
{% endhighlight %}

The final consideration is connecting the `class_prepared` signal at the correct time. It needs to occur prior to the relevant model class being declared, otherwise the signal will never be triggered when we want it to. A general way of achieving this is to connect the signal from within an app that is listed before the app containing the relevant model, in the `INSTALLED_APPS` setting. Note that in the above code, we don't explicitly import the model to use it as the signal's sender, instead checking for the model's class name, as importing it would break these load ordering requirements.

#### Caveats

Like the previously described approaches, dynamic injection also comes with a set of drawbacks. These drawbacks stem from the fact that the apps containing the models being customised don't contain a definition for the fields being injected. This means that migration tools likes [South](http://south.aeracode.org/) are unable to detect the new fields, and workarounds such as creating manual migrations are required.

Another related problem is when new admin classes containing references to the custom fields are registered and the fields haven't yet been injected. A typical requirement for injected fields is to expose them via [Django's admin interface](https://docs.djangoproject.com/en/dev/ref/contrib/admin/), which can be achieved by unregistering existing admin classes for the models that fields are being injected into, subclassing these admin classes with new references to the injected fields, and registering the new admin classes. Unfortunately if this unregister/register dance occurs in an admin module, the fields may not have yet been injected. A quick work-around for this is to perform the unregister/register calls inside your project's urlconf.

#### Mezzanine Support

Drawbacks aside, the field injection technique described above has characteristics that make it incredibly useful. As such the approach has first-class support in [Mezzanine](http://mezzanine.jupo.org) by way of the `EXTRA_MODEL_FIELDS` setting. This setting allows you to define a sequence of all the custom fields you'd like to inject. Each item in the sequence contains four items: the dotted Python path to the model (including the field name to use for injection), the dotted Python path to the field class to use for the injected field, a sequence of the field's position arguments, and finally a dict of its keyword arguments.

{% highlight python %}
EXTRA_MODEL_FIELDS = (
    # Add a custom image field from the fictitious somelib.fields module
    # to Mezzanine's BlogPost model:
    (
        # Dotted path to field.
        "mezzanine.blog.models.BlogPost.image",
        # Dotted path to field class.
        "somelib.fields.ImageField",
        # Positional args for field class.
        ("Image",),
        # Keyword args for field class.
        {"blank": True, "upload_to": "blog"},
    ),
    # Example of adding a field to *all* of Mezzanine's content types:
    (
        "mezzanine.pages.models.Page.another_field",
        "IntegerField", # 'django.db.models.' is implied if path is omitted.
        ("Another name",),
        {"blank": True, "default": 1},
    ),
)
{% endhighlight %}

Mezzanine then uses this setting to inject all of the fields defined, using `class_prepared` and `contribute_to_class` as described earlier. It handles getting load order correct by performing the injection within the [`mezzanine.boot`](https://github.com/stephenmcd/mezzanine/blob/master/mezzanine/boot/__init__.py) app, which is forced to the front of all apps defined in `INSTALLED_APPS`.