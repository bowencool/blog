---
pubDatetime: 2023-04-14T11:04:13Z
modDatetime: 2023-06-24T11:27:26Z
title: 如何在 vercel 中部署 nestjs 应用
permalink: how-to-deploy-nestjs-app-to-vercel
originalUrl: https://github.com/bowencool/blog/issues/23
tags:
  - tricks
  - fullstack
  - nodejs
  - serverless
description: 将 nestjs 应用部署到 vercel 的步骤
---

1. 创建一个 `api/restful.js` 文件，内容如下：

   ```js
   require("../dist/src/main");
   ```

   或者创建一个 `api/restful.ts` 文件，内容如下：

   ```ts
   require("../src/main");
   ```

2. 创建一个 `vercel.json` 文件，内容如下：

   ```json
   {
     "framework": null,
     "outputDirectory": ".",
     "buildCommand": "npm run build",
     "functions": {
       "api/*.js": {
         "memory": 1024,
         "maxDuration": 10
       }
     },
     "rewrites": [
       {
         "source": "/api(.*)",
         "destination": "/api/restful"
       },
       {
         "source": "/(.*)",
         "destination": "/public"
       }
     ]
   }
   ```

3. 通过执行 `vercel deploy` 或 `vercel deploy --prod` 进行部署。

4. 本地开发：

   1. 您可以直接执行 `vercel dev -l 3100`，它会自动加载 `.env` 文件。您可能还需要同时运行 `npx nest build --watch`。
   2. ~~执行 `dotenv npx nest start --watch`，手动加载`.env`文件。~~ 我发现 `--watch` 这种方式没有用。
   3. 执行 `npx nest start --watch`之前，需要在代码中添加以下内容以加载 `.env` 文件：
      ```ts
      export const isNestDev = !process.env.JWT_SECRET;
      if (isNestDev) {
        require("dotenv").config();
      }
      ```
