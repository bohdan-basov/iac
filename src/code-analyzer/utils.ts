import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';

export function getHandle(parent: t.Node): null | string {
  let handle: string | null = null;

  if (t.isVariableDeclarator(parent)) {
    const id = parent.id;

    if (t.isIdentifier(id)) {
      handle = id.name;
    }
  }

  return handle;
}

export function getOptions(callExpressionArguments: NodePath[]): unknown[] {
  return callExpressionArguments.map((argument) => argument.evaluate().value);
}

type MethodReference = {
  type: 'method';
  method: string;
  referencePath: NodePath;
  statementPath: NodePath<t.Statement>;
};

type ArgumentReference = {
  type: 'argument';
  method: string;
  referencePath: NodePath;
  statementPath: NodePath<t.Statement>;
};

type UnknownReference = {
  type: 'unknown';
  referencePath: NodePath;
  statementPath: NodePath<t.Statement>;
};

export type Reference = MethodReference | ArgumentReference | UnknownReference;

export function getReferences(callee: NodePath, handle: string): Reference[] {
  const { referencePaths } = callee.scope.getBinding(handle)!;

  return referencePaths.map((referencePath) => {
    const parent = referencePath.parent;

    if (t.isMemberExpression(parent) && t.isIdentifier(parent.property)) {
      return {
        type: 'method' as const,
        method: parent.property.name,
        referencePath,
        statementPath: referencePath.getStatementParent()!,
      };
    }
    if (
      t.isCallExpression(parent) &&
      t.isMemberExpression(parent.callee) &&
      t.isIdentifier(parent.callee.property)
    ) {
      return {
        type: 'argument' as const,
        method: parent.callee.property.name,
        referencePath,
        statementPath: referencePath.getStatementParent()!,
      };
    }

    return {
      type: 'unknown' as const,
      referencePath,
      statementPath: referencePath.getStatementParent()!,
    };
  });
}
