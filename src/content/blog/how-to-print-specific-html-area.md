---
pubDatetime: 2024-03-17T10:19:37.000+08:00
title: The easiest way to print a specific area (element) of an HTML page
permalink: way-to-print-partial-html-page
tags:
  - html
  - javascript
  - frontend
description: The easiest way to print a specific area of an HTML page.
---

## Create printable Elements

```html
<body>
  <div id="root">You can only see me on the page, typically powered by React or Vue.</div>
  <div class="print-only">You can only see me when printing.</div>
  <div class="printable">You can see me both on the page and when printing.</div>
</body>
```

## Add CSS

```css
.print-only {
  display: none !important;
}

@media print {
  body > * {
    display: none !important;
  }
  .printable,
  .print-only {
    display: block !important;
  }
}
```

## Invoke window.print() function

```js
window.print();
```

If you want to set the content using javascript:

```js
const domToBePrinted = document.createElement("div");
domToBePrinted.classList.add("print-only");

// set the content
domToBePrinted.innerHTML = "...";

document.body.appendChild(domToBePrinted);

window.addEventListener(
  "afterprint",
  () => {
    document.body.removeChild(domToBePrinted);
  },
  { once: true }
);
window.print();
```

If you want to change the filename of the content to be printed:

```js
const originalTitle = document.title;
if (title) {
  document.title = title;
}
window.addEventListener(
  "afterprint",
  () => {
    document.title = originalTitle;
  },
  { once: true }
);
window.print();
```

## Pros

- It will not break the existing elements of the page and their interactivity.（EventListeners）
- Easy to implement

## Printing in React or Vue

TODO
