---
layout: post
title: Blogging with GitHub
published: true
class: blog
---

Owning a part of the web is like owning an island – a sandbox without limits. This blog took a bit of work and was fun to build. So in this post I'll share the process for doing so.

<!-- more start -->

I began by trying to find the easiest, most flexible way to publish articles. Whatever method would also have to meet the following requirements:

 1. Full content and management capabilities. The ability to control the content and choice of back-end / front-end is invaluable. As a web developer this is a given.
 2. Easy publishing. This means, no more than three steps from writing to published. `Write > Click Save > Published` is ideal.
 3. [Markdown](http://daringfireball.net/projects/markdown/). If I was going to do any sort of significant writing it better be done with Markdown – a super-easy-to-use *"text-to-HTML conversion tool for web writers"*.

## Full Content & Management Capabilities

Requirement #1 removes the option of publishing via many popular online services like [Tumblr](http://www.tumblr.com/) and [Squarespace](http://www.squarespace.com/). This was a diffcult decision to make, because I've spent years curating content on [my tumblelog](http://dannygarcia.tumblr.com/). Regardless, I want to own and control 100% of what I publish.

The easy solution here is to simply publish locally and not give in to the cloud. Generally this is a heck of a lot of work. It usually means purchasing a domain, managing a server, choosing a back-end language, setting up a database & <abbr title="Content Management System">CMS</abbr> and building out the front-end as well.

Thankfully, we have [GitHub](http://github.com/) and [GitHub Pages](http://pages.github.com/) to make this process easy. By using GH Pages, we can eliminate the back-end completely. This is not only a form of liberation but a key component to managing content. There's a local copy of everything with the right to redistribute it as I see fit.

### Managing Content Without a CMS

Think of CMS as less of a tool or app and more as a *system*. Managing content is as simple as it is defined, meaning we are not limited to server-side programs. [Jekyll](https://github.com/mojombo/jekyll) is an amazing tool for managing static content. It's geared toward blog-type site structures and is also a flexible templating system. It's also loaded with many [configuration options](https://github.com/mojombo/jekyll/wiki/configuration). Best of all, GitHub Pages supports it right out of the box.

To make a simple Jekyll site just publish an `index.html` file to the remote `gh-pages` branch of your project and GitHub will take care of the rest. GitHub also gives us the option of creating a repo that is formated like so `[username].github.com`. This tells GitHub that the whole repo is a dedicated Jekyll site and uses the `master` branch to deploy. You'll probably want to read the [wiki](https://github.com/mojombo/jekyll/wiki/) for more on setting up a Jekyll blog. You can also take a peek at the [source code](https://github.com/dannygarcia/dannygarcia.github.com) for this site.

### The Front-end

All front-end developers should have a workflow in place for the development and publication of projects. There are many tools and libraries for maintaining a sane working environment, ranging from [simple](http://incident57.com/codekit/) apps to [complex](http://yeoman.io/) <abbr title="Command Line Interface">CLI</abbr>s.

I've chosen the [RED Boilerplate](https://github.com/ff0000/red-boilerplate) (RBP) for this site – not just because I work with the folks that build it but because I'm familiar with its process. The RBP project templates are setup with [HTML5 Boilerplate](http://html5boilerplate.com/), [SASS](http://sass-lang.com/) and [Compass](http://compass-style.org/) make compiling CSS a breeze, [Rosy](https://github.com/ff0000/rosy) is my AMD framework of choice, and the CLI workflow ties it nicely together with [grunt.js](http://gruntjs.com).

RBP also makes it easy to add grunt tasks. I was able to use its extendability to create a [grunt plugin and task for Jekyll](https://github.com/dannygarcia/grunt-jekyll) making development as easy as typing `grunt watch:jekyll` in the command line.

## Easy Publishing

I began by publishing articles with [prose.io](http://prose.io/). But recently, GitHub has added both the ability to edit and publish files in a super cool [Zen Writing Mode](https://github.com/blog/1379-zen-writing-mode). This writing mode is perfect for blogging.

## Markdown

[Markdown](http://daringfireball.net/projects/markdown/) is great! it makes it easy for me to neatly write HTML. Here's an image of this article in progress:

![Writing in Sublime Text 2](http://i.imgur.com/OlND0.jpg)

## Progress

This process is in progress. Front-end development appeals to me because it changes so constantly and drastically. There is always something new to learn – a level above my own. This makes consistency a bit challenging but I look forward to how this site will evolve.

<!-- more end -->
