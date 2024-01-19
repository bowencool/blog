---
pubDatetime: 2023-04-14T11:04:13Z
modDatetime: 2023-06-24T11:27:26Z
title: How to deploy nestjs app to vercel
permalink: how-to-deploy-nestjs-app-to-vercel
originalUrl: https://api.github.com/repos/bowencool/blog/issues/23
tags:
  - tricks
  - frontend
  - fullstack
description: Steps to deploy nestjs app to vercel
---

1. Create an `api/restful.js` file with the following content:

   ```js
   require("../dist/src/main");
   ```

   Or create an `api/restul.ts` file with:

   ```ts
   require("../src/main");
   ```

2. Create a `vercel.json` file with the following content:

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

3. Deploy by executing `vercel deploy` or `vercel deploy --prod`.

4. Locally development:

   1. You can just execute `vercel dev -l 3100`, which automatically loads the `.env` file. You may need to run `npx nest build --watch` together.
   2. ~~Execute `dotenv npx nest start --watch` which manually loads the `.env` file.~~ I found `--watch` doesn't work in this way.
   3. Execute `npx nest start --watch` which needs to add the following content in your codes to load the `.env` file:
      ```ts
      export const isNestDev = !process.env.JWT_SECRET;
      if (isNestDev) {
        require("dotenv").config();
      }
      ```
