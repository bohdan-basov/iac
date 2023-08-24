#!/usr/bin/env node

import { argv } from "process";
import { program } from "commander";

program
  .command("build")
  .argument("path")
  .option("--outdir <value>")
  .action((args, options) => {
    console.log(args, options);
  });

program.parseAsync(argv);
