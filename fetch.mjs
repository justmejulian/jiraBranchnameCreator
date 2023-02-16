import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config();

const auth = {
  domain: process.env.DOMAIN,
  email: process.env.EMAIL,
  token: process.env.TOKEN,
};

export async function fetchMyIssues() {
  // https://energych.atlassian.net/rest/api/2/status
  // const bodyData = `{"jql": "assignee= currentUser() AND status != 5 AND status != 6", "fields": [ "key", "summary" ] }`;
  // status 3 -> In Progress
  const bodyData = `{"jql": "assignee= currentUser() AND status = 3", "fields": [ "key", "summary" ] }`;
  const responseJson = await jiraSeach(bodyData);

  if (!responseJson?.issues.length) {
    console.error("No issues found");
    process.exit(1);
  }

  return responseJson.issues.map((issue) => ({
    key: issue.key,
    title: issue.fields.summary,
  }));
}

async function jiraSeach(bodyData) {
  const response = await fetch(
    "https://energych.atlassian.net/rest/api/3/search",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${auth.email}:${auth.token}`
        ).toString("base64")}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: bodyData,
    }
  ).catch((err) => console.error(err));

  if (response.status !== 200) {
    console.error(response.status, response.statusText);
    process.exit(1);
  }

  return JSON.parse(await response.text());
}
