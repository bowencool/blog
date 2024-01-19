---
pubDatetime: 2021-11-27T09:12:27Z
modDatetime: 2022-04-07T07:33:23Z
title: 记一次 @vue/cli 项目中启动 vite 开发
permalink: start-vite-development-in-vue-cli-project
originalUrl: https://api.github.com/repos/bowencool/blog/issues/14
tags:
  - frontend
  - vite
  - webpack
description: 记一次 @vue/cli 项目中启动 vite 开发
---

# 背景

我司项目基本都是 @vue/cli ，毕竟是官方出品，稳定性、维护性有保障。但是最近新一代的 no bundle 工具 vite 风头也很盛，我想着在不破坏现有体系的情况下额外提供一种尝试 vite 的方案。

本文并非全量迁移，仅多一个 vite 开发，生产还是用 @vue/cli 自带的 webpack，而且原有的 vue-cli-service serve 不受影响，技术栈为：@vue/cli-service@5、webpack@5、vite@2、vue@3

# 历程

## vue-cli-plugin-vite

首先，在开始之前，vite 问世之初，就已经有 [vite 和 vue/cli 的相关讨论](https://twitter.com/youyuxi/status/1354584410482499585)了，总结就是：现阶段 vue/cli 不会支持 vite。可以考虑 [vue-cli-plugin-vite](https://github.com/IndexXuan/vue-cli-plugin-vite)。然后我就顺理成章地去试试这个插件。

刚启动就遇到了第一个[错误](https://github.com/vitejs/vite/issues/4701)：

```
> node_modules/d/index.js:7:30: error: Could not read from file: /Users/xxx/61/vite-project/node_modules/es5-ext/string/index.js#/contains
    7 │   , contains        = require("es5-ext/string/#/contains");
      ╵                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~

error when starting dev server:
Error: Build failed with 1 error:
node_modules/d/index.js:7:30: error: Could not read from file: /Users/xxx/61/vite-project/node_modules/es5-ext/string/index.js#/contains
```

顺藤摸瓜找到了依赖路径 xxx > memoizee > ex5-ext ，好在这个包是自己开发的包，其实就一个简单的异步缓存功能，功能简单我又懒得跟进这个问题，顺手就移除了这个依赖，改成手写了。后来官方也[修复了这个问题](https://github.com/vitejs/vite/pull/4703)

紧接着，第二个错误来了，是一个 alias 失效的问题，因为我是依赖 `@vue/cli-service@next（webpack@5）`，所以 vue-cli-plugin-vite 没有兼容情有可原，所以打算看看源码再决定如何处理。找到相关代码在 vue-cli-plugin-vite > [vite-plugin-vue-cli](https://github.com/IndexXuan/vite-plugin-vue-cli/blob/main/src/index.ts#L134) 里：

```
  config.resolve.alias = finalAlias
```

这一下就有些棘手了，因为它把路堵死了: alias 是直接覆盖的，我没法在外面扩展 alias 了，怎么办？等作者更新？那得啥时候去，我现在就要！这样受制于人，干脆自己启动 vite 算了，自己写 vite config ，那不是灵活地多？

## 自己写 vite config

首先这个启动方式是额外的尝鲜功能，想要维护性好就得尽可能从 vue.config.js 里复用配置。这个不难，直接开工。

开工之前，发现事情好像不对劲，vite 直接支持 ts 配置，整个项目也都是 ts，这个 vue.config.js 也太扎眼了吧，下意识去搜了下，[现阶段并不支持 vue.config.ts](https://github.com/vuejs/vue-cli/issues/2138)，只能自己想办法。

当然这一步不是必须的，你也可以全部 js 配置。我需要 ts 配置的理由有以下几点：

- vite.config.js 是 esm 的，vue.confgi.js 是 commonjs 的，不好复用。
- 个人偏好 ts，如果有复杂代码可以获得更好的提示，再说整个项目都是 ts，有现成的 tsconfig 可以用
- vue.config.js 有个 eslint 报错，虽然不会影响业务代码，但是 VS Code 一直飘着红色早就不爽了，一直没时间解决：

```vue.config.js
const Components = require('unplugin-vue-components/webpack');
// Unable to resolve path to module 'unplugin-vue-components/webpack'.eslint(import/no-unresolved)
```

### 转换所有配置为 ts 文件

#### 编译

一开始也是看了 issue 里提供的方案：`"prestart": "tsc vue.config.ts --noEmit"` + `git ignore vue.config.js`，但是我执行下来报错太多了...是一些第三方包的类型错误，有解决办法，但是不值当的。而且生成的产物可读性也差。

然后我就尝试换一个编译器：swc。执行命令

```
swc vue.config.ts -o vue.config.js -C module.type=commonjs -C jsc.target=es2021 -C module.noInterop=true
```

但也有一些问题：swc 构建产物是 `exports.default = config` 而不是 `exports = config`。 @vue/cli 读 config 的时候并没有判断 \_\_esModule ，直接告诉你没有 "defalut" 这个 key。找了半天也找不到在哪配置这个，放弃了。

#### 引用

再换一种办法：直接在 js 里引用 ts.

首先尝试的是：`require('@swc/register')` ，直接报错：

```
SyntaxError: Cannot use import statement outside a module
```

好理解，但是要额外配置 `.swcrc`...搁这套娃呢？算了，换一个 register 试试。

经过测试，**不需要额外配置就能正常工作**的有：

- `require('sucrase/register/ts')`

不能正常工作或者需要额外配置的有：

- `@babel/register`
- `@swc/register`
- `@swc-node/register`
- `swc-register`

<details>
  <summary>查看 vue.config.js 代码（其他配置文件同理）</summary>

```js
require("sucrase/register/ts");

/**
 * @type import('@vue/cli-service').ProjectOptions
 */
const config = require("./vue.config.ts").default;

module.exports = config;
```

</details>

## 兼容 @vue/cli 配置

### entry & plugins

vite 的入口是 html，可以用 vite-plugin-html-template 获得和 vue/cli 一致的体验。

补齐 vue/cli 常用功能用到的 vite 插件：

- vite-plugin-html-template
- @vitejs/plugin-vue
- @vitejs/plugin-vue-jsx
- vite-plugin-eslint
- vite-plugin-checker
  - 会出现一些第三方类型报错，可以用 [patch-package](https://www.npmjs.com/package/patch-package) 解决。
- vite-esbuild-typescript-checker
  - 支持 watch 模式，不会提示 node_modules/ 的错误

### alias

回到刚才那个 alias 失效的问题，这下就容易多了。

```ts
// vue.config.ts
import type { ProjectOptions } from "@vue/cli-service";
// ...
import packageJson from "./package.json";
import { compilerOptions } from "./tsconfig.json";

export const alias = {};

Object.entries(compilerOptions.paths).forEach(([key, [value]]) => {
  alias[`${key.replace(/(\/\*)?$/, m => (m ? "" : "$"))}`] = resolve(
    __dirname,
    compilerOptions.baseUrl || ".",
    value.replace(/\/\*$/, "")
  );
});

export const fallback = {
  path: require.resolve("path-browserify"),
  crypto: require.resolve("crypto-browserify"),
  stream: require.resolve("stream-browserify"),
};

const config: ProjectOptions = {
  // ...
  configureWebpack: {
    resolve: {
      alias,
      fallback,
    },
    // ...
  },
};

export default config;
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import vueCliConfig, { fallback, alias, devServer } from "./vue.config";
// ...

Object.entries(alias).forEach(([key, value]) => {
  fallback[key.replace(/\$$/, "")] = value;
});
export default defineConfig({
  resolve: {
    alias: fallback,
  },
  // ...
});
```

### env

vite 的环境变量是 `import.meta.env.XXX` 是这种形式，但是我现在并不是全量迁移，不可能去把业务代码里的那么多引用全改了，所以必须采用一种兼容方案，可以采用 @rollup/plugin-replace，也可以用 define。当然，为了和 vue/cli 保持一致，这里需要把 .env[.xxx] 文件里的也定义一下：

```ts
// vite.config.ts
import { defineConfig } from "vite";
// import rollupReplace from '@rollup/plugin-replace';
// ...

const replacement = {
  "process.env.NODE_ENV": JSON.stringify(NODE_ENV),
  "process.env.VUE_APP_ENV": JSON.stringify(APP_ENV),
  "process.env.BUNDLER": '"vite"',
};

readFileSync(resolve(__dirname, `.env.${APP_ENV}`), "utf-8")
  .split("\n")
  .forEach(line => {
    line = line.trim();
    if (!line) return;
    if (line.startsWith("#")) return;
    const [key, value] = line.split("=");
    replacement[`process.env.${key}`] = JSON.stringify(value);
  });

export default defineConfig({
  plugins: [
    // rollupReplace({ values: replacement, preventAssignment: true }),
    // ...
  ],
  define: {
    "process.env": process.env,
    ...replacement,
  },
  // ...
});
```

### babel

vite 没有 babel 插件，官方说完全 cover @rollup/plugin-babel ，但是有时候就是会依赖一些插件，如[条件编译](https://github.com/kaysonwu/babel-plugin-preprocessor)。

这里我发现了一个临时方案，就是 @vitejs/plugin-vue-jsx 这个包是用 babel 的，而且接受 babelPlugins，好家伙，节省了好多时间：

```ts
// vite.config.ts
import vueJsx from "@vitejs/plugin-vue-jsx";
import babelConfig from "./babel.config";
// ...

export default defineConfig({
  plugins: [
    vueJsx({
      babelPlugins: babelConfig.plugins,
    }),
    // ...
  ],
  // ...
});
```

注意一点：这插件仅对 tsx 文件（vue 文件里 `script[lang="tsx"]` 也算）生效，这个对我来说已经够了，想用的时候改个文件后缀也不算什么成本。

## 运行时兼容

### 全局变量

运行时报`global is not defined`，极少量，能被拿来在浏览器的代码，不会重度依赖 Nodejs 全局变量，大部分只是简单判断一下，在入口 html 里：

```ejs
    <% if (NODE_ENV === 'development') { %>
    <script>
      // fix vite dev
      if (!window.global) window.global = window;
    </script>
    <% } %>
```

### 自动引入

webpack 里通过 [require.context](https://webpack.docschina.org/guides/dependency-management/#requirecontext) ，而 vite 里是 [import.meta.globEager](https://vitejs.dev/guide/features.html#glob-import) ，这个兼容一下，我这里选择双重判断，用条件编译可以更直接地移除代码，写原生判断为了避免条件编译失效：

```ts
function handleEachModule(module: any, filename?: string): void {
  // #if DEBUG
  console.log('%cimport "%s"', "color: #cf222e", filename);
  // #endif
  if (module.__esModule || module.default) {
    module = module.default;
  }
  if (Array.isArray(module)) {
    menuBaseRecord.children.push(...module);
  } else if (module) {
    menuBaseRecord.children.push(module);
  }
}

// 此目录下 *.routes.ts* 都会自动引入
if (process.env.BUNDLER === "vite") {
  // #if BUNDLER === 'vite'
  const modules = import.meta.globEager("./*.routes.ts?(x)");
  Object.entries(modules).forEach(([k, v]) => handleEachModule(v, k));
  // #endif
} else if (process.env.BUNDLER === "webpack") {
  // #if BUNDLER === 'webpack'
  const ctx: __WebpackModuleApi.RequireContext = require.context(
    "./",
    true,
    /\.routes\.tsx?$/
  );
  ctx.keys().forEach((key: string) => {
    handleEachModule(ctx(key), key);
  });
  // #endif
}
```

### 兼容 qiankun

[官方暂未支持](https://github.com/umijs/qiankun/issues/1257) ，这里我选择了 [vite-plugin-qiankun](https://www.npmjs.com/package/vite-plugin-qiankun)，暂时没发现什么问题。

## 优化推荐

推荐一个 vite 插件：https://github.com/antfu/vite-plugin-optimize-persist

# 小结

再次声明：本文并非全量迁移，仅多一个 vite 开发，生产还是用 @vue/cli 自带的 webpack。

不构成开发建议，风险自担。

# 参考链接

- https://juejin.cn/post/7005731645911203877
- https://github.com/IndexXuan/vue-cli-plugin-vite
- https://github.com/IndexXuan/vite-plugin-vue-cli/blob/main/src/index.ts
