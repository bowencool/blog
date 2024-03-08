---
pubDatetime: 2024-03-06T10:54:18.000+08:00
modDatetime: 2024-03-08T02:44:25Z
title: The Browser Rendering Process
permalink: browser-knowledge
tags:
  - frontend
  - interview
description: This article summarizes some of the browser-related interview questions, including browser architecture, rendering process, performance optimization, and so on.
---

> This article was translated by OpenAI GPT-4, Google Gemini, and DeepLX. It is too long for proofreading.

## Multi-process architecture

The latest Chrome browser architecture, which adopts a multi-process architecture.

### Process Division

| Process       | Responsible for                                                                                                                                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| browser       | Basic functions of the browser, including navigation bar, navigation buttons, bookmarks, network requests, file reading and writing etc. <br> Chrome performs differently on hardware with different capabilities                                      |
| renderer \* n | All tasks related to display within a tab and webpage, mainly converting HTML, CSS, and JavaScript into web page content that we can interact with. <br> Chrome tries to allocate a separate process for each tab or even every iframe inside the page |
| plugin \* n   | Extensions and plugins used by the webpage                                                                                                                                                                                                             |
| GPU           | Processes rendering requests from different tabs and draws them on the same interface                                                                                                                                                                  |

### Benefits

Good fault tolerance: when one of the tabs crashes, you can always close it and the other tabs are unaffected.
Provides security and sandboxing.

### Disadvantages

Memory consumption is high. However, after a certain number of processes, Chrome will run tabs that visit the same website in a single process.

## Browser process threads

| threads        | jobs                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------- |
| UI thread      | Includes drawing components such as the top browser button and navigation bar input boxes |
| network thread | manages network requests                                                                  |
| network thread | Managing network requests                                                                 |
| storage thread | Controlling file reads and writes                                                         |

## Renderer process threads

### GUI rendering thread:

1. Responsible for rendering the browser interface, parsing html, css, building the dom tree and render tree, layout and drawing.
2. This thread is executed when redrawing and reflowing.
3. The GUI rendering thread and the js engine thread are mutually exclusive, when the js engine is executing, the GUI thread will be hung (equivalent to freezing), and the GUI updates will be saved in a queue to be executed immediately when the js engine is idle.

### JavaScript engine threads:

1. also known as the js kernel, is responsible for processing js script programs, such as the v8 engine.
2. responsible for parsing js scripts and running code
3. waits for tasks in the task queue, there is only one js process for a tab page
4. Because it is mutually exclusive with the GUI rendering thread, if the js is executed for too long, it will cause the page rendering to be inconsistent, resulting in page rendering blocking.

#### Why are they mutually exclusive?

To avoid race conditions or data synchronization problems in multi-threaded scenarios: if the JavaScript engine thread and the rendering thread operate on the DOM at the same time, this can lead to data inconsistencies or page rendering errors.

### Event Trigger Thread:

1. Belongs to the browser, not the JS engine, used to control the event loop.
2. When the JS engine executes code blocks like setTimeout, it will add the corresponding task to the event thread.
3. When an event meets its trigger conditions, it is placed at the end of the task queue, waiting for processing by the JS engine thread.
4. Due to JS's single-threaded nature, these events waiting for processing must queue up and wait for handling by the JS engine.

### Timer Trigger Thread:

1. The thread where setTimeout and setInterval are located.
2. The browser's timer counter is not counted by the JS engine thread; therefore, a separate thread times and triggers timers. Once timing is complete, it adds them to the event queue awaiting execution by the JS engine.

### Asynchronous HTTP Request Process:

1. After connecting in XMLHttpRequest, a new thread is opened by browsers for requests.
2. Upon detecting state changes if a callback function is set up, an asynchronous thread generates a state change event placing this callback into an event queue again for execution by JavaScript Engine

### Worker Thread

Web worker and service worker

### Raster Thread

**The process of converting drawing instructions into a bitmap** (the process of converting the document structure, the style of elements, the geometric information of elements, and their drawing order into pixels on the display) is called rasterization. Only content within the viewport is rasterized; additional content is appended upon scrolling, similar to lazy loading. The GPU can participate in acceleration.

### Compositor Thread

The page is divided into several layers, and then they are rasterized separately.

#### Why

Imagine if there were three layers 123, where layers 1 and 2 have not changed but layer 3 has rotated. Then by transforming only the third layer for each frame, you can get each frame's output with significantly reduced computational effort.

Layering **reduces computation and accelerates rendering efficiency**.

It runs on a compositor thread **to avoid affecting tasks executed by the main rendering thread**.

#### Benefits

- Does not affect the main thread.
- Can be parallelized.
- When updating, it allows for updates as needed to reduce computational load and improve rendering efficiency.
- Can be handled by GPU.

