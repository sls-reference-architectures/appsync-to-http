import axios from 'axios';
import aws4Interceptor from 'aws4-axios';
import Logger from '@dazn/lambda-powertools-logger';

const echo = async (event) => {
  Logger.debug('In echo()', { event });

  return event;
};

const onProductCreated = async (event) => {
  Logger.debug('In onProductCreated()', { event });
  const { data: product } = event.detail;
  const { data, errors, headers, status } = await executeSignedQuery({
    query: NotifyProductCreatedMutation,
    url: process.env.GRAPH_API_URL,
    variables: { input: product },
  });
  Logger.debug('Executed signed query', { data, errors, headers, status }); // Temporary --SRO
  if (errors) {
    Logger.debug('Error executing dummy query', { errors });
    Logger.debug('Headers', { headers });
    // throw new Error('Error executing dummy query');
  }
};

const NotifyProductCreatedMutation = /* GraphQL */ `
  mutation NotifyProductCreated($input: NotifyProductCreatedInput!) {
    notifyProductCreated(input: $input) {
      metadata {
        createdBy
        sourceId
      }
      name
      price
      productId
      storeId
    }
  }
`;

const executeSignedQuery = async ({ query, url, variables }) => {
  const axiosInstance = axios.create();
  const interceptor = aws4Interceptor({
    options: {
      region: process.env.AWS_REGION,
      service: 'appsync',
    },
  });
  axiosInstance.interceptors.request.use(interceptor);
  const { data, errors, headers, status } = await axiosInstance.post(
    url,
    { query, variables },
    { headers: { 'Content-Type': 'application/json' } },
  );

  return { data, errors, headers, status };
};

export { echo, onProductCreated };
