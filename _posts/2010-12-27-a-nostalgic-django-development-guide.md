---
layout: post
title: A Nostalgic Django Development Guide
tags:
- python
- django
- mercurial
- documentation
- bitbucket
- devops
- fabric
- south
- version control
---

While most of the following article was written back in 2010, I'm actually publishing it in 2014, so let me provide a little background to start with. I was recently searching through my email, and accidentally came across an old internal document I wrote for my team and had since long forgotten about, titled *Django Development and Deployment using Mercurial, South and Fabric.doc*. It was an enjoyable read for me, comparing my approach back then to the way I work now. Some things have changed to a great extent, for example you'll find references to [mod_python][modpython], software that's considered completely obsolete now. Amusingly on the other hand, some things haven't changed much at all, as I realised a lot of what I wrote about then is still generally applicable today.

So keeping in mind there are some outdated references, here's the guide, unchanged.

#### Introduction to Mercurial

[Mercurial][mercurial] is a [distributed version control system][dvcs]. The main difference between it and a traditional centralised version control system like [SVN][svn] is that there is no need for a central server for the repository. Committing, branching and all other version control operations can be performed locally without ever needing a connection to the Internet or local network. To achieve this, each physical copy of the code-base contains its own copy of the the repository itself, containing the entire history of the project. The repository is contained within the hidden ``.hg`` directory inside the physical copy of the project. For clarity this is referred to from here on as the *local repo*, whereas the actual files that make up the code-base of the project are referred to as the *working copy*.

The local repo can be thought of quite simply as a list of changes (changesets) that represent the history of the project. We move the project around between different machines by synchronising the changesets between different copies of the repository, using the ``hg push`` and ``hg pull`` commands. In order to push to, or pull from, another physical instance of the repository on a remote machine, the repository must be accessible over the network which can be achieved by using the command ``hg serve``. Here is where a hosting service like [BitBucket][bitbucket] is used to provide a central location for all communication to pass through, much like an SVN server. The added advantage of using a service like BitBucket is that it also provides a wealth of extra features such as authentication (identifying users), authorisation (establishing permissions) and issue tracking.

#### Basic Development & Deployment

Every location where the project will be stored such as development machines and different server environments, will contain both a copy of the repository as well as a working copy of the project. Each location is initialised by running ``hg clone URL`` where *URL* is the URL of the remote repository such as one hosted on BitBucket.

With [Django][django] projects we typically include a snippet at the end of the project's settings module such as this:

{% highlight python %}
try:
    from local_settings import *
except ImportError:
    pass
{% endhighlight %}

This allows us to have a ``local_settings.py`` module which can contain overriding values for settings that are specific to the particular environment it is located at. We therefore exclude this module from version control by adding it to the ``.hgignore`` file in the root of the project. The settings we might override are typically ``DEBUG`` and database settings. As such, configuring the ``local_settings.py`` module is usually a required step for initialising a new location for the project.

After editing the files that make up a single changeset, for example a feature addition or a bug fix, use the command ``hg commit`` to commit the changes, additions and deletions to the local repo. A few variations of this are:

* ``hg commit`` - commits all edited files
* ``hg commit file1.py`` - commits only the edited file named *file1.py*
* ``hg commit -m *Fixed issue #15*`` - commits all edited files with the given commit message
* ``hg commit -A`` - commits all edited, added and removed files
* ``hg commit -Am *Added missing file*`` - combines the previous two arguments

Once you are ready to deploy all of your changesets, use the command ``hg push URL`` which will push all of the outgoing changesets in your local repo to the repo located at the given URL. If the URL argument is omitted, the URL for the location you originally cloned from (referred to as default) will be used, which in most cases is the desired location. You can also view the outgoing changesets before pushing by using the command ``hg outgoing``.

You can then [SSH][ssh] onto the server you would like to deploy your changes to, go to the location of the project and use the command ``hg pull`` to pull down any incoming changesets. Like ``hg push``, ``hg pull`` can also take a URL as an argument but in our work-flow this can typically be left to the default URL referencing BitBucket. You can also view the incoming changesets before pulling by using the command ``hg incoming``.

