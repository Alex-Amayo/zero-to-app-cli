#!/usr/bin/env node

const { Command } = require('commander');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { blue, red, green, cyan, white, bold } = require('colorette');

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
      console.log(`A new version (${notifier.update.latest}) is available.`);
    }
  } catch (error) {
    console.error(red('Failed to check for updates:'), error.message);
  }
}

const program = new Command();
program.version(currentVersion);

program
  .argument('<appname>', 'Name of the application to create')
  .action(async (appname) => {
    await checkForUpdates();

    const git = simpleGit();
    const targetDir = path.resolve(process.cwd(), appname);

    if (fs.existsSync(targetDir)) {
      console.error(red(`Directory ${appname} already exists. Please choose a different name.`));
      process.exit(1);
    }

    console.log(`Creating a new Zero To App project in ${blue(targetDir)} with Zero To App version ${currentVersion}...`);
    try {
      // Clone the template repo
      await git.clone('https://github.com/Alex-Amayo/zero-to-app', targetDir);

      // Remove the .git folder to avoid referencing the template repo
      const gitDir = path.join(targetDir, '.git');
      if (fs.existsSync(gitDir)) {
        fs.rmSync(gitDir, { recursive: true, force: true });
      }

      console.log('Navigating to the project directory...\n');
      process.chdir(targetDir);
      console.log('Installing dependencies. This might take a few minutes...\n');
      console.log(`Installing ${cyan('react')}, ${cyan('react-native')}, ${cyan('react-native-web')}, ...\n`);
      
      // Install dependencies using yarn
      exec('yarn install', (error, stdout) => {
        if (error) {
          console.error(red(`Error installing dependencies: ${error.message}`));
          process.exit(1);
        }
        console.log(stdout);

        console.log(white(appname + ' has been successfully created in ' + targetDir));
        console.log('Inside this directory, you can run several commands:\n');
        
        console.log(cyan('  yarn start'));
        console.log('    Starts the development server.\n');

        console.log(cyan('  yarn test <filename>'));
        console.log('    Runs a jest test with the specified filename.\n');

        console.log(cyan('  yarn lint'));
        console.log('    Lints your code, checks for coding style and potential errors.\n');
        
        console.log(cyan('  yarn export web'));
        console.log('    Creates a static bundle that you can host on the web.\n');
        
        console.log(green(`Start by connecting your project to Supabase: `) + white(`https://app.supabase.com/\n`));

        console.log(bold('Build, Launch, iterate!\n'));
      });
    } catch (error) {
      console.error(red('An error occurred while cloning the repository:'), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
