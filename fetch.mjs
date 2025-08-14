import fetch from "node-fetch";
import * as dotenv from "dotenv";

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dotEnvPath = __dirname + '/.env';

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
  let response;
  try {
    const searchParams = JSON.parse(bodyData);
    const jql = encodeURIComponent(searchParams.jql);
    let url = `https://${auth.domain}.atlassian.net/rest/api/3/search?jql=${jql}`;

    if (searchParams.fields) {
      const fields = searchParams.fields.join(",");
      url += `&fields=${fields}`;
    }

    response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
        Authorization: `Basic ${Buffer.from(
          `${auth.email}:${auth.token}`
        ).toString("base64")}`,
        Accept: "application/json",
      },
    });

    if (response.status !== 200) {
      console.error(response.status, response.statusText);
      process.exit(1);
    }

    return JSON.parse(await response.text());
  } catch (e) {
    console.error("Error parsing bodyData:", e);
    process.exit(1);
  }
}