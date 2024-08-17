#!/usr/bin/env node

const { Command } = require('commander');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { blue, red, green, cyan, yellow, bold } = require('colorette');

const packageJson = require('./package.json');
const currentVersion = packageJson.version;

async function checkForUpdates() {
  try {
    const { default: updateNotifier } = await import('update-notifier');
    const notifier = updateNotifier({
      pkg: packageJson,
      updateCheckInterval: 1000 * 60 * 60 * 24 // Check daily
    });

    if (notifier.update) {
      console.log(`A new version (${notifier.update.latest}) is available. Please update with the --update flag.`);
    }
  } catch (error) {
    console.error(red('Failed to check for updates:'), error.message);
  }
}

async function updateCLI() {
  console.log('Updating CLI tool to the latest version...');
  exec('npm install -g zero-to-app', (error, stdout, stderr) => {
    if (error) {
      console.error(red(`Error updating CLI tool: ${error.message}`));
      process.exit(1);
    }
    console.log(stdout);
    console.error(stderr);
    console.log(green('CLI tool updated successfully!'));
  });
}

const program = new Command();
program.version(currentVersion);

program
  .option('--update', 'Update to the latest version of the CLI tool')
  .argument('<appname>', 'Name of the application to create')
  .action(async (appname) => {
    if (program.update) {
      await updateCLI();
      return;
    }

    await checkForUpdates();

    const git = simpleGit();
    const targetDir = path.resolve(process.cwd(), appname);

    if (fs.existsSync(targetDir)) {
      console.error(red(`Directory ${appname} already exists. Please choose a different name.`));
      process.exit(1);
    }

    console.log(`Creating a new Zero To App project in ${blue(targetDir)}...`);
    try {
      await git.clone('https://github.com/Alex-Amayo/zero-to-app', targetDir);
      
      console.log('Navigating to the project directory...');
      process.chdir(targetDir);

      console.log('Installing dependencies. This might take a few minutes...');
      exec('yarn install', (error, stdout, stderr) => {
        if (error) {
          console.error(red(`Error installing dependencies: ${error.message}`));
          process.exit(1);
        }
        console.log(stdout);
        console.error(stderr);

        console.log(green('Success! Created test at C:\\Users\\alexa\\Documents\\test'));
        console.log('Inside this directory, you can run several commands:\n');
        
        console.log(cyan('  yarn start'));
        console.log('    Starts the development server.\n');
        
        console.log(cyan('  yarn build'));
        console.log('    Bundles the app into static files for production.\n');
        
        console.log(cyan('  yarn test'));
        console.log('    Starts the test runner.\n');
        
        console.log(yellow('Remember to set your environment variables.\n'));
        console.log(bold('Build, Launch, iterate!'));
      });
    } catch (error) {
      console.error(red('An error occurred while cloning the repository:'), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
