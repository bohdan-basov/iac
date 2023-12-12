import { build as esbuild } from 'esbuild';
import { esbuildPlugin } from './plugin';

export async function build(base: string, outdir: string) {
  await esbuild({
    entryPoints: [base],
    outdir: outdir,
    platform: 'node',
    bundle: true,
    packages: 'external',
    write: false,
    plugins: [esbuildPlugin()],
  });
}
