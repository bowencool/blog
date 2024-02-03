---
pubDatetime: 2020-07-31T08:27:32Z
modDatetime: 2024-02-03T14:50:15.507Z
title: SSR（服务端渲染）基本原理和流程
permalink: server-side-rendering-rationale
originalUrl: https://github.com/bowencool/blog/issues/12
tags:
  - frontend
  - fullstack
  - ssr
  - vue
  - react
description: SSR（服务端渲染）基本工作模式原理
---

## 什么是 SSR

服务端渲染 Server Side Rendering。与传统纯客户端渲染(Client Side Rendering)的差别是：

CSR 模式下服务端返回的是：

```html
<body>
  <div id="app"></div>
  <script src="/main.xxx.js"></script>
</body>
```

SSR 模式下服务端返回的是

```html
<div id="app" data-server-rendered="true">
  <div class="user-wraper">
    <p>你好，风清扬</p>
  </div>
  <ul class="order-list">
    <li>订单号：111</li>
    <li>订单号：222</li>
    ...
  </ul>
</div>
```

## 为什么要用 SSR

优点主要有两点：

- 降低白屏时间
- SEO 友好

## SSR 时序图

<!-- ![ssr1](https://user-images.githubusercontent.com/20217146/89017104-6002e880-d34c-11ea-952a-cd05502a5b37.jpeg) -->

```mermaid
sequenceDiagram
Note over Client: 输入URL回车: <br>http://xxx.com/order/list?page=1&size=20
Client ->> Node Server: 发送get请求
Note over Node Server: 收到请求
Note over Node Server: 解析URL（由router提供api），得到具体路由、组件<br>例如：[Layout、OrderList]
Note over Node Server: 【可选业务逻辑】解析路由/组件所需要的条件，例如：<br>权限不够，返回403；未登陆，重定向到login。
Note over Node Server: 数据预取（如果需要的话），例如：<br>Layout需要请求user-profile接口，<br>OrderList需要请求order-list接口，<br>Node端需要把这些数据请求回来
Node Server-->>Api Server: /api/user/profile
Node Server-->>Api Server: /api/order/list?page=1&size=20
Api Server->>Node Server: { name: '风清扬', id: 982347 }
Api Server->>Node Server: { list: [Array(20)], total: 123 }

Note over Node Server: set数据，以store.commit为例
Note over Node Server: 渲染完整HTML: 一般由框架提供api。（此过程要把预取的数据，<br>也就是初始的store，塞给Client，避免Client重复请求，<br>一来节省网络资源，二来避免两次请求数据不一致导致页面抖动）
Node Server->>Client: 返回HTML
Note over Client: 浏览器渲染HTML，已经是完整的DOM树
Note over Client: 浏览器执行js，检查服务端塞回来的预取数据，生成虚拟DOM，例如：<br>new Vue({ el: '#app' })
Note over Client: 虚拟DOM挂载到真实DOM（见下图）
Note over Client: 第一部分完，以下跟正常CSR一样
Note over Client: 切换路由到：<br>/order/3
Client-->>Api Server: /api/order/3
Api Server->>Client: { id: 3, order_sn: '12312364' }
Note over Client: 更新视图
```

### 虚拟 DOM 挂载到真实 DOM

<!-- ![ssr2](https://user-images.githubusercontent.com/20217146/89017153-6e510480-d34c-11ea-9f06-e12dbafad1e4.jpeg) -->

```mermaid
flowchart TB;
  vNode([刚刚生成虚拟DOM]) --> dom[找到真实DOM] --> isSSR{真实DOM是服务端渲染的？};
  isSSR -- No --> override([覆盖]);
  isSSR -- Yes --> isSame{真实DOM和虚拟DOM结构一样？};
  isSame -- No --> override;
  isSame -- Yes --> reuse([重用DOM，注册事件]);
```
