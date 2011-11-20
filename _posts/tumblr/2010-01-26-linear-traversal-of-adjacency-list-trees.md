---
layout: post
title: "Linear Traversal of Adjacency List Trees"
---

My current project has the common requirement of storing and rendering a
hierarchical tree of categories. This project is geared towards potentially
junior developers with the expectation of it being hacked at every time it's
used - a set of scaffolding where simplicity isn't just a loose goal but a
fundamental requirement.

Two popular approaches to the hierarchical tree are the [Adjacency List (AL)
and Modified Preorder Tree Traversal (MPTT)
models](http://articles.sitepoint.com/print/hierarchical-data-database). The
advantage of AL is that it only stores the exact data required for
representing the tree while MPTT stores extraneous data for assisting in
traversing the tree in an optimal fashion. The simplicity of the AL model
makes it much better suited to the requirements I mentioned, however the
problem with AL is the recursive nature in which you traverse it.

    def show_branch(parent, depth=0):
        # iterating the entire tree for each branch gives quadratic performance
        for node in nodes:
            if node.parent == parent:
                print (" " * depth) + node
                show_branch(node, depth + 1)

Worst case here is _O_(n²) performance but thanks to [Python's lightning fast
hashtable implementation](http://wiki.python.org/moin/DictionaryKeys) we can
create a copy of the tree as a dictionary of branches giving us _O_(n) overall
performance when traversing the entire tree.

    # copy the tree into a dict of branches
    branches = {}
    for node in nodes:
        parent = node.parent
        if parent not in branches:
            branches[parent] = []
        branches[parent].append(node)
    def show_branch(parent, depth=0):
        # iterating only the nodes in the branch gives linear performance
        for node in branches[parent]:
            print (" " * depth) + node
            if node in branches:
                show_branch(node, depth + 1)

When rendering the entire tree, using this technique will greatly increase
performance as the tree grows in size. Be aware though that if your
application only ever deals with a single branch in any given view, this
technique won't perform as well as directly querying the database for the
nodes in a single branch.

