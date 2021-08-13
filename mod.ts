import { parse } from "https://deno.land/std@0.103.0/encoding/yaml.ts";

type YamlFile = {
  on: Record<string, unknown>;
  name: string;
};

type GithubWorkflow = {
  filename: string;
  name: string;
};

function wrap(subject: string, w: string) {
  return `${w}${subject}${w}`;
}

function mdLink(content: string, url: string) {
  return `[${content}](${url})`;
}

function renderActionsTable(githubRepo: string, workflows: GithubWorkflow[]) {
  const columns = ["Workflow name", "Links"];
  const headerRow = columns.join("|");
  const dividerRow = columns.map((_) => "-").join("|");

  const contentRows = workflows
    .map(({ name, filename }) => {
      const url =
        `https://github.com/${githubRepo}/actions/workflows/${filename}`;
      const link = mdLink("View action", url);

      const row = [name, link];
      return row.join("|");
    })
    .join("\n");

  const table = [headerRow, dividerRow, contentRows]
    .map((x) => wrap(x, "|"))
    .join("\n");

  return table;
}

function replaceActionsSection(markdown: string, injection: string) {
  const REGEX = /<!--actions-begin-->(.*)<!--actions-end-->/s;
  const replacement = [
    "<!--actions-begin-->",
    injection,
    "<!--actions-end-->",
  ].join("\n");

  const nextMarkdown = markdown.replace(REGEX, replacement);

  return nextMarkdown;
}

const [path] = Deno.args;
const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();
const GITHUB_REPOSITORY = Deno.env.get("GITHUB_REPOSITORY") || "";

const data = await Deno.readFile(path);
const markdown = decoder.decode(data);

const workflows = [] as GithubWorkflow[];

for await (const dirEntry of Deno.readDir(".github/workflows")) {
  const { name } = dirEntry;
  if (name.includes(".yml") || name.includes(".yaml")) {
    const workflow = await Deno.readFile(`.github/workflows/${name}`);
    const yaml = parse(decoder.decode(workflow)) as YamlFile;

    // If we find the workflow_dispatch, it means we can manually
    // trigger this workflow.
    if ("workflow_dispatch" in yaml.on) {
      workflows.push({
        filename: name,
        name: yaml.name,
      });
    }
  }
}

const nextMarkdownTable = renderActionsTable(GITHUB_REPOSITORY, workflows);
const nextMarkdown = replaceActionsSection(markdown, nextMarkdownTable);

const encodedMarkdown = encoder.encode(nextMarkdown);
await Deno.writeFile(path, encodedMarkdown);
