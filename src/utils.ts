import {
  Node,
  isIdentifier,
  isObjectExpression,
  isObjectProperty,
  isStringLiteral,
} from '@babel/types';

export function convert(path: Node): unknown {
  if (isObjectExpression(path)) {
    const object: { [key: string]: unknown } = {};

    path.properties.forEach((property) => {
      if (isObjectProperty(property) && isIdentifier(property.key)) {
        object[property.key.name] = convert(property.value);
      }
    });

    return object;
  }

  if (isStringLiteral(path)) {
    return path.value;
  }

  // Handle other value types as needed (e.g., numbers, booleans, etc.)
  throw new Error('Not supported type');
}
