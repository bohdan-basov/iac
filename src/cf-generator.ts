import { Stack, App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';

import { toPascalCase } from './utils';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';

interface Context {
  code: string;
}

type LambdaHandler = {
  handles: string[];
  localName: string;
  resourceName: 'lambdaHandler';
  options: { name: string };
};

type S3Bucket = {
  handles: string[];
  localName: string;
  resourceName: 's3Bucket';
  options: {
    name: string;
  };
};
type DynamoDb = {
  handles: string[];
  localName: string;
  resourceName: 'dynamoDbTable';
  options: {
    name: string;
    partitionKey: {
      name: string;
      type: 'BINARY' | 'NUMBER' | 'STRING';
    };
  };
};

type Resource = LambdaHandler | S3Bucket | DynamoDb;

export async function generateCF(resources: Resource[], context: Context) {
  const app = new App();
  const stack = new Stack(app);

  resources.forEach(addCFResources(stack, context));

  const { Resources } = Template.fromStack(stack).toJSON();

  return { Resources };
}

const resourceMap = {
  lambdaHandler(stack: Stack, { options }: LambdaHandler, context: Context) {
    const lambda = new Function(stack, toPascalCase(options.name), {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromInline(context.code),
    });

    return lambda;
  },
  s3Bucket(stack: Stack, { options: { name } }: S3Bucket) {
    return new Bucket(stack, toPascalCase(name), {});
  },
  dynamoDbTable(stack: Stack, { options }: DynamoDb) {
    const table = new Table(stack, toPascalCase(options.name), {
      partitionKey: {
        name: options.partitionKey.name,
        type: AttributeType[options.partitionKey.type],
      },
      tableName: options.name,
    });

    return table;
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
    if (resource.resourceName === 'dynamoDbTable') {
      return resourceMap.dynamoDbTable(stack, resource);
    }

    throw new Error('Unsupported type');
  };
}
