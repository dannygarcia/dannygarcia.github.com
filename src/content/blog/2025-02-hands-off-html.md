---
title: "Hands off (my) HTML"
publishDate: 2025-02-25
description: "In my day we wrote our HTML by hand, line by line, and we liked it!"
---

This site has gone through very little iteration since the last major rebuild. At that time I had decided to avoid using build tools and just write plain HTML, CSS and JS. If I recall correctly, the JS became TS compiled with Webpack. So much for the no-tools build concept; however I needed resources from a three.js package and it was just easier to throw in webpack and call it a day.

This system worked well enough for a long time until I set about adding a blog. Sure, I could stick to plain HTML and just keep copy/pasting markup but I knew I wanted at least two things:
* Markdown for writing posts.
* Flexibility for future redesigns.

I had recently migrated the build system from Webpack to Vite and decided it would be easy enough to use a Vite plugin to process markdown. There were a few open source plugins that seemed to offer this functionality but they had no way to preview the built HTML locally and worst of all, did not automatically route to Vite's compiled assets. Getting something to work well would require stringing together a bunch of other lower level tools and perhaps building my own. I was also allotting very little time to this project and tried unsuccessfully to get various LLM dev tools to do the heavy lifting.

In the end I came across [Astro](https://astro.build) which turned out to be _almost_ the perfect tool for the job. I'm able to build and deploy static HTML and still compile assets efficiently. Every part of Astro is well suited for building content-driven sites and it works flawlessly with Netlify which makes deployment a breeze.

I've only run into a couple of small issues. Initially, CSS overrides for components didn't work. For some reason, I haven't been able to get scoped styles functional. I think this caused component overrides to not render as expected or render in the wrong order, breaking specificity. I've resorted to moving my global styles under `/public` and using the `<style is:global />` property. When my site was fully static HTML, I controlled the placement of style and script tags. In Astro, depending on how an asset is required it may end up in the header or somewhere inline. I think this has broken the implicit expectations that DOM content has loaded and can be measured in the homepage script, thus breaking the WebGL experience. HTML is sacred.

I can live with those minor issues and will eventually get around to fully resolving them. I'm just really happy to have a fast, extensible tool that builds content from markdown reliably.