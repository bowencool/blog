---
pubDatetime: 2024-05-10T15:34:01.000+08:00
title: No front-end required, 2 APIs implement OAuth authentication
permalink: oauth-implementation
tags:
  - fullstack
  - http
  - oauth
  - programming
description: I've seen too many OAuth flows designed by developers, and many of them actually require frontend involvement. Rendering the frontend page itself is already a complex process, yet they still repeatedly render pages, resulting in extremely poor performance, poor readability, and a waste of manpower. I really can't stand it anymore.
---

I've seen too many OAuth flows designed by developers, and many of them actually require frontend involvement. Rendering the frontend page itself is already a complex process, yet they still repeatedly render pages, resulting in extremely poor performance, poor readability, and a waste of manpower. I really can't stand it anymore.

The OAuth flow relies entirely on HTTP status transitions and does not require any frontend page handling, plus it has excellent performance, with authentication completed within 200ms in tests. The kind of solution involving the frontend, where rendering the page each time takes at least one second, adds up to at least five seconds total—and that's only if the page performance is passable... The whole world is just a big mess!

## Flow

```mermaid
sequenceDiagram
Note over Client: Enter the URL or click the a tag:<br>xxx.com/api/oauth/login?platform=github
Client -->> Server(xxx.com/api): GET xxx.com/api/oauth/login?platform=github
Note over Server(xxx.com/api): Construct the authentication URL based on parameters and redirect to this URL.

Server(xxx.com/api)->>Client: Responds and redirects<br>302 Location: github.com/login/oauth/authorize?client_id=abc&..
Client-->>Platform(Google/GitHub/...): Redirected to<br>GET github.com/login/oauth/authorize?client_id=abc&..

Note over Platform(Google/GitHub/...): The first authorization requires the user to click a button, but it is not needed afterwards.
Platform(Google/GitHub/...)->>Client: Redirects<br>302 Location: xxx.com/api/oauth/redirect?code=123&...

Client -->> Server(xxx.com/api): Redirected to<br>GET xxx.com/api/oauth/redirect?code=123&...

Server(xxx.com/api)-->>Platform(Google/GitHub/...): Use code to exchange for access_token<br>POST github.com/login/oauth/access_token?code=123&...
Platform(Google/GitHub/...)->>Server(xxx.com/api): {access_token:"xyz"}

Server(xxx.com/api)-->>Platform(Google/GitHub/...):Use access_token to obtain user profile<br>POST api.github.com/user?access_token=xyz
Platform(Google/GitHub/...)->>Server(xxx.com/api): {name:"bowen",mail:"..."}
Note over Server(xxx.com/api): upsert user
Note over Server(xxx.com/api): sign a token

Server(xxx.com/api)->>Client: Responds and set-cookie,<br>and redirects the user to the page they originally visited<br>302 Location: xxx.com/dashboard
Note over Client: Redirected to xxx.com/dashboard,<br>user will see dashboard page now
```

## Implementation

