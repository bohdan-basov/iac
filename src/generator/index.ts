import {
  __LambdaFunction,
  __S3Bucket,
  Context,
  App,
  Stack,
  Template,
} from '@simple-cloud/aws';

import { State } from '../code-analyzer';

export async function generateCF(state: State, context: Context) {
  const app = new App();
  const stack = new Stack(app);

  state.createdResources.forEach(addCFResources(stack, context));

  const { Resources } = Template.fromStack(stack).toJSON();

  return { Resources };
}

function addCFResources(stack: Stack, context: Context) {
  return (resource: State['createdResources'][number]) => {
    if (resource.name === __LambdaFunction.name) {
      return new __LambdaFunction(resource.options).preflight(stack, context);
    }
    if (resource.name === 's3Bucket') {
      const s3Bucket = new __S3Bucket(resource.options).preflight(stack);

      resource.references.forEach((reference) => {
        if (reference.type === 'method' && reference.method === 'grantRead') {
          // s3Bucket.grantRead();
        }
      });

      return s3Bucket;
    }

    throw new Error('Unsupported type');
  };
}
