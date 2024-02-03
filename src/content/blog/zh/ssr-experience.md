---
pubDatetime: 2020-07-16T14:42:47Z
modDatetime: 2020-07-16T14:51:40Z
title: Vue SSR 踩坑
permalink: ssr-experience
originalUrl: https://github.com/bowencool/blog/issues/10
tags:
  - frontend
  - ssr
  - vue
  - fullstack
description: 记录一下 Vue SSR 项目中遇到的问题
---

## window/document is not defined

很多库都会报这个错误，花样还挺多。很正常，没有考虑到SSR。解决方案是

### 懒加载

```js
async mounted() {
  const G2 = await import('@antv/g2');
  const chart = new G2.Chart({
    container: this.$refs.chartDom,
  });
  this.chart = chart;
}
```

### 懒执行

```js
mounted() {
   this.showXxx = true
},
render() {
  return (<div>
    { this.showXXX && <Xxx /> }
  </div>)
}
```

### 自己造轮子

- 实在不行只能自己造轮子用比如图片剪裁（这玩意儿当你import的那一刻就报错了。。）

## css闪动

复现看这个停更的[网站](https://www.quandouyo.com/login?redirect_uri=%2Fhome%2F)（强刷就会反复出现）。
原因是，渲染的HTML中，只有vendor.css和app.css，没有chunk-x.css，chunk-x.css是客户端chunk-x.js动态插入的。webpack认为chunk不是入口，所以也没毛病。
所以，这个事是谁的锅呢？
第一，纯客户端渲染时，chunk.js和chunk.css是同时加载的，所以不会出现。第二，webpack在编译时并不知道运行时访问的url及对应chunk，所以不可能指望编译工具解决，但vue-ssr是运行时渲染，它一定知道，否则也不会渲染出完整HTML。临时解决方案是打包成一个css。我觉得这事儿可以给vue-ssr提下

## 渲染出的DOM不匹配（书写不规范）
