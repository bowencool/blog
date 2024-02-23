import { throttleAsyncResult } from "@bowencool/async-utilities";
/* make a network request */
function api(data: { msg: string }) {
  console.log("submiting", data);
  return fetch("https://httpbin.org/delay/1.5", {
    body: JSON.stringify(data),
    method: "POST",
    mode: "cors",
  });
}

const throttledApi = throttleAsyncResult(api);

export default function ThrottleAsyncResultDemo() {
  return (
    <button
      onClick={async function () {
        const rez = await throttledApi({
          msg: "some data to be sent",
        });
        console.log("completed");
      }}
    >
      submit(click me quickly)
    </button>
  );
}
