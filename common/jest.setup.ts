/* eslint-disable-next-line */
import { CloudFormationClient, DescribeStacksCommand, Stack } from '@aws-sdk/client-cloudformation';

const region = process.env.AWS_REGION || 'us-east-1';
const stage = process.env.STAGE || 'dev';

const setup = async (): Promise<void> => {
  process.env.AWS_REGION = region;
  process.env.STAGE = stage;
  process.env.TABLE_NAME = 'appsync-to-http-products';
  const stackName = 'appsync-to-http-dev';
  const stack = await getStack(stackName);
  process.env.HTTP_API_URL = getApiUrl(stack);
};

const getApiUrl = (stack: Stack): string | undefined => stack.Outputs?.find((o) => o.OutputKey === 'HttpApiUrl')?.OutputValue;

const getStack = async (stackName: string): Promise<Stack> => {
  const cf = new CloudFormationClient({ region });
  const stackResult = await cf.send(
    new DescribeStacksCommand({
      StackName: stackName,
    }),
  );
  const stack = stackResult.Stacks?.[0];
  if (!stack) {
    throw new Error(`Could not find CF stack with name ${stackName}`);
  }

  return stack;
};

export default setup;
