#!/usr/bin/env node

import { Command } from "commander";
import inquirer from "inquirer";
import { initiateNestjs, initiateNextjs, initiateReactApp } from "./installFramework";
import { checkPackageManager } from "./helpers/checkPackageManager";

const program = new Command();

program
  .name("st-stack")
  .description("package.json")
  .version("0.0.5")
  .action(async () => {
    const projectName = await inquirer.prompt({
      name: "projectName",
      message: "input project name (avoid capital letters)",
      type: "input",
      validate: (input) => {
        if (/[A-Z]/.test(input)) {
          return "Project name should not contain capital letters.";
        }
        return true;
      },
    });

    const packageManager = await inquirer.prompt({
      name: "packageManager",
      type: "list",
      message: "choose a package manager for your project",
      choices: ["npm", "yarn", "pnpm"],
    });

    const packageExist = await checkPackageManager(
      packageManager.packageManager
    );

    const framework = await inquirer.prompt({
      name: "framework",
      type: "list",
      message: "choose your prefered framework",
      choices: ["nextjs", "nestjs", "Reactjs"],
    });

    let language,
      styleOption,
      eslintOption,
      routeOption,
      dirOption,
      turboOption,
      stateManagementOption;

    // sub frameworks conditions ---------------------------------------------------------------------------------------------------------
    if (framework.framework === "nextjs") {
      language = await inquirer.prompt({
        name: "language",
        message: "choose typescript or javascript",
        type: "rawlist",
        choices: ["typescript", "javascript"],
      });

      styleOption = await inquirer.prompt({
        name: "styleOption",
        message: "do you want tailwind ",
        type: "rawlist",
        choices: ["yes", "no"],
      });

      eslintOption = await inquirer.prompt({
        name: "eslintOption",
        message: "do you want to use eslint",
        type: "rawlist",
        choices: ["yes", "no"],
      });

      routeOption = await inquirer.prompt({
        name: "routeOption",
        message: "do you want to use app route",
        type: "rawlist",
        choices: ["yes", "no"],
      });

      dirOption = await inquirer.prompt({
        name: "dirOption",
        message: "do you want to create src directory",
        type: "rawlist",
        choices: ["yes", "no"],
      });

      turboOption = await inquirer.prompt({
        name: "turboOption",
        message: "enable turbo in development",
        type: "rawlist",
        choices: ["yes", "no"],
      });
      stateManagementOption = await inquirer.prompt({
        name: "stateManagementOption",
        message: "add state manager zustand",
        type: "rawlist",
        choices: ["yes", "no"],
      });
    }
    if (framework.framework === "Reactjs") {
      language = await inquirer.prompt({
        name: "language",
        message: "choose typescript or javascript",
        type: "rawlist",
        choices: ["typescript", "javascript"],
      });

      styleOption = await inquirer.prompt({
        name: "styleOption",
        message: "do you want tailwind ",
        type: "rawlist",
        choices: ["yes", "no"],
      });

      eslintOption = await inquirer.prompt({
        name: "eslintOption",
        message: "do you want to use eslint",
        type: "rawlist",
        choices: ["yes", "no"],
      });

      stateManagementOption = await inquirer.prompt({
        name: "stateManagementOption",
        message: "add state manager zustand",
        type: "rawlist",
        choices: ["yes", "no"],
      });
    }

    if (framework.framework === "nestjs") {
      language = await inquirer.prompt({
        name: "language",
        message: "choose typescript or javascript",
        type: "rawlist",
        choices: ["typescript", "javascript"],
      });
    }

    const userSelections = {
      projectName: projectName.projectName as string,
      framework: framework.framework as string,
      packageManager: packageManager.packageManager as string,
      language: language?.language as string,
      styleOption: styleOption?.styleOption as string,
      eslintOption: eslintOption?.eslintOption as string,
      routeOption: routeOption?.routeOption as string,
      dirOption: dirOption?.dirOption as string,
      turboOption: turboOption?.turboOption as string,
      stateManagementOption: stateManagementOption?.stateManagementOption as string,
    };
    if (userSelections.framework.toLocaleLowerCase().includes("next")) initiateNextjs({
      addEsLint: userSelections.eslintOption.toLocaleLowerCase() == "yes",
      addTailwind: userSelections.styleOption.toLocaleLowerCase() == "yes",
      addTypeScript: userSelections.language.toLocaleLowerCase() == "typescript",
      useAppRoute: userSelections.routeOption.toLocaleLowerCase() == "yes",
      useSrcDir: userSelections.dirOption.toLocaleLowerCase() == "yes",
      addZustand: userSelections.stateManagementOption.toLocaleLowerCase() == "yes",
      projectPath: `./${userSelections.projectName}`,
      version: "latest",
    });
    if (userSelections.framework.toLocaleLowerCase().includes("react")) initiateReactApp({
      addEsLint: userSelections.eslintOption.toLocaleLowerCase() == "yes",
      addTailwind: userSelections.styleOption.toLocaleLowerCase() == "yes",
      addTypeScript: userSelections.language.toLocaleLowerCase() == "typescript",
      addZustand: userSelections.stateManagementOption.toLocaleLowerCase() == "yes",
      projectPath: `./${userSelections.projectName}`,
      version: "latest",
    });
    if (userSelections.framework.toLocaleLowerCase().includes("nest")) initiateNestjs({
      addTypeScript: userSelections.language.toLocaleLowerCase() == "typescript",
      projectPath: `./${userSelections.projectName}`,
      version: "latest",
      useSrcDir: true
    });

    console.log(userSelections);
  });

program.parse();