Using the command ``hg pull`` only modifies the local repo, while the files in our working copy remain unchanged. To update the working copy to the latest changeset (referred to as the tip) use the command ``hg update -C``. The ``-C`` argument signifies a *clean* update which means it will disregard any manual changes that have been made to the current working copy if there is a conflict between it and the version in the local repo. Performing a clean update means never having to deal with any conflicts in a live environment, which would occur if a file was manually modified on the server without being committed into the repo, or a file was manually uploaded via [FTP][ftp] – in order to achieve a completely automated deployment process, these practices should be avoided.

Once the working copy is updated, depending on the web server you are using you will typically need to tell it to reload the Django application - this step is specific to the web server being used.

#### Environment & Feature Branches

As with most version control systems, Mercurial has a concept of working with branches inside a single repository, where each branch represents a different independent state of the repository. Each physical copy of the repository always has a single branch set as active which can be viewed using the command ``hg branch``. Branches can be created at any point during development using the command ``hg branch branchname`` where *branchname* is the name of the new branch. To switch your local repo to a different existing branch, use the command ``hg branch branchname -f``. The ``-f`` argument signifies a *forced* change of branch, since the branch name already exists. After setting the active branch to an existing branch name, use the command ``hg update`` which will update the working copy of the project to the newly set branch. The previous two steps of changing to an existing branch then updating the working copy to reflect it can be performed in a single step, by using the command ``hg update branchname`` where *branchname* is the name of the existing branch.

Inevitably overlap occurs between different customer requests for changes such as feature enhancements and bug fixes. Sometimes these overlapping changes affect the same parts of the code-base. A simple example might be the ongoing development of a significant new feature. During this development period, a critical bug may be discovered that overlaps with the new feature being developed. The fix needs to be deployed immediately without the new feature being published to the live environment.

It therefore becomes convenient to create branches that represent each desired state of the repository. These states fall under two categories, environments and features. Features represent an isolated area of development while an environment is an isolated location of the project, such as a staging environment for the client's approval or the final live production environment. Creating branches for each individual feature development and environment affords complete flexibility in being able to control which areas of development appear in which particular environments.

The local repo in each server environment has its own branch set as the active branch, such as *staging* or *live*. Building on the deployment process described earlier, simply create each branch name locally (e.g. ``hg branch staging``), synchronise the new branch with BitBucket (``hg push``) and SSH onto the physical location of the environment where you can use the commands ``hg pull`` to synchronise the local repo there with BitBucket. Then use the command ``hg update staging`` to set the local repo's active branch to the new environment-specific branch for staging.

When development on a new feature begins, a branch is created for it and commits are made to that branch. When the feature is ready for deployment to a given environment, the feature branch can then be merged into the environment branch by setting the active branch locally to the environment's branch, e.g. ``hg update staging`` and then using the command ``hg merge branchname`` where *branchname* is the name of the feature branch. The process of deployment is then as simple as going to the physical location of the staging environment's repository over SSH and using the commands ``hg pull`` and ``hg update -C``, with the main consideration being that its active branch is always set to *staging* which now contains all the changesets from the feature branch you have just merged.

If for any reason you need to revert the deployment, you can simply use the command ``hg update rev`` where *rev* is the revision number of the particular changeset you wish to update the working copy back to. You may wish to make note of the current revision number prior to running the command ``hg pull`` by using the command ``hg tip`` which will display all of the information for the latest changeset in the local repo, including its revision number.

#### Database Migrations with South

When new database models are added to your project, Django can automatically create the corresponding database tables using the command ``python manage.py syncdb``, however this does not account for changes to existing models. Fortunately there are several third party solutions which can automate the database changes required when the fields of a model change. The most popular of these applications is called [South][south]. South consists of two key parts - migration scripts which contain auto-generated Python code, and the execution history of these scripts for a given instance of the project which is stored in that instance's database. There is a clear distinction between these two parts that should be realised, in that the migration scripts are part of the code-base and its associated Mercurial repository, while the execution history is part of a database and its associated physical environment where an instance of the project is stored.

Once South is installed on your system or virtual environment, adding it to your project is as simple as adding *south* to your ``INSTALLED_APPS`` in your project's settings module and running ``python manage.py syncdb`` to create the initial database table used for storing South's execution history.

