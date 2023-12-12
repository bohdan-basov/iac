import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

import { LIB_NAME } from '../const';

import { getHandle, getOptions, getReferences, Reference } from './utils';

type State = {
  createdResources: {
    name: string;
    options: unknown[];
    handle: string | null;
    references: Reference[];
  }[];
};

export async function analyze(source: string, filename: string) {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['typescript'],
    sourceFilename: filename,
  });

  const state: State = {
    createdResources: [],
  };

  traverse(ast, {
    Program(program) {
      program.traverse({
        CallExpression(callExpression) {
          const callee = callExpression.get('callee');
          const callExpressionArguments = callExpression.get('arguments');
          const parent = callExpression.parent;
          if (
            callee.isIdentifier() &&
            callee.referencesImport(LIB_NAME, callee.node.name)
          ) {
            //
            const name = callee.node.name;
            const options = getOptions(callExpressionArguments);
            const handle = getHandle(parent);
            const references = handle && getReferences(callee, handle);

            state.createdResources.push({
              name,
              options,
              handle,
              references: references || [],
            });
          }
        },
      });
    },
  });

  return state;
}
