/* eslint-disable-next-line */
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';

const region = process.env.AWS_REGION || 'us-east-1';
const stage = process.env.STAGE || 'dev';

const setup = async () => {
  process.env.AWS_REGION = region;
  process.env.STAGE = stage;
  process.env.TABLE_NAME = 'appsyncToHttp-http-products';
  const httpStackName = 'appsyncToHttp-http-dev';
  const graphStackName = 'appsyncToHttp-gql-dev';
  const httpStack = await getStack(httpStackName);
  const graphStack = await getStack(graphStackName);
  process.env.HTTP_API_URL = getHttpApiUrl(httpStack);
  process.env.GRAPH_API_URL = getGraphApiUrl(graphStack);
  process.env.GRAPH_API_KEY = getGraphApiKey(graphStack);
};

const getHttpApiUrl = (stack) =>
  stack.Outputs?.find((o) => o.OutputKey === 'HttpApiUrl')?.OutputValue;
const getGraphApiUrl = (stack) =>
  stack.Outputs?.find((o) => o.OutputKey === 'GraphQLApiUrl')?.OutputValue;
const getGraphApiKey = (stack) =>
  stack.Outputs?.find((o) => o.OutputKey === 'GraphQLApiKey')?.OutputValue;

const getStack = async (stackName) => {
  const cf = new CloudFormationClient({ region });
  const stackResult = await cf.send(
    new DescribeStacksCommand({
      StackName: stackName,
    }),
  );
  const stack = stackResult.Stacks?.[0];
  if (!stack) {
    throw new Error(`Could not find CFN stack with name ${stackName}`);
  }

  return stack;
};

export default setup;