South operates on a single Django application. The auto-generated migration scripts are stored in the *migrations* directory within each application. Each time you make a change to the fields for the models in the application, you will generate a migration script which represents the migration from one state of the application's models to the next, and contains internal *forwards* and *backwards* routines for moving between these states. The name of each migration script is derived from a four digit sequential index and a description of the change. The four digit index starts from 0001 and can be referenced as an identifier for the migration in various operations.

To configure an existing application to be managed by South, use the command ``python manage.py convert_to_south appname`` where *appname* is the application name. This will generate the initial migration script which will typically be found at the location ``appname/migrations/0001_initial.py`` where *appname* is the path your application resides in.

After making changes to the model fields in an application that is using South, use the command ``python manage.py schemamigration appname --auto`` where *appname* is the application name containing the changed model fields - this will generate the next migration script. As mentioned, these migration scripts should be committed into the repository along with the actual changes to the model fields. When these changes and migration scripts are deployed to a new environment, use the command ``python manage.py migrate`` which will check the execution history stored in the database to determine which migration scripts have already been executed, and execute any new migrations that have since been pulled down from BitBucket.

It is worth exploring the source code for a migration script that is generated after a change to a model occurs. As mentioned each migration script contains *forward* and *backward* routines. These are implemented as methods of the ``Migration`` class inside the migration script and named ``forwards`` and ``backwards`` respectively. Within these methods you are free to implement any custom functionality required for the migration. A simple example would be changing the data type of a field on a model that contains existing data in production which you may wish to split into three separate migrations. The first migration would create a temporary field with the new data type, along with custom code that then converts the data from the old field into the temporary field. The next migration then changes the data type of the original field. The final migration then copies the data from the temporary field back into the original field, prior to deleting the temporary field.

If for any reason you need to revert the migration, you can simply use the command ``python manage.py migrate appname index`` where *appname* is the name of the application containing the migration you wish to revert, and *index* is the four digit index mentioned earlier that prefixes the name of the migration script you wish to revert back to.

#### Automated Deployment with Fabric

We can now see that depending on the complexity of the changes involved, our deployments may be comprised of a decent number of steps that need to be performed:

* Set the local repo to the deployment branch and update its working copy
* Merge the feature branch into the working copy
* Commit the merge to the deployment branch
* Synchronise BitBucket with the local repo
* Connect over SSH to the deployment server
* Change the current directory to the physical location of the deployment
* Synchronise the local repo with BitBucket
* Update the working copy of the project
* Synchronise the database
* Run any migrations
* Trigger the web server to reload the running application

While it is critical to be intimately familiar with each of these steps in case something does go wrong, performing each of these can become very tedious after a while. We could automate a lot of these using a combination of local and remote scripts, however taking this idea one step further we can use a tool called [Fabric][fabric], which essentially allows us to build deployment *recipes*, combining sequences of commands that can be run across different remote environments, all with a single command. Again it is critical to be very familiar with each of the steps involved in deployment - if you are not then I would recommend not using Fabric until you have gotten to the stage where you have made mistakes, learnt from them and end up at a point where you know each step inside and out.

Fabic recipes are made up entirely of regular Python functions, found in a script which should be named ``fabfile.py`` and stored in the root of your project. Once Fabric is installed on your system or virtual environment, use the command ``fab func1 func2 func3`` where each of the *func* arguments are the names of the recipe functions you would like to sequentially execute in order to perform your deployment.

The ``fabfile.py`` script contains a global environment variable called ``env`` that provides attributes for setting up SSH credentials for a particular deployment environment, such as the user and host names. A simple approach to deployment recipes is to define setup functions for each of the deployment environments that each configure the ``env`` attributes for the relevant environment, and then functions that perform each of the deployment tasks. Here is an example ``fabfile.py``:

{% highlight python %}
from fabric.api import *

def staging():
    """
    Set up the env variables for the staging environment.
    We define some custom attributes such as project path
    and the command for reloading the web server which
    in this case is Apache/mod_python.
    """
    env.user = "staging-user"
    env.hosts = ["staging.domain.com"]
    env.branch = "staging"
    env.path = "/path/to/staging/project/"
    env.reload = "apache2ctl graceful"

def live():
    """
    Set up the env variables for the staging environment.
    We define some custom attributes such as project path
    and the command for reloading the web server which
    in this case is Apache/mod_wsgi.
    """
    env.user = "live-user"
    env.hosts = ["live.domain.com"]
    env.branch = "live"
    env.path = "/path/to/live/project/"
    env.reload = "touch %sdeploy/wsgi.py" % env.path