Layers do not have parent-child relationships; they are a flat list but still retain the name LayerTree.

#### Conditions for Forming Composite Layers

> In composite layers, "layer" can be considered as an actual physical layer that browsers isolate specifically for processing by GPUs. In contrast, "layer" in stacking contexts refers to a rendering layer which is more like a conceptual layer. A composite layer may contain multiple rendering layers;

- transform is not none
- will-change is not none
- video tag
- canvas tag
- iframe

When a page exceeds a certain number of layers, compositing operations become slower than rasterizing small parts of pages in each frame. Therefore assessing your application's rendering performance becomes very important.

## The whole process of entering a URL

### Processing input

First the UI thread of the browser process processes your input, determining if it is a legitimate URL, and if not, processing it as a search term, which means stitching it into a search URL.

### Starting navigation

The UI thread calls a network thread to initialize a network request for content from the site. The tab displays a spinning circle indicating that the resource is loading, and the network thread performs a number of operations such as DNS addressing and establishing a TLS connection.
If the network thread receives an HTTP 30x redirect response from the server, it tells the UI thread to redirect and it initiates a new network request.

> Here's a detail: at the beginning of the navigation, the network thread looks for a service worker within the scope of the registered service workers based on the domain name of the request, and if there is a service worker with a hit on that URL, the UI thread starts a renderer process for that service worker. If there is a service worker that hits the URL, the UI thread starts a renderer process for the service worker to execute its code. the service worker may either use previously cached data or initiate a new network request.
> The service worker may either use previously cached data or initiate a new network request.
> The back-and-forth communication between the browser process and the renderer process, including the time it takes for the service worker to start up, actually increases the latency of the page navigation if the service worker that starts up decides to send a network request after all. This can be accelerated by loading the corresponding resources in parallel when the service worker starts, a technique called navigation preloading. The request header for preloaded resources has some special flags that allow the server to decide whether to send new content to the client or just updated data.

### Read the response

When a network thread receives a stream of the body of an HTTP response, it examines the first few bytes of the stream, if necessary, to determine the specific MIME Type of the body of the response. Only responses of type `content-type: text/html` are discussed here.
The web thread also does a security check on the content before handing it over to the rendering process.

### Prepare a rendering process one by one

After the web thread has done all of its checks and can determine that the browser should navigate to the requested site, it tells the UI thread that all of the data has been prepared, and the UI thread receives confirmation from the web thread that it has prepared a renderer process for the site to render the interface.
**The UI thread receives confirmation from the web thread and prepares a renderer process for the site to render the interface. **
If everything goes well (no redirects or anything like that), the renderer process will be ready when the web thread is ready, which saves time in creating a new renderer process. However, if something like the site being redirected to a different site happens, the rendering process can't be used, it will be discarded and a new rendering process will be started.

### Navigation

The browser process tells the rendering process to commit navigation and streams the response to it via IPC.
The navigation bar will be updated and the session history will record the navigation.#### Initial load complete
When the navigation submission is complete, the rendering process starts working on loading the resources as well as rendering the page. I'll talk about the details of how the renderer process renders the page later. Once the rendering process has "finished" rendering, it informs the browser process via IPC (note that this occurs when the onload event has been triggered on all frames on the page and the corresponding handlers have finished executing), and the UI thread stops. The rotating circle on the navigation bar.
I use the word "done" here because the client-side JavaScript can continue to load resources and change the content of the view later.

#### Navigating to a different site

A simple navigation scenario has been described! However, if the user enters a different URL in the navigation bar, the browser will ask the current renderer if it needs to handle the beforeunload event before re-navigating.
If the re-navigation is caused by clicking a link or button, the renderer process will check to see if it has registered a listener for the beforeunload event, and if it has, it will execute it, and then what happens is the same as before, with the only difference being that this time, the navigation request is initiated by the renderer process to the browser process.

#### Service Worker Scenario

A service worker can be used to write a network proxy for a website, so the developer can have more control over network requests, such as deciding what data is cached locally and what data needs to be retrieved from the network.
When a service worker registers, its scope is recorded. At the beginning of navigation, the network thread will search for a service worker within the scope of the registered service workers according to the requested domain name, and if there is a service worker that hits the URL, the UI thread will start a renderer process for the service worker to execute its rendering. If there is a service worker that hits the URL, the UI thread starts a renderer process for the service worker to execute its code. the service worker may either use previously cached data or initiate a new network request.
The back-and-forth communication between the browser process and the renderer process, including the time it takes for the service worker to start up, actually increases the latency of the page navigation if the service worker that starts up decides to send a network request after all. This can be accelerated by **loading the corresponding resources in parallel when the service worker starts**, a technique called navigation preloading. The request header for a preloaded resource has special flags that allow the server to decide whether to send the client brand new content or just updated data.

