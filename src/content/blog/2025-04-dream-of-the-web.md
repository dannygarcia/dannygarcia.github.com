---
title: "The dream of the web is alive in fungible frameworks"
publishDate: 2025-04-19
description: "About a side project using Astro and Stimulus."
---

I have a little side project that serves mostly as a way to try out new tech. Can I Afford ([caniafford.app](https://caniafford.app)) is a simple calculator that tells you the income required to comfortably afford a particular vehicle. It doesn’t (yet) have a lot of traffic but >90% of it is organic and is steadily growing.

I recently wrapped up migrating this blog over to Astro and wondered what it would take to also migrate Can I Afford. It was originally scaffolded with Next.js and worked well enough, but because I hadn’t fully taken advantage of all it has to offer, there was an annoying loading state on all pages. Everything was rendered as a React SPA but this always felt like overkill. The number of paths made it a great candidate for full static generation. Next.js does support an assortment of rendering and caching strategies but I also wanted to get rid of React and see what else could be simplified.

## Why Astro

[Astro](https://astro.build) has a very impressive performance [track record](https://lookerstudio.google.com/u/0/reporting/55bc8fad-44c2-4280-aa0b-5f3f0cd3d2be/page/M6ZPC?params=%7B%22df44%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580WordPress%25EE%2580%2580Next.js%25EE%2580%2580Nuxt.js%25EE%2580%2580Gatsby%25EE%2580%2580Astro%25EE%2580%2580SvelteKit%25EE%2580%2580Remix%22%7D). It’s also compatible with any UI framework so I felt confident I could migrate over without having to simultaneously refactor the client code (more on this later). At first, I wasn’t sure if loading vehicle/pricing data for the app from JSON would be challenging, but that proved easier than I imagined. It’s actually easier than asynchronously loading with specialized middleware and easier than boilerplate-y server functions that come with awkward tradeoffs. I’m sure this won’t be the case forever because I plan on expanding the dataset. This will probably require a more complex solution down the line.

## Decoupling the client

Like previously mentioned, I originally planned to just migrate the individual paths (just `/`, and `/[id]`) and continue using React to render the page contents. For context, Next.js intentionally blurs the lines between client and server. Astro has similar integration functionality but the lines are a bit more clearly drawn. While migrating the templates and pages it became clear that React was doing too much. I set up an ideal mechanism for this kind of web app: decouple not just the client but also the business logic that drives the initial page content and the dynamic re-renders. This allows the backend (or in this case, the statically generated HTML) to have a fully “valid” page that only needs the most basic JS to become reactive.

## No React, no kings, only Stimulus

React is great but overkill for my use case. All I’m doing on Can I Afford is reading field data, doing some basic math on it, and updating a few `span`s. We do this any time a field’s value updates. That’s it. We could write this logic in vanilla JavaScript in a few hundred lines (I’m almost tempted to). That being said, I prefer componentizing UIs. We don’t have many UI components here, one for option selection and one for totals, but having a component framework would make it easy to cleanly organize them. For this, I turned to [Stimulus](https://stimulus.hotwired.dev). Stimulus is another unopinionated tool for the web. It’s part of the [Hotwire](https://hotwired.dev) toolkit, but it can be used independently. Stimulus was very easy to set up, interactivity is attached via data attributes on HTML elements.

My only gripe with Stimulus is event-driven interactions (actions) can be a bit verbose and the mechanism for this is [uncharacteristically opinionated](https://stimulus.hotwired.dev/reference/actions). However, Stimulus shines when it comes to message sending. Controller instances can send and receive data between other controller instances regardless of the DOM hierarchy. This lets us avoid the hassle of context management and nesting concerns typical of React applications.

## Post launch

Since switching to Astro + Stimulus, I’ve been able to vastly improve the user experience. I get the best of both worlds, a very fast statically loaded and optimized web app that responds exceptionally well to user input. Using Cline and Cursor, I’ve quickly implemented features like [view transitions](https://docs.astro.build/en/guides/view-transitions/) for reeealy smooth page transitions, prefetch, image optimization, dark mode, and various UX improvements. I haven’t obsessed over the numbers but, excluding images, the whole of Can I Afford loads in < 200kb.

It’s important to leverage the web for what it’s natively good at. Optimizing and building for the system gives us advantages that are hard to attain otherwise. Don’t fight the web, embrace it!
