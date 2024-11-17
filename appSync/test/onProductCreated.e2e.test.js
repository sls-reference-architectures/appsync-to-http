/* eslint-disable import/no-extraneous-dependencies */
import retry from 'async-retry';

import { createTestId, OnProductCreatedSubscription, TestHelpers } from '../../common/testHelpers';
import { setUpSubscription } from './graphqlTestHelpers';

const testHelpers = new TestHelpers();

describe('When a Product is created', () => {
  let subscription;
  let stopHubListener;

  afterAll(async () => {
    await subscription.unsubscribe();
    await stopHubListener();
    await testHelpers.teardown();
  });

  it('should fire the onProductCreated subscription', async () => {
    // ARRANGE
    const messages = [];
    const storeId = createTestId();
    ({ subscription, stopHubListener } = await setUpSubscription({
      query: OnProductCreatedSubscription,
      variables: { storeId },
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
      { retries: 4 },
    );
  });
});
