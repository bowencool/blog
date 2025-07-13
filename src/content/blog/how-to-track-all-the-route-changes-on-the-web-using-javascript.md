---
pubDatetime: 2025-07-13T15:30:33.000+08:00
title: How to track all the route changes on the web using javascript
permalink: how-to-track-all-the-route-changes-on-the-web-using-javascript
featured: false
tags:
  - javascript
  - frontend
description: How to track all the route changes on the web using javascript
---

```ts
function getCurrentState() {
  return window.location.pathname + window.location.search + window.location.hash;
}
let lastState = getCurrentState();
console.log("Route changed", lastState);

// The `popstate` event can detect `hashchange`.
window.addEventListener("popstate", evt => {
  const to = getCurrentState();
  if (to !== lastState) {
    console.log("Route changed", to);
  }
});

const theHistory = window.history;

const replacement = (originFn: History["pushState"]) => (data: any, t: string, url: string | undefined) => {
  const from = getCurrentState();
  if (url && from !== url) {
    console.log("Route changed", url);
  }
  const ret = originFn.call(theHistory, data, t, url);
  if (url) {
    lastState = url;
  }
  return ret;
};
overrideMethod(theHistory, "pushState", replacement);
overrideMethod(theHistory, "replaceState", replacement);

function overrideMethod<T extends Record<PropertyKey, any>, K extends keyof T>(
  target: T,
  key: K,
  replacement: (f: T[K]) => T[K]
) {
  if (key in target) {
    const originFn = target[key];
    const replaced = replacement(originFn);
    if (typeof replaced === "function") {
      target[key] = replaced;
    }
  }
}
```
