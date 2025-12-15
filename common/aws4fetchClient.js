import { AwsClient } from 'aws4fetch';

let aws4fetchAppSyncClientInstance;

const getAws4fetchAppSyncClient = () => {
  if (aws4fetchAppSyncClientInstance) {
    return aws4fetchAppSyncClientInstance;
  }

  aws4fetchAppSyncClientInstance = new AwsClient({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
    region: process.env.AWS_REGION,
    retries: 4,
    service: 'appsync',
  });

  return aws4fetchAppSyncClientInstance;
};

export { getAws4fetchAppSyncClient };
