const { githubApi } = require("@barecheck/core");
const path = require("path");

const { getPullRequestContext, getOctokit } = require("../lib/github");
const { getWorkspacePath } = require("../input");

const getChangedFilesCoverage = async (coverage) => {
  const pullRequestContext = getPullRequestContext();

  if (!pullRequestContext) { 
    core.warn(`Could not fetch pr context`);  
    return coverage.data
  };

  const octokit = await getOctokit();

  const { repo, owner, pullNumber } = pullRequestContext;
  const changedFiles = await githubApi.getChangedFiles(octokit, {
    repo,
    owner,
    pullNumber
  });

  core.info(`changed files: ${changedFiles}`);

  const workspacePath = getWorkspacePath();
  const changedFilesCoverage = coverage.data.reduce(
    (allFiles, { file, lines }) => {
      const filePath = workspacePath ? path.join(workspacePath, file) : file;
      core.info(`changed files: ${filePath}`);
      const changedFile = changedFiles.find(
        ({ filename }) => filename === filePath
      );

      if (changedFile) {
        return [
          ...allFiles,
          {
            file: filePath,
            url: changedFile.blob_url,
            lines
          }
        ];
      }
      return allFiles;
    },
    []
  );
  core.info(`changed files: ${changedFilesCoverage}`);
  return changedFilesCoverage;
};

module.exports = getChangedFilesCoverage;
