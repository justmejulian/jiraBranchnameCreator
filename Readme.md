# Jira Branchname creator

Create git flow branch name using Jira issues assgined to you.

## Run

Create .env file. And add your info.

```shell
cp .env.example .env
```

Run script

```shell
node index.mjs
```

### Pipe

The prompts are displayed using stderr.
This allows you to pipe to other commands.

As an example, you can create a new branch using or script as a substitution command.

```shell
git checkout -b $(node index.mjs)
```

### Copy to clipboard

```shell
node index.mjs --copy-to-clipboard
```

Your resulting branchname will be copied ready for you to use.

## Install

installs globally.

```
npm link
```
