import { build as esbuild } from "esbuild";

export async function build(base: string, outdir: string) {
  await esbuild({
    entryPoints: [base],
    outdir: outdir,
    platform: "node",
    bundle: true,
  });
}
