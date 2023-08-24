#!/usr/bin/env node
import { join } from "path";
import { argv, cwd } from "process";
import { program } from "commander";

import { build } from "./build";

program
  .command("build")
  .argument("[baseUrl]", "Project location", join(cwd(), "src", "index.ts"))
  .option("--outdir <value>", "Output location", join(cwd(), "out"))
  .action(async (baseUrl: string, options: { outdir: string }) => {
    await build(baseUrl, options.outdir);
  });

program.parseAsync(argv);
