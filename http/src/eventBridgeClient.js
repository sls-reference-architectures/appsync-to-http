import { EventBridgeClient } from '@aws-sdk/client-eventbridge';

const ebOptions = {
  region: process.env.AWS_REGION,
};

let client;

const getEventBridgeClient = (config = ebOptions) => {
  if (!client) {
    client = new EventBridgeClient(config);
  }
  return client;
};

export default getEventBridgeClient;
