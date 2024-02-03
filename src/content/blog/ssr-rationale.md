---
pubDatetime: 2020-07-31T08:27:32Z
modDatetime: 2024-02-03T14:50:15.507Z
title: The basic principles and process of SSR (Server-Side Rendering)
permalink: server-side-rendering-rationale
originalUrl: https://github.com/bowencool/blog/issues/12
tags:
  - frontend
  - fullstack
  - ssr
  - vue
  - react
description: The basic principles and process of SSR (Server-Side Rendering)
---

## What is SSR

Server Side Rendering (SSR) refers to the process of rendering web pages on the server side. The main difference from traditional client-side rendering (CSR) is that in CSR mode, the server returns:

```html
<body>
  <div id="app"></div>
  <script src="/main.xxx.js"></script>
</body>
```

In SSR mode, the server returns

```html
<div id="app" data-server-rendered="true">
  <div class="user-wraper">
    <p>Hello, Bowen!</p>
  </div>
  <ul class="order-list">
    <li>Order ID：111</li>
    <li>Order ID：222</li>
    ...
  </ul>
</div>
```

## Why Use SSR

The main advantages are:

- Reducing white screen time
- SEO friendly

## SSR Sequence Diagram

<!-- ![ssr1](https://user-images.githubusercontent.com/20217146/89017104-6002e880-d34c-11ea-952a-cd05502a5b37.jpeg) -->

```mermaid
sequenceDiagram
Note over Client: Type the url and press Enter: <br>http://xxx.com/order/list?page=1&size=20
Client ->> Node Server: Send a GET request
Note over Node Server: Receive the request
Note over Node Server: Parsing URLs (api provided by router) to get specific routes, components<br>For example：[Layout、OrderList]
Note over Node Server: [Optional Business Logic] Analyze the conditions required by the route/component, for example: <br>Return 403 when user have insufficient permissions, redirect to login if not logged in
Note over Node Server: Data pre-fetching (if necessary), for example:<br>Layout needs to request the user-profile interface,<br>OrderList needs to request the order-list interface,<br>The Node server needs to fetch these data back.
Node Server-->>Api Server: /api/user/profile
Node Server-->>Api Server: /api/order/list?page=1&size=20
Api Server->>Node Server: { name: 'Bowen', id: 982347 }
Api Server->>Node Server: { list: [Array(20)], total: 123 }

Note over Node Server: Set data, taking store.commit as an example
Note over Node Server: Rendering full HTML: generally by the framework to provide api. (This process should be the prefetched data,<br>that is, the initial store, stuffed to the Client, to avoid the Client repeated requests,<br>one to save network resources, and to avoid the inconsistency of the data of the two requests lead to the page jitter)
Node Server->>Client: Return the HTML
Note over Client: The browser starts to render HTML, which is already a complete DOM tree.
Note over Client: The browser starts to download and execute javascript, checks the prefetched data stuffed back from the server, and generates a virtual DOM, for example:<br>new Vue({ el: '#app' })
Note over Client: Mount the virtual DOM to the real DOM (see image below)
Note over Client: End of Part one. The following is the same as a normal CSR.
Note over Client: Switch the route to:<br>/order/3
Client-->>Api Server: /api/order/3
Api Server->>Client: { id: 3, order_sn: '12312364' }
Note over Client: Update views
```

### Mount the virtual DOM to the real DOM

<!-- ![ssr2](https://user-images.githubusercontent.com/20217146/89017153-6e510480-d34c-11ea-9f06-e12dbafad1e4.jpeg) -->

```mermaid
flowchart TB;
  vNode([Virtual DOM just generated]) --> dom[Find the real dom] --> isSSR{Is the real DOM rendered server-side?};
  isSSR -- No --> override([Override]);
  isSSR -- Yes --> isSame{Is the real DOM the same structure as the virtual DOM?};
  isSame -- No --> override;
  isSame -- Yes --> reuse([Reuse the real DOM and register events]);
```
