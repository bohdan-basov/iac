import { Plugin } from 'esbuild';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { analyze } from './analyzer';

import { LIB_NAME } from './const';
import { Resource, generateCF } from './cf-generator';
import path from 'path';

export function esbuildPlugin(): Plugin {
  return {
    name: 'test', // TODO: Rename
    setup(build) {
      let resources: Resource[];

      build.onResolve(
        { filter: new RegExp(LIB_NAME) },
        async ({ importer: importerPath }) => {
          const importerContent = await readFile(importerPath, {
            encoding: 'utf-8',
          });

          resources = await analyze(importerContent, importerPath);

          return undefined;
        },
      );

      build.onEnd(async ({ outputFiles }) => {
        if (!outputFiles) {
          throw new Error('No output files');
        }

        const [file] = outputFiles;

        if (!file) {
          throw new Error('No output file');
        }

        const template = await generateCF(resources, {
          code: file.text,
        });

        await mkdir(path.dirname(file.path), { recursive: true });

        await writeFile(
          path.resolve(path.dirname(file.path), 'template.json'),
          JSON.stringify(template, null, 2),
        );
      });
    },
  };
}
