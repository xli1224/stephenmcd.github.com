---
layout: post
title: 'Sandboxed Jekyll Hacks'
tags:
- jekyll
- ruby
- github
---

For the past couple of years, this site has been powered by a static site generator called [Jekyll][jekyll]. With Jekyll there isn't a database, or even an admin area for managing content. Instead, content is stored in text files, which are edited locally on your computer, formatted in one of the lightweight markup languages supported by Jekyll, such as [markdown][markdown]. Layout templates are used for the design, which can contain HTML and programming logic, similar to [PHP][php] code or [Django templates][django-templates], however this code is only executed once when the site is published, not on every page request. When the site is published, Jekyll will look at all the markdown content files, and use the layout templates to generate an entirely static site made up of HTML files.

For hacker types it's the perfect blogging platform, as it addresses a number of complaints they typically have with traditional blogging tools like [Wordpress][wordpress] or [Mezzanine][mezzanine]:

* Editing can be done via your favourite text editor, without dealing with the limitations of [WYSIWYG][wysiwyg] editors
* All content can be version controlled through your favourite version control system, such as [git][git], [mercurial][mercurial], or even [SVN][svn]
* Programming logic can still be implemented in layout templates, and extended with [Ruby][ruby] plug-ins as required
* Site performance is blazing fast, since only static HTML files are served

Programming logic in Jekyll's layout templates is provided by a templating language called [Liquid][liquid]. Those coming from [Python][python] who have used [Django][django-templates] or [Jinja][jinja] templates, will feel right at home with Liquid, as it shares an almost  identical syntax. As with Django templates, [custom tags and filters][liquid-plugins] can be written, in Ruby though, with an API that's actually much more simple.

Jekyll powered blogs have no particular hosting requirements, beyond a web server that can serve up static files. Publishing changes to the site is simply a matter of running the Jekyll command locally to build the site, and pushing the generated files to your web server, perhaps via FTP. Now [GitHub][github] provides an even easier, more integrated approach than this. They provide a service called [GitHub Pages][github-pages], where you can nominate one of your code repositories for hosting a static website - simply push the changes for your static site to the repository via git, and the site is up to date. GitHub Pages also integrates with Jekyll, so if your repository is set up as a Jekyll project, GitHub will automatically generate the static site that gets hosted.

Jekyll integration with GitHub Pages really comes close to a blogging nirvana for programmers, but it's not all sunshine and roses. Understandably, the Jekyll instance on GitHub Pages is sandboxed, and you're unable to extend Jekyll with your own custom Liquid tags and filters. This would require running arbitrary Ruby code, which would pose a security risk to GitHub. So you're restricted to the built-in tags and filters provided by Liquid and Jekyll, which brings us to the point of this post. Since moving to Jekyll, I've had a few cases where I needed to extend things beyond what Jekyll provides. The adage _[constraints foster creativity][constraints]_ has certainly rung true for me with these, and by bending the built-in Liquid tags and filters in strange and sometimes inefficient ways, I've been able to achieve what I've needed. Following are the details of some of these weird tricks I've come up with.

#### True Word Count

Jekyll adds a `number_of_words` tag to Liquid that can be used to display the number of words in an article. You'll see I make use of it on this site, to [generate the visual bars][blog-home] showing the size of each article on the homepage. Unfortunately this tag is particularly naive - it simply splits the contents up into chunks separated by spaces, and returns the number of items. The problem with this is that by the time the post makes its way into the template, it has already been converted to HTML, so all of the HTML tags and their attributes get included in the word count. Jekyll, aimed especially at programmers, also supports snippets of syntax highlighted code in articles. These have their own tag syntax, which would make extracting them out of article content prior to determining word count, seem particularly easy, so that the code in snippets is also omitted from the overall word count, however the `number_of_words` tag doesn't do this either.

The Liquid code below is able to achieve a true word count for each article on the site. It isn't perfect, but it works correctly for my site.

{% highlight html+django %}
{% raw %}
<ul>
{% for post in site.posts %}
    {% assign post_words = 0 %}
    {% assign lines = post.content|split:'pre>' %}
    {% for line in lines %}
        {% assign mod = forloop.index|modulo:2 %}
        {% assign line_words = line|strip_html|number_of_words|times:mod %}
        {% assign post_words = post_words|plus:line_words %}
    {% endfor %}
    <li><a href="{{ post.url }}">{{ post.title }}</a>({{ post_words }} words)</li>
{% endfor %}
</ul>
{% endraw %}
{% endhighlight %}

