import { Plugin } from 'esbuild';
import { mkdir, readFile, writeFile } from 'fs/promises';

import { LIB_NAME } from './const';
import { State, analyze } from './code-analyzer';
import { generateCF } from './generator';
import path from 'path';

export function esbuildPlugin(): Plugin {
  return {
    name: 'test', // TODO: Rename
    setup(build) {
      let blueprint: State;

      build.onResolve(
        { filter: new RegExp(LIB_NAME) },
        async ({ importer: importerPath }) => {
          const importerContent = await readFile(importerPath, {
            encoding: 'utf-8',
          });

          blueprint = await analyze(importerContent, importerPath);

          return null;
        },
      );

      build.onEnd(async ({ outputFiles }) => {
        if (!outputFiles) {
          throw new Error('No output files');
        }

        const [outputFile] = outputFiles;

        if (!outputFile) {
          throw new Error('No output file');
        }

        const template = await generateCF(blueprint, {
          code: outputFile.text,
        });

        await mkdir(path.dirname(outputFile.path), { recursive: true });

        await writeFile(
          path.resolve(path.dirname(outputFile.path), 'template.json'),
          JSON.stringify(template, null, 2),
        );
      });
    },
  };
}
