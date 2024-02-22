---
pubDatetime: 2020-08-12T15:40:53Z
modDatetime: 2021-09-22T03:09:38Z
title: 记一次在 Typescript 中给 debounce 写注解
permalink: annotate_debounce_in_typescript
originalUrl: https://github.com/bowencool/blog/issues/13
tags:
  - frontend
  - typescript
description: 最近在用 ts 写一些东西，上次写 ts 还是去年的尝试
---

## 背景

最近遇到一个 debounce 场景，我熟练的找到之前的 js 代码：

```js
export const debounce = (fn, ms = 300) => {
  let timer;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.call(this, ...args);
    }, ms);
  };
};
```

然后随便改了改：

```ts
export const debounce = (fn: Function, ms: number = 300): Function => {
  let timer: number;
  return function debounced(...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.call(this, ...args);
    }, ms);
  };
};
```

## 问题

然后 vscode 就划了两道红线：
![image](https://user-images.githubusercontent.com/20217146/90105411-73fd1000-dd78-11ea-8713-ff0b43f5bfd4.png)
![image](https://user-images.githubusercontent.com/20217146/90105492-90994800-dd78-11ea-9ab9-8190421a2f47.png)

### 1

第一个还好，搜了一下，因为 Node 里 setTimeout 返回值跟浏览器不一样。我看有些答案说让改成 window.setTimeout，~~我第一时间就照做了~~，显然这样一点都不优雅，没有兼容 nodejs 的使用场景。Typescript 有个关键字`typeof`，可以取到 setTimeout 的类型，然后再配合 ReturType，轻松取到 setTimeout 返回值：

```ts
let timeoutId = ReturnType<typeof setTimeout>;
```

### 2

第二个问题，简单，ThisParameterType 嘛，取 fn 的 this 类型，顺便加个泛型：

```ts
type NoReturFn = (this: any, ...args: any[]) => void;
export function debounce<F extends NoReturFn>(fn: F, ms: number = 300): F {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function debounced(this: ThisParameterType<F>, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.call(this, ...args);
    }, ms);
  };
}
```

一保存，又飘红了：

```text
不能将类型“(this: ThisParameterType<F>, ...args: any[]) => void”分配给类型“F”。
  "(this: ThisParameterType<F>, ...args: any[]) => void" 可赋给 "F" 类型的约束，但可以使用约束 "NoReturFn" 的其他子类型实例化 "F"。ts(2322)
```

我：？？？F 不是约束了就是这种格式吗？
到这里我其实想了老半天，中间搜过别人的实现，看过@types/lodash。但他们写的都太应付了，returnType 写的都是 Function，这不坐实`AnyScript`？
一时半会儿没能解决，心态有点崩：

```diff
- return function debounced...
+ return <F>function debounced...
```

#### 2.1

这样确实消除了警告，但我越想越不服，凭啥不能分配给 F？
我猜想可能是 F 并不一定会遵守 NoReturnFn 的格式(指 return void，我试了下有 return 值的函数确实可以传进去且不报错：

```ts
const wtf: () => void = () => 1;
```

但是这样就是可以（符合直觉地）报错，完全搞不懂：

```ts
const wtf1: () => undefined | void = () => 1;
```

后来翻到这么一句话：

> [How to ensure a generic function passed to a higher order function has void return type?](https://stackoverflow.com/questions/63442877/how-to-ensure-a-generic-function-passed-to-a-higher-order-function-has-void-retu/63443626#63443626)
> I think the best thing to do here is probably to embrace TypeScript's viewpoint that a void return type means "ignore any value returned" and not "no value is returned", and move on.

大概明白了，但是为啥我在官方文档里没看到过...

所以这个 NoReturnFn 是没有效果的，除非改成：

```diff
- type NoReturnFn = (this: any, ...args: any[]) => void;
+ type NoReturnFn = (this: any, ...args: any[]) => undefined | void
```

但是这样的话，() => undefined 也是被允许的了...所以好像是没有完美的 void return 写法了

### 3

但 debounced 的 return 值一定是 void，顺着这个思路，又改了一版：

```ts
type NoReturnFn = (this: any, ...args: any[]) => void;
export function debounce<F extends NoReturnFn>(
  fn: F,
  ms: number = 300
): (this: ThisParameterType<F>, ...args: any[]) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function debounced(this: ThisParameterType<F>, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.call(this, ...args);
    }, ms);
  };
}
```

好了，没有警告，没有报错，暂时就这样了。

---

## 优化

### 1

后来又了解到：泛型的参数和函数的参数并不需要一一对应，精简了下：

```ts
export function debounce<T, P extends any[]>(fn: (this: T, ...p: P) => undefined | void, ms: number = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function debounced(this: T, ...args: P) {
    if (timeoutId !== void 0) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn.call(this, ...args);
    }, ms);
  };
}
```

### 2

return undefined 也去掉：

> [How to ensure a generic function passed to a higher order function has void return type?](https://stackoverflow.com/questions/63442877/how-to-ensure-a-generic-function-passed-to-a-higher-order-function-has-void-retu/63443626#63443626)

```ts
export function debounce<T, P extends any[], R>(
  fn: (this: T, ...p: P) => R & (void extends R ? void : never),
  ms: number = 300
) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function debounced(this: T, ...args: P) {
    if (timeoutId !== void 0) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn.call(this, ...args);
    }, ms);
  };
}
```

新手上路，难免疏漏，多多理解，欢迎斧正。