This code works off the assumption that the highlighted code snippets in articles are the only things that will generate HTML `<pre>` tags. It splits the entire article content on the string `pre>` which should match both opening and closing `<pre>` and `</pre>` tags. Note that it assigns the result of this split to a variable called `lines`. This is specifically necessary - the Liquid authors claimed that iterating through the results of the `split` filter isn't possible, and they're correct, it doesn't work by default. Assigning it to a temporary variable is a trick I accidentally discovered though, that does in fact allow it to work.

We then loop through each of the lines, where we can assume every even line (2nd, 4th, etc) contains a block of code we want to omit from the overall word count. We then strip the HTML from the odd lines to get the actual text content, and sum the result of the `number_of_words` tag on each of these. You'll notice a strange bit here, where we multiply the modulo of 2 on the loop index, which will give us a value of 0 for even lines with code snippets, and 1 for lines with real words. The reason for this is that like Django templates, Liquid conditional tags like `if` don't behave like regular programming languages - their conditional natures is only applicable to what's rendered to the browser. Tags and filters within conditions that aren't met are still executed, so we can't simply wrap our word summing in `{% raw %}{% if mod == 0 %}{% endraw %}`.

#### Frequency Tag Sort

Articles in Jekyll support tags as you'd expect. On the homepage of this site, I generate a list of all tags from all articles. The problem though, is that the tags are in arbitrary order when made available by Jekyll, making the list hard to digest in a meaningful way. We could sort them alphabetically, but I thought the best option would be to sort them by frequency, with the most commonly used tags appearing at the top of the list. Liquid provides the template tag ``sort`` for sorting data by a given property, but the tag structure provided by Jekyll is a hash, which as best as I can tell, isn't supported by Liquid's ``sort`` tag. I therefore came up with the following approach for sorting by frequency:

{% highlight html+django %}
{% raw %}
{% assign tags_max = 0 %}
{% for tag in site.tags %}
    {% if tag[1].size > tags_max %}
        {% assign tags_max = tag[1].size %}
    {% endif %}
{% endfor %}

<ul>
{% for i in (1..tags_max) reversed %}
    {% for tag in site.tags %}
        {% if tag[1].size == i %}
        <li>
            <a href="/tag/{{ tag[0] }}/">{{ tag[0] }}</a>
            ({{ tag[1].size }}){% unless forloop.last %}, {% endunless %}
        </li>
        {% endif %}
    {% endfor %}
{% endfor %}
</ul>
{% endraw %}
{% endhighlight %}

The above approach is quite ridiculous. It first iterates through each of the tags, to determine what the highest tag frequency is. Then it iterates from that highest frequency, down to 1, and within each iteration, loops again through _all tags_, displaying them if their frequency matches the current outer loop. This is insanely inefficient, but it gets the job done acceptably, considering again that this code is only run when the site is published, not on each request.

#### Conclusion

To be honest, none of the above is strictly necessary with Jekyll. I could easily achieve what I need by writing my own Liquid tags to do the job properly. This would even work with GitHub Pages, I'd just need to generate the static version of the site myself, and commit the generated HTML files to version control. But no. In the above cases, I saw the tasks as a challenge - a programming puzzle of sorts, and really enjoyed solving them in the end.

[jekyll]: http://jekyllrb.com
[markdown]: http://daringfireball.net/projects/markdown/
[php]: http://me.veekun.com/blog/2012/04/09/php-a-fractal-of-bad-design/
[django-templates]: https://docs.djangoproject.com/en/dev/topics/templates/
[wordpress]: http://wordpress.com
[mezzanine]: http://mezzanine.jupo.org
[wysiwyg]: http://en.wikipedia.org/wiki/WYSIWYG
[git]: http://git-scm.com/
[mercurial]: http://mercurial.selenic.com
[svn]: http://subversion.tigris.org
[ruby]: http://www.ruby-lang.org
[liquid]: https://github.com/Shopify/liquid
[python]: http://python.org
[jinja]: http://jinja.pocoo.org
[liquid-plugins]: https://github.com/Shopify/liquid/wiki/Liquid-for-Programmers#create-your-own-filters
[github]: https://github.com
[github-pages]: http://pages.github.com
[constraints]: http://37signals.com/svn/archives2/how_the_lack_of_constraints_killed_the_quality_of_star_wars.php
[blog-home]: /
