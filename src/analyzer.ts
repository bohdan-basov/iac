import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import {
  CallExpression,
  isIdentifier,
  isImportSpecifier,
  isObjectExpression,
} from '@babel/types';

import { LIB_NAME } from './const';
import { convert } from './utils';
import { Resource } from './cf-generator';

interface State {
  localName: string;
  resourceName: Resource['resourceName'];
  resources: Resource[];
}

const findResourcesFunctionCall = {
  CallExpression(
    path: NodePath<CallExpression>,
    { localName, resourceName, resources }: State,
  ) {
    const { node: calle } = path.get('callee');

    if (!isIdentifier(calle) || calle.name !== localName) {
      return;
    }

    const [firstAgrument] = path.get('arguments');

    if (!firstAgrument || !isObjectExpression(firstAgrument.node)) {
      throw new Error('No argument or incorrect type');
    }

    // TODO: use zod or similar to validate and typeguard
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = convert(firstAgrument.node);

    resources.push({ resourceName, options });
  },
};

export async function analyze(source: string, filename: string) {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['typescript'],
    sourceFilename: filename,
  });

  const resources: State['resources'] = [];

  traverse(ast, {
    ImportDeclaration(path) {
      if (path.node.source.value !== LIB_NAME) {
        return;
      }

      const specifiers = path.get('specifiers');

      specifiers.forEach(({ node }) => {
        if (isImportSpecifier(node) && isIdentifier(node.imported)) {
          const state: State = {
            localName: node.local.name,
            // TODO: add validation
            resourceName: node.imported.name as Resource['resourceName'],
            resources,
          };
          path.scope.traverse(path.parent, findResourcesFunctionCall, state);
        }
      });
    },
  });

  return resources;
}
