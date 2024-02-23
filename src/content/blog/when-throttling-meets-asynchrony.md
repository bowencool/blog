---
pubDatetime: 2020-01-16T10:14:43Z
modDatetime: 2024-02-23T16:29:42Z
title: When throttling and debouncing meet asynchronous, what kind of sparks will they create?
featured: true
permalink: when-throttling-meets-asynchrony
originalUrl: https://github.com/bowencool/blog/issues/3
tags:
  - frontend
  - javascript
  - async
description: When throttling and debouncing meet asynchronous, what kind of sparks will they create?
---

2021.05.31 Update:

All the codes have been included in the [async-utilities](https://github.com/bowencool/async-utilities) repository, and has been published to [npm](https://www.npmjs.com/package/@bowencool/async-utilities)

---

## Background

In the `HTML` form, there is a scenario like this:

```html
<form id="form">
  <!-- <label for="name">Name：</label>
  <input type="text" name="name" id="name"> -->
  <button type="submit">submit</button>
</form>
```

Clicking "Submit" will send a request to the server:

```js
// make a network request
function api(data) {
  console.log("submiting", data);
  return fetch("https://httpbin.org/delay/1.5", {
    body: JSON.stringify(data),
    method: "POST",
    mode: "cors",
  });
}

const form = document.getElementById("form");
const handler = async function (e) {
  e.preventDefault();
  const rez = await someApi({
    msg: "some data to be sent",
  });
  console.log(rez);
};

form.addEventListener("submit", handler);
```

To prevent users from submitting repeatedly, we usually maintain a `loading` state... but after writing it many times, there is inevitably a feeling of mechanical labor. Moreover, when a form has many buttons, wouldn't I have to maintain many `loading` variables?

Looking at this makes my eyes tired and the interface response is very fast; sneaking in one less `loading` probably won't be noticed right🌚, but what if the server goes down... never mind, no time to think about that now.

Have you ever experienced the scenario above? In fact, most products' buttons do not have a `loading` effect because the whole world is just a big slapdash operation😂. However, as a qualified front-end developer, everyone needs to be responsible for user experience!

## Can we just [make money standing tall](https://www.larsenonfilm.com/let-the-bullets-fly#:~:text=I%20want%20to%20make%20money%20standing%20tall)?

Let's sort it out first:

1. Within a short period of time, each event will generate a `promise`, and the core requirement is to reduce frequency. That is, "for three thousand `promises`, I only take one result."

2. The response time of a `promise` is uncertain.

### First point, frequency reduction

Recall the event frequency reduction in synchronous code: throttle and debounce. Regarding these two, I believe you are already very familiar with them; let's summarize in one sentence:

> Both are **taking one call from multiple same events within a unit of time (also can be said as: for three thousand events, I only execute once)**; the difference is that **the former takes the first occurrence while the latter takes the last**.

Let’s rephrase our requirement in this style: taking one call from multiple same events within a **short period of time**. So, this "**short period of time**" is key!

### Second point, redefine interval

We hope that before **the previous `promise` ends**, all subsequent operations to create new `promises` are discarded. Therefore, "within a short period of time" equals "during the pending period of the previous promise", and discarding all subsequent promise creation operations means "taking the first occurrence". The discarding of `promise` can be achieved by creating a `promise` that is "forever `pending`"; thus our requirement becomes:

**During the pending period of the previous promise, take only the first operation out of multiple attempts to create new promises (which would be this currently pending promise) for execution.**

Now that we've discussed ideas let's also refer to some code, here's a simple version implementation code for throttling:

```js
/**
 * @description throttling
 * @param {function} fn
 * @param {number} ms milliseconds
 * @returns {function} Throttled Function
 */
function throttle(fn, ms = 300) {
  let lastInvoke = 0;
  return function throttled(...args) {
    const now = Date.now();
    if (now - lastInvoke < ms) return;
    lastInvoke = now;
    fn.call(this, ...args);
  };
}
```

Imitate the gourd to draw a ladle, simply modify it a bit:

```js
/**
 * @description Asynchronous throttling: During the last promise pending period, it will not be triggered again
 * @param {() => Promise<any>} fn
 * @returns {() => Promise<any>} Throttled Function
 */
function throttleAsyncResult(fn) {
  let isPending = false;
  return function (...args) {
    if (isPending) return new Promise(() => {});
    isPending = true;
    return fn
      .call(this, ...args)
      .then((...args1) => {
        isPending = false;
        return Promise.resolve(...args1);
      })
      .catch((...args2) => {
        isPending = false;
        return Promise.reject(...args2);
      });
  };
}
```

Usage([Demo](https://bowencool.github.io/async-utilities/functions/throttleAsyncResult/readme.html))：

```js
// make a network request
function api(data) {
  console.log("submiting", data);
  return fetch("https://httpbin.org/delay/1.5", {
    body: JSON.stringify(data),
    method: "POST",
    mode: "cors",
  });
}
const throttledApi = throttleAsyncResult(api);

// business logic
const button = document.getElementById("button");
button.addEventListener("click", async function () {
  const rez = await throttledApi({
    msg: "some data to be sent",
  });
  console.log("completed");
});
```

When you open the developer tools, you can see that no matter how fast you click, there will never be a situation where requests are made in parallel:

![image](https://user-images.githubusercontent.com/20217146/73516882-d45bde00-4434-11ea-9cd4-0131730af133.png)

Mission accomplished!

## A twin brother

### debounceAsyncResult

The `throttleAsyncResult` just now is about controlling how to create a `promise`. So, if we have already created many `promises`, how can we get the latest result? After all, nobody knows which `promise` will run faster.

Therefore, there is `debounceAsyncResult` ([Demo](https://bowencool.github.io/async-utilities/functions/debounceAsyncResult/readme.html)): **Among the many created promises, take the result of the last created promise.**

"Being lazy" is the primary productive force for programmers, have you learned it🤔?
