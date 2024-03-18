---
pubDatetime: 2024-03-17T10:19:37.000+08:00
modDatetime: 2024-03-18T09:09:37Z
title: 打印 HTML 页面特定区域（元素）的最简单方法
permalink: way-to-print-partial-html-page
tags:
  - html
  - javascript
  - frontend
description: 打印 HTML 页面特定区域（元素）的最简单方法
---

## 创建可打印的元素

```html
<body>
  <div id="root">你只能在页面上看到我，通常由 React 或 Vue 支持。</div>
  <div class="print-only">你只能在打印的时候才能看到我。</div>
  <div class="printable">你在页面上和打印时都能看到我。</div>
</body>
```

或者使用 JavaScript 创建内容：

```js
const domToBePrinted = document.createElement("div");
domToBePrinted.classList.add("print-only");
// set the content
domToBePrinted.innerHTML = "...";
document.body.appendChild(domToBePrinted);
```

## 添加 CSS

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

## 调用 window.print() 函数

```js
window.print();
```

如果您想使用 JavaScript 设置内容：

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

如果你想更改要打印内容的文件名：

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

查看[Demo](https://bowencool.github.io/print-react-component)

## 优点

- 不会破坏页面现有元素及其交互性（EventListeners）
- 实现简单

## 在 React 或 Vue 中打印

请查看 [print-react-component](https://github.com/bowencool/print-react-component)
