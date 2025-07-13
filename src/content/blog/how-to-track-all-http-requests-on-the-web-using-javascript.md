---
pubDatetime: 2025-07-13T15:30:33.000+08:00
modDatetime: 2025-07-13T08:22:21Z
title: How to track all http requests on the web using javascript
permalink: how-to-track-all-http-requests-on-the-web-using-javascript
featured: false
tags:
  - javascript
  - frontend
description: How to track all http requests on the web using javascript
---

```ts
const K = 2 ** 10;
const UNITS = ["B", "KiB", "MiB", "TiB", "PiB"];
export function formatSize(B: number = 0): string {
  let n = B;
  let i = 0;
  while (n > K && i < UNITS.length - 1) {
    n /= K;
    i += 1;
  }
  const unit = UNITS[i];
  if (i === 0) return n + unit;
  return n.toFixed(2) + unit;
}

export async function formatBlob(blob: Blob): Promise<string> {
  const size = formatSize(blob.size);
  let head = `[Blob ${size}`;
  if (blob.type) {
    head += ` ${blob.type}`;
  }
  if (blob instanceof File) {
    head += ` ${blob.name}`;
  }
  head += "]:";
  head += await blob.text();
  return head;
}

export async function formatBody(body: unknown) {
  // body stringify
  if (typeof body === "string") {
    return body;
  }
  if (body instanceof Blob) {
    return formatBlob(body);
  }
  if (body instanceof FormData) {
    let theText: string = "[FormData]";
    if (!body.entries) {
      return theText;
    }
    // let totalSize = 0;
    // let theJson: Record<string, string> = {};
    for (let [k, v] of body.entries()) {
      // if (totalSize > K) break;
      if (v instanceof Blob) {
        theText += `\n${k}: ${await formatBlob(v)}`;
        // totalSize += v.size;
        // theJson[k] = await formatBlob(v);
      } else if (typeof v === "string") {
        // const s = sizeOfString(v);
        // totalSize += s;
        // theJson[k] = v;
        theText += `\n${k}: ${v}`;
      }
    }
    return `${theText}`;
  }
  if (body) {
    return Object.prototype.toString.call(body);
  }
}

export const stringifyJSON = (circ: unknown) => {
  // Note: cache should not be re-used by repeated calls to JSON.stringify.
  let cache: unknown[] = [];
  return JSON.stringify(circ, (key, value) => {
    if (typeof value === "object" && value !== null) {
      // console.log(key, value);
      // Duplicate reference found, discard key
      if (cache.includes(value)) return;

      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
};

function overrideMethod<T extends Record<PropertyKey, any>, K extends keyof T>(
  target: T,
  key: K,
  replacement: (f: T[K]) => T[K]
) {
  if (key in target) {
    const originFn = target[key];
    const replaced = replacement(originFn);
    if (typeof replaced === "function") {
      // eslint-disable-next-line no-param-reassign
      target[key] = replaced;
    }
  }
}

declare global {
  interface XMLHttpRequest {
    // Add custom attributes for easier recording
    requestHeaders?: Record<string, string>;
    method?: string;
    url?: string | URL;
    requestText?: string;
  }
}

// Record request headers
overrideMethod(
  XMLHttpRequest.prototype,
  "setRequestHeader",
  originFn =>
    function (this: XMLHttpRequest, ...args: Parameters<XMLHttpRequest["setRequestHeader"]>) {
      try {
        if (!this.requestHeaders) this.requestHeaders = {};
        const [key, value] = args;
        if (this.requestHeaders[key]) {
          this.requestHeaders[key] += `, ${value}`;
        } else {
          this.requestHeaders[key] = value;
        }
      } catch (e) {
        // ignore
      }
      return originFn.apply(this, args);
    }
);

// Record request method and url
overrideMethod(
  XMLHttpRequest.prototype,
  "open",
  originFn =>
    function (this: XMLHttpRequest, method: string, url: string | URL, ...rest: any[]) {
      try {
        this.method = method;
        this.url = url;
      } catch (e) {
        // ignore
      }
      return originFn.apply(this, [method, url, ...rest]);
    }
);

overrideMethod(
  XMLHttpRequest.prototype,
  "send",
  originFn =>
    function (this: XMLHttpRequest, ...args: Parameters<XMLHttpRequest["send"]>) {
      try {
        let { method = "GET", url = "", responseURL = "" } = this;
        url = url || responseURL;
        const urlString: string = url instanceof URL ? url.href : url || responseURL;
        const body = args[0];

        // body stringify
        formatBody(body).then(s => {
          this.requestText = s;
        });
        const sendTime = Date.now();

        this.addEventListener("readystatechange", async () => {
          if (this.readyState === XMLHttpRequest.DONE) {
            let response: string = "";
            switch (this.responseType) {
              case "":
              case "text":
                response = this.responseText;
                break;
              case "json":
                response = stringifyJSON(this.response);
                break;
              case "blob":
                response = await formatBlob(this.response);
                break;
              default:
                response = `unhandle responseType: ${this.responseType}`;
            }

            console.log({
              category: "http",
              type: "xhr",
              time: Date.now(),
              sendTime,
              data: {
                status: this.status,
                method,
                url: urlString,
                requestHeaders: this.requestHeaders,
                response,
                request: this.requestText,
              },
            });
          }
        });
      } catch (error) {
        // ignore
      }

      return originFn.apply(this, args);
    }
);

if ("fetch" in window) {
  overrideMethod(
    window,
    "fetch",
    originFn =>
      function (...args) {
        let url: string;
        let method = "GET";
        const [requestInfo, requestInit] = args;
        const sendTime = Date.now();
        let requestText: string | undefined;
        const requestHeaders: Record<string, string> = {};

        try {
          if (typeof requestInfo === "string") {
            url = requestInfo;
            method = requestInit?.method ?? "GET";
          } else if (requestInfo instanceof Request) {
            const request = requestInfo.clone();
            // The subsequent requestInit will override the previous request.
            url = request.url;
            method = requestInit?.method || request.method;
            // body stringify
            const body = requestInit?.body || request.body;
            // if (body instanceof ReadableStream) {
            //   body = body.clone();
            // }
            formatBody(body).then(s => {
              requestText = s;
            });

            // requestHeaders
            const headers: Headers | string[][] | Record<string, string> | undefined =
              requestInit?.headers || request.headers;

            if (headers instanceof Headers) {
              for (const [k, v] of headers.entries()) {
                // console.log(`${k}: ${v}`);
                requestHeaders[k] = v;
              }
            } else if (Array.isArray(headers)) {
              headers.forEach(([k, v]) => {
                if (requestHeaders[k]) {
                  requestHeaders[k] += `, ${v}`;
                } else {
                  requestHeaders[k] = v;
                }
              });
            } else if (typeof headers === "object") {
              Object.entries(headers).forEach(([k, v]) => {
                // console.log(`${k}: ${v}`);
                requestHeaders[k] = v;
              });
            } else console.log("unknown req header", headers);
          }
        } catch (error) {
          // ignore
        }

        return originFn
          .apply(window, args)
          .then(async (response: Response) => {
            // logIndicator('Fetch', method, url);
            try {
              const clonedResponse = response.clone();
              const contentType = clonedResponse.headers.get("Content-Type") || "";
              let responseText = contentType;
              if (/^(application\/(xml|json))|(text\/\w+)/.test(contentType)) {
                responseText = await clonedResponse.text();
              } else {
                const blob = await clonedResponse.blob();
                responseText = await formatBlob(blob);
              }
              console.log({
                category: "http",
                type: "fetch",
                time: Date.now(),
                sendTime,
                data: {
                  status: clonedResponse.status,
                  method,
                  url: url || clonedResponse.url,
                  request: requestText,
                  requestHeaders: Object.keys(requestHeaders).length === 0 ? undefined : requestHeaders,
                  response: responseText,
                },
              });
            } catch (error) {
              // ignore
            }
            return response;
          })
          .catch((error: Error) => {
            // This is where failed to send, it's a bit different from the one above.
            console.log({
              category: "http",
              type: "fetch",
              time: Date.now(),
              sendTime,
              data: {
                status: 0,
                method,
                url,
              },
            });
            throw error;
          });
      }
  );
}
```
