/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import retry from 'async-retry';
import { Amplify } from 'aws-amplify';
import { CONNECTION_STATE_CHANGE, generateClient } from 'aws-amplify/api';
import { Hub } from 'aws-amplify/utils';

global.WebSocket = require('ws'); // MUST have this to work in NodeJS

const { AWS_REGION, GRAPH_API_KEY, GRAPH_API_URL } = process.env;

const setUpSubscription = async ({ query, resultsArray, variables }) => {
  Amplify.configure({
    API: {
      GraphQL: {
        endpoint: GRAPH_API_URL,
        region: AWS_REGION,
        defaultAuthMode: 'apiKey',
        apiKey: GRAPH_API_KEY,
      },
    },
  });
  let connectionState;
  const stopHubListener = Hub.listen('api', (data) => {
    const { payload } = data;
    if (payload.event === CONNECTION_STATE_CHANGE) {
      const { connectionState: inFlightState } = payload.data;
      console.log(inFlightState);
      connectionState = inFlightState;
    }
  });
  const client = generateClient();
  const subscription = await client
    .graphql({
      query,
      variables,
    })
    .subscribe({
      next: ({ data }) => resultsArray.push(data),
      error: (err) => console.warn(err),
    });
  await retry(
    async () => {
      expect(connectionState).toBe('Connected');
    },
    { retries: 4 },
  );
  return { subscription, stopHubListener };
};

export { setUpSubscription };