def deploy(merge=None):
    """
    Pulls down the latest changesets from the default repo
    and updates the working copy, then makes any required
    database changes, and triggers the web server to reload
    the application. If a given branch name to merge is
    provided then first merge it into the environment's
    branch and push those changes to BitBucket.
    """
    require("user", "hosts", "path", "reload",
            provided_by=["staging", "live"])
    if merge is not None and hasattr(env, "branch"):
        local("hg update %s" % env.branch)
        local("hg merge %s" % merge)
        local("hg commit -m 'Merging %s into %s'" % (merge, env.branch))
        local("hg push")
    with cd(env.path):
        run("hg pull")
        run("hg update -C")
        run("python manage.py syncdb")
        run("python manage.py migrate")
        run(env.reload)

def rollback(mig=None, rev=None):
    """
    Perform a migration rollback if a migration appname and
    number are given in the format ``appname.number``, and
    perform a Mercurial rollback if a revision number is given.
    """
    require("user", "hosts", "path",
            provided_by=["staging", "live"])
    with cd(env.path):
        if mig is not None:
            try:
                app, index = mig.rsplit(".", 1)
                int(index)
            except ValueError:
                abort("Migration was not in the "
                      "format appname.index: %s" % mig)
            run("python manage.py migrate %s %s" % app, index)
        if rev is not None:
            run("hg update -C %s" % rev)
{% endhighlight %}

We can now perform a deployment to staging using the command ``fab staging deploy`` or live using the command ``fab live deploy``. The ``env.user`` and ``env.hosts`` variables are part of Fabric's API and control how Fabric connects to the deployment environment over SSH. We then define some of our own environment variables such as ``env.path`` and ``env.reload`` which we use in our ``deploy`` function to signify the deployment's physical directory and command for triggering the web server to reload the application which could be different across environments.

In our ``deploy`` function we make use of Fabric's ``require`` function which ensures that the given environment variables have been defined, and also lets us specify which functions will provide values for those variables should someone accidentally try and deploy without first calling one of the setup functions. We also make use of Fabric's ``cd`` context manager which allows us to run a sequence of commands from a given directory. We also provide an optional named argument ``merge`` which accepts the name of a feature branch to automatically merge into the branch of the environment we are deploying to. For example to deploy a feature branch named *foo* to the environment named *staging* use the command ``fab staging deploy:merge=foo``.

If for any reason you need to revert the deployment, we have also defined a ``rollback`` function which accepts one or both named arguments - a migration application name and number to revert any database changes that were performed, and a Mercurial revision number to revert the working copy of the project back to. It should be noted here that the migration is reverted before the code is reverted, since reverting the code could potentially remove the required migration scripts needed to revert the migration. For example, to revert a deployment and its migrations on the live environment to the previous state where the tip revision was 42, and the last migration for the application named *bar* was 0007, use the command ``fab live rollback:mig=bar.0007,rev=42``.

#### Further Reading

We have merely touched the surface of each of the tools involved in order to demonstrate how they can be used in conjunction to provide a flexible automated development and deployment process. For a more in depth understanding of Mercurial, South and Fabric use the following resources:

* [http://hginit.com]() - A comprehensive and easy to follow Mercurial tutorial, covering the migration path from a centralised to a distributed version control system
* [http://mercurial.selenic.com/guide/]() - The Mercurial Guide
* [http://south.aeracode.org/docs/tutorial/]() - The South Tutorial
* [http://south.aeracode.org/docs/]() - The South Documentation
* [http://fabfile.org]() - The Fabric Documentation

[modpython]: http://modpython.org
[mercurial]: http://mercurial.selenic.com
[dvcs]: http://en.wikipedia.org/wiki/Distributed_Concurrent_Versions_System
[svn]: http://subversion.tigris.org/
[bitbucket]: https://bitbucket.org
[django]: https://www.djangoproject.com/
[ssh]: http://en.wikipedia.org/wiki/Secure_Shell
[ftp]: http://en.wikipedia.org/wiki/File_Transfer_Protocol
[south]: http://south.aeracode.org
[fabric]: http://fabfile.org
