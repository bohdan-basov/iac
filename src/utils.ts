import { camelCase, upperFirst } from 'lodash';

export function toPascalCase(string: string) {
  return upperFirst(camelCase(string));
}
