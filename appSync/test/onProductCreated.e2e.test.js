/* eslint-disable import/no-extraneous-dependencies */
import { Amplify } from 'aws-amplify';
import { CONNECTION_STATE_CHANGE, generateClient } from 'aws-amplify/api';
import { Hub } from 'aws-amplify/utils';
import retry from 'async-retry';

import { createTestId, OnProductCreatedSubscription, TestHelpers } from '../../common/testHelpers';

const testHelpers = new TestHelpers();

describe('When a Product is created', () => {
  let subscription;
  let stopHubListener;

  beforeAll(async () => {
    Amplify.configure({
      API: {
        GraphQL: {
          endpoint: process.env.GRAPH_API_URL,
          region: process.env.AWS_REGION,
          defaultAuthMode: 'apiKey',
          apiKey: process.env.GRAPH_API_KEY,
        },
      },
    });
  });

  afterAll(async () => {
    await stopHubListener();
    await subscription.unsubscribe();
    await testHelpers.teardown();
  });

  it('should fire the onProductCreated subscription', async () => {
    // ARRANGE
    const messages = [];
    const storeId = createTestId();
    ({ subscription, stopHubListener } = await setUpSubscription({
      query: OnProductCreatedSubscription,
      storeId,
      resultsArray: messages,
    }));

    // ACT
    const product = await testHelpers.createRandomProductGql({ storeId });

    // ASSERT
    await retry(
      async () => {
        expect(messages.length).toBe(1);
        expect(messages[0].onProductCreated.productId).toBe(product.productId);
      },
      { retries: 5 },
    );
  });
});

const setUpSubscription = async ({ query, storeId, resultsArray }) => {
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
      variables: { storeId },
    })
    .subscribe({
      next: ({ data }) => resultsArray.push(data.onJobCreated),
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
