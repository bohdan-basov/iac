import { Plugin } from 'esbuild';
import { readFile } from 'fs/promises';
import { analyze } from './analyzer';

import { LIB_NAME } from './const';

export function esbuildPlugin(): Plugin {
  return {
    name: 'test', // TODO: Rename
    setup(build) {
      build.onResolve(
        { filter: new RegExp(LIB_NAME) },
        async ({ importer: importerPath }) => {
          const importerContent = await readFile(importerPath, {
            encoding: 'utf-8',
          });

          await analyze(importerContent, importerPath);

          return null;
        },
      );
    },
  };
}
