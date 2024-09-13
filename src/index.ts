#!/usr/bin/env node

import { Command } from "commander";
import inquirer from "inquirer";

const program = new Command();

program
  .name("st-stack")
  .description("package.json")
  .version("0.0.5")
  .action(async () => {
    const packages = await inquirer.prompt({
      name: "package",
      type: "list",
      message: "choose prefered package",
      choices: ["yarn", "npm"],
    });

    if (packages.package === "yarn") {
      const framework = inquirer.prompt({
        name: "framework",
        type: "list",
        message: "choose prefered package",
        choices: ["sadas", "nsasdsd"],
      });
    } else {
      console.log(packages.package);
    }
  });

program.parse();
