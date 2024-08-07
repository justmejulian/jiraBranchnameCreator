#!/usr/bin/env node

import clipboard from "clipboardy";
import inquirer from "inquirer";

import { fetchMyIssues } from "./fetch.mjs";

const prompt = inquirer.createPromptModule({ output: process.stderr })

const { storyType } = await prompt([
  {
    type: "list",
    name: "storyType",
    message: "Choose Story Type",
    choices: ["feature", "bugfix", "hotfix", "optimization"],
  },
]);

const fetchedIssues = await fetchMyIssues();

// mapped to name value for the select
const issues = fetchedIssues.map((issue) => ({
  name: issue.key + ": " + issue.title,
  value: issue,
}));

const { selectedIssue } = await prompt([
  {
    type: "list",
    name: "selectedIssue",
    message: "Choose Issue",
    choices: issues,
  },
]);

const passedTitle = selectedIssue.title
  .toLowerCase()
  .replace(" - ", " ")
  .replace(/\s/g, "-")
  .replace(/[^a-z0-9\-]/gi, "");

let branchName = `${storyType}/${selectedIssue.key}-${passedTitle}`;

const questions = [
  {
    type: "editor",
    name: "editedBranchname",
    message: "Edit Branchname",
    default: branchName,
    waitUserInput: true,
  },
];

// ask to shorten name until short enough
while (branchName.length > 54) {
  console.error("Branchname too long ", branchName.length);

  branchName = await prompt(questions).then((answers) => {
    return answers?.editedBranchname?.trim();
  });
}

console.log(branchName);
