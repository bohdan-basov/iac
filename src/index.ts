import { cwd } from "process";
import { join } from "path";
import { build } from "esbuild";

await build({
  entryPoints: [join(cwd(), "project", "index.ts")],
  outdir: join(cwd(), "project", "out"),
  format: "esm",
  platform: "node",
  bundle: true,
});
