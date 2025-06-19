// update-projects.js
const fs = require("fs");
const path = require("path");
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const username = "aifordiscord";
const readmePath = path.join(__dirname, "README.md");

async function fetchPinnedRepos() {
  const { data } = await octokit.rest.repos.listForUser({
    username,
    sort: "updated",
    per_page: 6,
  });
  return data;
}

function generateMarkdownTable(repos) {
  const rows = repos.map((repo) => {
    const techStack = repo.topics?.join(", ") || "Unknown";
    const aiRole = repo.description?.toLowerCase().includes("ai")
      ? "**AI-coded**"
      : "Manual";
    return `| [🔗 ${repo.name}](${repo.html_url}) | ${repo.description || "No description"} | ${techStack} | ${aiRole} |`;
  });

  return `| Project | Description | Tech | AI Role |
|--------|-------------|------|---------|
${rows.join("\n")}`;
}

function updateReadme(content) {
  const readme = fs.readFileSync(readmePath, "utf8");
  const newReadme = readme.replace(
    /<!--PROJECTS-START-->([\s\S]*?)<!--PROJECTS-END-->/,
    `<!--PROJECTS-START-->\n${content}\n<!--PROJECTS-END-->`
  );
  fs.writeFileSync(readmePath, newReadme);
}

(async () => {
  try {
    const repos = await fetchPinnedRepos();
    const markdown = generateMarkdownTable(repos);
    updateReadme(markdown);
    console.log("✅ README updated with latest projects.");
  } catch (error) {
    console.error("❌ Error updating README:", error);
  }
})();

console.log("\\n--- 📋 Updated Projects Table ---\\n");
console.log(markdown);
