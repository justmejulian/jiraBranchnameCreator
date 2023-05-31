import fetch from "node-fetch";
import * as dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

console.log("DEBUGPRINT[1]: fetch.mjs:8: __dirname=", __dirname)

const dotEnvPath = __dirname + '/.env';

console.log("DEBUGPRINT[4]: fetch.mjs:12: dotEnvPath=", dotEnvPath)

dotenv.config({ path: dotEnvPath });

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
    console.error("Are there Issues assigned to you and set to 'In Progress'?");
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
