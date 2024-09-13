#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program.name("st-stack").description("package.json").version("0.0.5");

program.command("hi").action(async () => {
  console.log("done");
});