### What Happens in the Renderer Process

The renderer process is responsible for everything that happens inside a tab. In the renderer process, the main thread handles the bulk of the code you ship to your users. If you use web workers or service workers, their code will be handled by worker threads. The compositor and raster threads run in the renderer process to efficiently render the contents of the page to the screen.

The renderer process's main job is to take HTML, CSS, and JavaScript and turn it into web page content that you can interact with.

modules. You can also preload resources with `<link rel="preload">` to tell the browser that a resource will definitely be needed for the current navigation and that you'd like to start loading it as soon as possible.

#### Layout

In parallel, the main thread parses responses for CSS, computes the style for each DOM node, and builds a layout tree.

Each node in the layout tree has an x,y coordinate on the page and a bounding box size.

The layout tree looks a lot like the DOM tree constructed earlier, except that it only contains information about visible nodes. Also, pseudo-elements are not present in the DOM but are present in the layout tree.

Layout is a complex topic, but at a high level, it's about figuring out, top-to-bottom and left-to-right, where each box should go, and then doing line breaks as needed.

#### Painting

The main thread walks the layout tree to generate a layer tree, which is a three-dimensional conceptualization of layers where the order in the list corresponds to the order in which they are drawn, with later layers covering earlier layers.

<!-- TODO based on styles -->

If elements in the page are animating, the browser will have to update this element as part of each animation frame in the rendering pipeline.

#### Composition & Rasterization

So far, browsers already know the following information about a page: document structure, element styles, geometric information of elements, and their painting order. Next is to transform this information into bitmaps (i.e., the pixels on a display), which is called rasterization and is computed by the GPU. However, before rasterization, there's a process where the browser divides the page into several layers and then rasterizes them separately. Finally, these are merged into one page in the compositor thread.

To determine which elements need to be placed on which layer, the main thread needs to traverse the render tree to create a Layer Tree (this part of work is called "Update Layer Tree" in DevTools). You can inform the browser about its layering by using will-change CSS property.

When a page has more than a certain number of layers, composing those layers becomes slower than rasterizing a small part of the page in each frame. Therefore, measuring your application's rendering performance is very important.

Once the layer tree for a page has been created and the drawing order of its elements determined, The main thread submits this information to compositor thread. Then compositor thread will rasterize every layer of that page; each layer gets divided into smaller tiles sent off to various raster threads.

After completing above steps ,the compositor thread commits (commits) rendering frame through IPC towards browser process . These composite frames are all sent to GPU thus displayed on screen . If compositor receives an event indicating scrolling , it constructs another composite frame sending it over GPU updating webpage .

The advantage of composition lies in that this process does not involve main thread so compositing doesn't have wait for style calculations or JavaScript execution completion . This why constructing webpage animations solely through composition considered best practice building smooth user experiences . If webpage requires re-layout or redraw ,main tread definitely participates .

#### Optimization of Scroll Events

When there are no event listeners on the page, the compositor thread can create a new composite frame in response to events without any involvement from the main thread.

When there are some event listeners on the page, the compositor thread will mark those areas of the page that have registered event listeners as "Non-fast Scrollable Regions". When user events occur in these areas, the compositor thread sends input events to the main thread for processing. If input events do not occur in non-fast scrollable regions, then there is no need for involvement from the main thread for composing a new frame.

Therefore, adding an event handler to body can easily impose additional burdens on the compositor thread; you can pass passive: true option to your event listener. This option tells browsers that although listening for events on main threads, compositing threads can also continue creating new frames without waiting for them.

#### Layer

1. Hardware acceleration is not exclusive to front-end development; it's a broad computing concept—offloading software tasks to specific hardware for more efficient task completion. For the front end, this means using certain CSS properties to elevate elements into composite layers for GPU processing;
2. The "layer" in a composite layer can be considered as an actual physical layer, which the browser isolates and hands over to the GPU for processing separately, while the "layer" in stacking context refers to a rendering layer, which is more like a conceptual layer mainly used for recording drawing order. A composite layer can contain multiple rendering layers;
3. Layer explosion refers to a large number of elements being unexpectedly elevated into composite layers, i.e., implicit compositing; Layer compression is an optimization by browsers for implicit compositing, with Chrome achieving considerable perfection in version 94;
4. Using transform and opacity instead of traditional properties for some animations and elevating them into separate composite layers can bypass layout calculations and redrawing for direct composition, avoiding unnecessary reflows and repaints.

> https://mp.weixin.qq.com/s/-VIpnfzHZy5fYwI9PECayQ
>
> https://zhuanlan.zhihu.com/p/102149546
>
> https://blog.poetries.top/browser-working-principle/guide/part1/lesson04.html#_1-%E7%94%A8%E6%88%B7%E8%BE%93%E5%85%A5
