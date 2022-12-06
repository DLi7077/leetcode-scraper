import fetch from "node-fetch";
import jsdom from "jsdom";
import _ from "lodash";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// https://stackoverflow.com/questions/47809366/can-i-use-dom-query-methods-against-a-fetch-api-response
export async function getLeetcodePageContents(titleSlug) {
  const sleepTime = 2000 + _.random(0, 1000);
  await sleep(sleepTime);
  return await fetch(`https://leetcode.com/problems/${titleSlug}`)
    .then((res) =>
      res.text().then((text) => {
        const page = new jsdom.JSDOM(text).window;
        const hugeScriptTag = page.document.getElementById("__NEXT_DATA__");

        return _.get(
          JSON.parse(hugeScriptTag.innerHTML),
          "props.pageProps.dehydratedState"
        );
      })
    )
    .catch(console.error);
}

export async function uploadProblemToKatsudon(problem) {
  const createURL = "http://localhost:3001/api/problem/create";

  const createdProblem = await fetch(createURL, {
    method: "POST",
    cache: "no-cache",
    headers: { "Content-Type": "application/json" },
    referrerPolicy: "no-referrer",
    body: JSON.stringify(problem),
  });
  return createdProblem.json();
}