```ts
import { Controller, Get, Query, Response } from "@nestjs/common";
import { Response as RawResponse } from "express";

@Controller("oauth")
export class OAuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("login")
  async redirectToLogin(@Response() res: RawResponse, @Query("back") back = "/", @Query("platform") platform: string) {
    console.log(`👨🏻‍💻 login by ${platform}`);
    let state = back;
    let loginUrl: string;
    const redirect_uri = `${process.env.SELF_URL}/api/oauth/redirect?platform=${platform}`;
    switch (platform) {
      case OAuthPlatform.Google:
        loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
          process.env.GOOGLE_CLIENT_ID
        }&redirect_uri=${encodeURIComponent(
          redirect_uri
        )}&response_type=code&scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile&state=${state}`;
        break;
      case OAuthPlatform.GitHub:
        loginUrl = `https://github.com/login/oauth/authorize?client_id=${
          process.env.GITHUB_CLIENT_ID
        }&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}&scope=read:user,user:email`;
        break;
      case OAuthPlatform.GitLab:
        loginUrl = `${gitlabConstants.instanceUrl}/oauth/authorize?client_id=${
          gitlabConstants.oauth.client_id
        }&redirect_uri=${encodeURIComponent(
          redirect_uri
        )}&response_type=code&state=${state}&scope=read_user+email&code_challenge=${
          challenge.code_challenge
        }&code_challenge_method=S256`;
        break;
      // case 'wechat':
      //   loginUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${
      //     process.env.WECHAT_APPID
      //   }&redirect_uri=${encodeURIComponent(
      //     redirect_uri,
      //   )}&response_type=code&scope=snsapi_userinfo&state=${state}#wechat_redirect`;
      //   break;
      default:
        res.status(400).send("unknown platform:" + platform);
        return;
    }
    if (loginUrl) {
      console.log("redirect to:", loginUrl);
      res.redirect(302, loginUrl);
    }
  }

  @Get("redirect")
  async redirect(
    @Query("code") code: string,
    @Query("state") state = "/",
    @Query("platform") platform: OAuthPlatform,
    @Query("error_description") error_description: string,
    @Response() res: RawResponse
  ) {
    if (error_description) {
      res.status(400).send(error_description);
      return;
    }

    let backUrl = decodeURIComponent(state);

    let user: ReqUserDTO;
    if (code) {
      console.log(`👨🏻‍💻 ${platform} oauth`);
      let redirect_uri = `${process.env.SELF_URL}/api/oauth/redirect?platform=${platform}`;
      switch (platform) {
        case OAuthPlatform.Google:
          try {
            const rez = await request<{
              access_token: string;
            }>("https://oauth2.googleapis.com/token", {
              // https://developers.google.com/identity/protocols/oauth2/web-server#httprest_1
              method: "POST",
              query: {
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri,
                code,
                grant_type: "authorization_code",
              },
            });
            console.log("got google access_token", rez);
            const googleUser = await request<{
              email: string;
              name: string;
              picture: string;
              verified_email: boolean;
            }>("https://www.googleapis.com/oauth2/v1/userinfo", {
              headers: { Authorization: `Bearer ${rez.access_token}` },
            });
            console.log("got google user", googleUser);
            if (!googleUser.verified_email) {
              res.status(400).send("email not verified");
              return;
            }
            user = await this.authService.upsertUser(
              {
                avatar: googleUser.picture,
                name: googleUser.name,
                email: googleUser.email,
              },
              {
                platform,
                // exUserId: googleUser.email,
                exUserName: googleUser.name,
                exUserIdStr: googleUser.email,
                accessToken: rez.access_token,
              },
              inviteCode
            );
          } catch (error) {
            res.status(500).send(error2String(error));
            console.error(error);
            return;
          }
          break;
        case OAuthPlatform.GitHub:
          try {
            const rez = await request<{
              access_token: string;
              scope: string;
              token_type: string;
            }>("https://github.com/login/oauth/access_token", {
              // https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
              method: "POST",
              query: {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                redirect_uri,
                code,
              },
              headers: {
                Accept: "application/json",
              },
            });
            console.log("got github access_token");
            const githubUser = await request<GitHubUser>("https://api.github.com/user", {
              headers: { Authorization: `Bearer ${rez.access_token}` },
            });
            // console.log(githubUser);
            if (!githubUser.email) {
              console.log("no public email, try to get verified email");
              const emails = await request<{ verified: boolean; email: string; primary: true }[]>(
                "https://api.github.com/user/emails",
                {
                  headers: { Authorization: `Bearer ${rez.access_token}` },
                }
              );
              // console.log(emails);
              const primaryEmail = emails.find(email => email.primary);
              if (primaryEmail) {
                githubUser.email = primaryEmail.email;
              } else {
                githubUser.email = emails.find(email => email.verified)?.email;
              }
            }
            user = await this.authService.upsertUser(
              {
                avatar: githubUser.avatar_url,
                name: githubUser.name,
                email: githubUser.email,
              },
              {
                platform,
                exUserId: githubUser.id,
                exUserName: githubUser.name,
                exUserIdStr: githubUser.login,
                accessToken: rez.access_token,
              },
              inviteCode
            );
          } catch (error) {
            res.status(500).send(error2String(error));
            console.error(error);
            return;
          }
          break;
        case OAuthPlatform.GitLab:
          try {
            const rez = await request<{
              access_token: string;
              refresh_token: string;
              token_type: string;
              created_at: number;
            }>(gitlabConstants.instanceUrl + "/oauth/token", {
              // https://docs.gitlab.com/ee/api/oauth2.html
              method: "POST",
              query: {
                ...gitlabConstants.oauth,
                redirect_uri,
                code,
                grant_type: "authorization_code",
                code_verifier: challenge.code_verifier,
              },
            });
            console.log("got gitlab access_token");
            const gitlabUser = await request<GitLabUser>(gitlabConstants.instanceUrl + "/api/v4/user", {
              headers: { Authorization: `Bearer ${rez.access_token}` },
            });
            user = await this.authService.upsertUser(
              {
                avatar: gitlabUser.avatar_url,
                name: gitlabUser.name,
                email: gitlabUser.email,
              },
              {
                platform,
                exUserId: gitlabUser.id,
                exUserName: gitlabUser.name,
                exUserIdStr: gitlabUser.username,
                accessToken: rez.access_token,
                refreshToken: rez.refresh_token,
              },
              inviteCode
            );
          } catch (error) {
            console.error(error);
          }
          break;
        default:
          res.status(400).send("unknown platform:" + platform);
          return;
      }
    }
    if (user) {
      const access_token = await this.authService.login(user);
      res.cookie(COOKIE_NAME, access_token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      if (backUrl.startsWith("/")) {
        backUrl = `${process.env.DASHBOARD_URL}${backUrl}`;
      }
      res.redirect(302, backUrl);
      return;
    }
    res.status(500).send("Something went wrong.");
  }
}
```
