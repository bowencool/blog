---
pubDatetime: 2020-07-31T01:24:29Z
modDatetime: 2024-02-07T03:30:12Z
title: How to Modify Code with Code
permalink: how-to-modify-code-with-ast
originalUrl: https://github.com/bowencool/blog/issues/11
tags:
  - frontend
  - compiling
  - programming
  - JavaScript
  - ast
description: The use cases include the most common tool scenarios, such as automatically inserting some logical code or batch modifying the same code logic, and so on.
---

The use cases include the most common tool scenarios, such as automatically inserting some logical code or batch modifying the same code logic, and so on.

This article introduces a method of using AST to modify code. Reading this article requires some understanding of compiler theory basics. If you are not familiar with it yet, I recommend taking a look at [this](https://github.com/jamiebuilds/the-super-tiny-compiler) for a quick overview.

## What's AST

Quote from Wikipedia:

> An abstract syntax tree (AST) is a data structure used in computer science to represent the structure of a program or code snippet. It is a tree representation of the abstract syntactic structure of text (often source code) written in a formal language. Each node of the tree denotes a construct occurring in the text. It is sometimes called just a syntax tree.

## What can AST do?

- IDE error prompts, code formatting, syntax highlighting, and code autocompletion
- eslint for checking and fixing code errors or style issues
- webpack, rollup, babel for code bundling
- CoffeeScript, TypeScript, JSX etc. transformed into native JavaScript
- ...

## How it works

Suppose we have the following code and we want to import the store and inject it into the constructor parameters:

```js
import Vue from "vue";

import App from "./App";
import router from "./router";

new Vue({
  el: "#app",
  render: h => h(App),
  router,
});
```

### Getting the AST

First, we need a parser for the corresponding language. Taking JavaScript as an example, I directly chose the open-source @babel/parser and followed the documentation to code:

```js
const parser = require("@babel/parser");
const entryContent = fs.readFileSync(filepath, "utf-8");
const AST = parser.parse(entryContent, {
  sourceType: "module",
});
```

As you can see in the debug panel, the four top-level nodes correspond to the code:
![ast](https://user-images.githubusercontent.com/20217146/89251386-790be200-d649-11ea-818e-cd72b5b4ee35.png)

### Modifying AST

The first step is to add an ImportDeclaration of the store behind the router. Traversing the AST can be done using @babel/traverse, or you can manually write a loop. For performance reasons, it is also recommended by the official documentation that we manually write our own loops.

```js
// Find the relative node
let routerImportDeclarationIndex = 0;
let newVueExpression;
AST.program.body.forEach((node, i) => {
  if (node.type === "ImportDeclaration") {
    if (node.specifiers && node.specifiers[0].local.name === "router") {
      routerImportDeclarationIndex = i;
    }
  } else if (node.type === "ExpressionStatement") {
    if (node.expression.type === "NewExpression") {
      newVueExpression = node;
    }
  }
});
```

We generate nodes with @babel/types

```js
const t = require("@babel/types");
// insert `import store from './store'`
AST.program.body.splice(
  routerImportDeclarationIndex,
  0,
  t.importDeclaration([t.importDefaultSpecifier(t.identifier("store"))], t.stringLiteral("./store"))
  // Tip：This is equivalent to t.identifier(`import store from './store'`)
);
// Injecting parameters to the Constructor
newVueExpression.expression.arguments[0].properties.push(
  t.objectProperty(t.identifier("store"), t.identifier("store"), false, true)
);
```

### Transform AST to codes

The next step is to transform this new AST into code:

```js
const babel = require("@babel/core");

let { code } = babel.transformFromAstSync(AST, entryContent, {
  generatorOpts: {
    jsescOption: {
      // escapeEverything: false,
      quotes: "single",
    },
  },
  babelrc: false,
  configFile: false,
  presets: [],
});
// The Chinese reverse escape, no relevant configuration was found in the options, so I can only handle it manually for now.
code = code.replace(/\\u([\d\w]{4})/gi, (m, g) => String.fromCharCode(parseInt(g, 16)));

fs.writeFileSync(filepath, code);
```

The whole process ends here.

## AST reading and writing of vue files

Every language has its corresponding compiler, and Vue is no exception. Speaking of which, did you think of vue-template-compiler? Let's try it out first to see the effect.

```js
const compiler = require("vue-template-compiler");
const sfcDescriptor = compiler.parseComponent(fs.readFileSync(filePath, "utf-8"));
```

`sfcDescriptor` looks like:

```ts
interface SFCDescriptor {
  template: SFCBlock | undefined;
  script: SFCBlock | undefined;
  styles: SFCBlock[];
  customBlocks: SFCBlock[];
}
interface SFCBlock {
  type: string;
  content: string;
  attrs: Record<string, string>;
  start?: number;
  end?: number;
  lang?: string;
  src?: string;
  scoped?: boolean;
  module?: string | boolean;
}
```

<img width="480" alt="vast" src="https://user-images.githubusercontent.com/20217146/89251352-61ccf480-d649-11ea-8731-d57814b8666a.png">

You can see that the position of `sfcDescriptor` (single file component descriptor) is equivalent to vue ast (`vast`), but the structure is simpler.

Because different sections of Vue are in different languages, the content of each section can be handed over to the next parser based on the language of the section. For example:

When `sfcDescriptor.script.lang === void 0 || sfcDescriptor.script.lang === 'js'`, we hand over `sfcDescriptor.script.content` to babel for processing.

> Default is js. If `lang: 'js'` is specified here, an additional `lang` attribute will be added when generating code `<script lang="js"></script>`.

We only need to convert `sfcDescriptor` (`vast`) back into code. (I couldn't find an official package for this purpose, so I randomly searched for one, called `vue-sfc-descriptor-stringify`, and haven't encountered any issues so far.)

### Pits I Stepped In

At the beginning, `vast.template.content` was processed using `vue-template-compiler`, but it had too many drawbacks:

1. The official did not provide a `transform` method.
2. It is too complicated to handle, requiring differentiation of various directives and modifiers.
3. The converted AST loses significant details:
   1. Comment nodes are lost.
   2. Abbreviations cannot be distinguished, such as: `v-on` or `@`.

The first two points can be tolerated, but the third point is completely unacceptable for this scenario. Of course, `vue-template-compiler` is designed to generate render functions, so it's not its fault.

Conclusion: Operating on `vast.template` with an HTML compiler is much more convenient. Upon further consideration, the default language attribute for templates is 'html', so my own tinkering was unnecessary and there was no need for the official to write another template compiler.
