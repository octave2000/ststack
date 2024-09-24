#!/usr/bin/env node

import { Command } from "commander";
import inquirer from "inquirer";
import {
  initiateNestjs,
  initiateNextjs,
  initiateReactApp,
} from "./core/installFramework";
import { checkPackageManager } from "./helpers/checkPackageManager";
import path from "path";
import { isDirValid } from "./helpers/checkDirectory";

const program = new Command();

program
  .name("st-stack")
  .description("package.json")
  .version("0.0.5")
  .action(async () => {
    const dir = process.cwd();
    const folderName = path.basename(dir);
    const checkDirectory = await isDirValid(folderName);
    const projectName = await inquirer.prompt({
      name: "projectName",
      message:
        "input project name (avoid capital letters) or use (.) to install in current directory",
      type: "input",
      validate: (input) => {
        if (/[A-Z]/.test(input)) {
          return "Project name should not contain capital letters.";
        }

        if (input !== "." && /^[._-]/.test(input)) {
          return "Project name should not start with '.', '_', or '-'.";
        }

        if (!checkDirectory && input === ".") {
          return "Your current directory has capital letters in it ";
        }
        return true;
      },
    });

    const packageManager = await inquirer.prompt({
      name: "packageManager",
      type: "list",
      message: "choose a package manager for your project",
      choices: ["npm", "yarn", "pnpm", "bun"],
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
      addon,
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

      addon = await inquirer.prompt([
        {
          name: "orm",
          type: "rawlist",
          message: "Choose ORM",
          choices: ["none", "drizzle", "prisma"],
        },
        {
          name: "db",
          type: "rawlist",
          message: "Choose database",
          choices: ["none", "postgresql", "mysql", "sqlite"],
        },
      ]);
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
      addon = await inquirer.prompt([
        {
          name: "orm",
          type: "rawlist",
          message: "Choose ORM",
          choices: ["none", "drizzle", "prisma"],
        },
        {
          name: "db",
          type: "rawlist",
          message: "Choose database",
          choices: ["none", "postgresql", "mysql", "sqlite"],
        },
      ]);
    }

    const userSelections = {
      projectName: projectName.projectName as string,
      framework: framework.framework as string,
      packageManager: packageManager.packageManager as "npm" | "bnpm" | "bun",
      language: language?.language as string,
      styleOption: styleOption?.styleOption as string,
      eslintOption: eslintOption?.eslintOption as string,
      routeOption: routeOption?.routeOption as string,
      dirOption: dirOption?.dirOption as string,
      addon: addon,
      turboOption: turboOption?.turboOption as string,
      stateManagementOption:
        stateManagementOption?.stateManagementOption as string,
    };
    console.log(userSelections.projectName);

    if (userSelections.framework.toLocaleLowerCase().includes("next"))
      initiateNextjs({
        addEsLint: userSelections.eslintOption.toLocaleLowerCase() == "yes",
        addTailwind: userSelections.styleOption.toLocaleLowerCase() == "yes",
        addTypeScript:
          userSelections.language.toLocaleLowerCase() == "typescript",
        useAppRoute: userSelections.routeOption.toLocaleLowerCase() == "yes",
        useTurbo: userSelections.turboOption.toLocaleLowerCase() == "yes",
        useSrcDir: userSelections.dirOption.toLocaleLowerCase() == "yes",
        addZustand:
          userSelections.stateManagementOption.toLocaleLowerCase() == "yes",
        packageManager: userSelections.packageManager.toLowerCase() as
          | "npm"
          | "pnpm"
          | "bun"
          | "yarn",
        projectPath: `./${userSelections.projectName}`,
        addon: { dbType: addon.db, ormType: addon.orm },
        version: "latest",
      });
    if (userSelections.framework.toLocaleLowerCase().includes("react"))
      initiateReactApp({
        addEsLint: userSelections.eslintOption.toLocaleLowerCase() == "yes",
        addTailwind: userSelections.styleOption.toLocaleLowerCase() == "yes",
        addTypeScript:
          userSelections.language.toLocaleLowerCase() == "typescript",
        addZustand:
          userSelections.stateManagementOption.toLocaleLowerCase() == "yes",
        packageManager: userSelections.packageManager.toLowerCase() as
          | "npm"
          | "pnpm"
          | "bun"
          | "yarn",
        projectPath: `./${userSelections.projectName}`,
        version: "latest",
      });
    if (userSelections.framework.toLocaleLowerCase().includes("nest"))
      initiateNestjs({
        addTypeScript:
          userSelections.language.toLocaleLowerCase() == "typescript",
        projectPath: `./${userSelections.projectName}`,
        version: "latest",
        packageManager: userSelections.packageManager.toLowerCase() as
          | "npm"
          | "pnpm"
          | "bun"
          | "yarn",
        useSrcDir: true,
        addon: {
          dbType: addon.db,
          ormType: addon.orm,
        },
      });
  });

program.parse();
