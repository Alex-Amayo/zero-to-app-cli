#!/usr/bin/env node

const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const args = process.argv.slice(2);

const git = simpleGit();
const [appName] = args;

if (!appName) {
  console.error('Please provide an app name.');
  process.exit(1);
}

const checkVersion = async () => {
  try {
    const { data } = await axios.get('https://registry.npmjs.org/zerotoapp-cli/latest');
    const latestVersion = data.version;
    const currentVersion = require('./package.json').version;

    if (currentVersion !== latestVersion) {
      console.error(`You are using version ${currentVersion}. The latest version is ${latestVersion}. Please update your CLI tool.`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error checking for the latest version:', error.message);
    process.exit(1);
  }
};

const cloneRepo = async () => {
  const tempDir = path.join(__dirname, 'temp-repo');

  try {
    // Clone the repository to a temporary directory
    await git.clone('https://github.com/yourusername/zerotoapp.git', tempDir);

    // Create the new directory and copy files from the cloned repo
    const newDir = path.join(process.cwd(), appName);
    await fs.copy(tempDir, newDir);

    console.log(`Template copied to ${newDir}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Clean up temporary directory
    await fs.remove(tempDir);
  }
};

const main = async () => {
  try {
    await checkVersion();
    await cloneRepo();
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

main();
