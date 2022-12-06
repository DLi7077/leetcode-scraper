import _ from "lodash";
import { getLeetcodePageContents, uploadProblemToKatsudon } from "./api.js";
import { PUBLIC_PROBLEMS } from "../problems.js";

function getProblemStats(scrapedObject) {
  const problemData = _.get(scrapedObject, "queries[0].state.data.question");
  const descriptionData = _.get(
    scrapedObject,
    "queries[7].state.data.question.content"
  );
  const problemTags = _.get(
    scrapedObject,
    "queries[9].state.data.question.topicTags"
  );

  const result = {
    id: _.get(problemData, "questionFrontendId"),
    title: _.get(problemData, "title"),
    difficulty: _.get(problemData, "difficulty"),
    tags: problemTags.map((tag) => tag.name),
    url: `https://leetcode.com/problems/${_.get(problemData, "titleSlug")}`,
    description: descriptionData.replaceAll(
      'alt=""',
      'alt="visual" style="height:auto; max-width:100%;"'
    ),
  };

  return result;
}

async function scrape(problemSlugs) {
  const scrapeTasks = new Set(problemSlugs);

  for (const problemSlug of problemSlugs) {
    await getLeetcodePageContents(problemSlug)
      .then(async (res) => {
        const scrapedProblem = getProblemStats(res);
        if (!scrapedProblem.description.length) {
          console.error(`Upload Failed : ${problemSlug}`);
          return;
        }

        scrapeTasks.delete(problemSlug);
        await uploadProblemToKatsudon(scrapedProblem).then((createdProblem) => {
          console.log(
            `Upload Success : ${_.get(createdProblem, "problem.title")}`
          );
        });
      })
      .catch(() => {
        console.error(`Upload Failed : ${problemSlug}`);
      });
  }

  console.warn("couldn't scrape the following:");
  console.log(Array.from(scrapeTasks.values()));
}

await scrape(PUBLIC_PROBLEMS);
