import { Stack, App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { camelCase, upperFirst } from 'lodash';

import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';

interface Context {
  code: string;
}

interface LambdaHandler {
  resourceName: 'lambdaHandler';
  options: { name: string };
}

interface S3Bucket {
  resourceName: 's3Bucket';
  options: {
    name: string;
  };
}

export type Resource = LambdaHandler | S3Bucket;

export async function generateCF(resources: Resource[], context: Context) {
  const app = new App();
  const stack = new Stack(app);

  resources.forEach(addCFResources(stack, context));

  const { Resources } = Template.fromStack(stack).toJSON();

  return { Resources };
}

const resourceMap = {
  lambdaHandler(stack: Stack, { options }: LambdaHandler, context: Context) {
    return new Function(stack, upperFirst(camelCase(options.name)), {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromInline(context.code),
    });
  },
  s3Bucket(stack: Stack, { options: { name } }: S3Bucket) {
    return new Bucket(stack, upperFirst(camelCase(name)), {});
  },
};

function addCFResources(stack: Stack, context: Context) {
  return (resource: Resource) => {
    if (resource.resourceName === 'lambdaHandler') {
      return resourceMap.lambdaHandler(stack, resource, context);
    }
    if (resource.resourceName === 's3Bucket') {
      return resourceMap.s3Bucket(stack, resource);
    }

    throw new Error('Unsupported type');
  };
}
