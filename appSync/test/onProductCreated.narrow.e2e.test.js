/* eslint-disable import/no-extraneous-dependencies */
import retry from 'async-retry';

import {
  createRandomProduct,
  createTestId,
  OnProductCreatedSubscription,
  TestHelpers,
} from '../../common/testHelpers';
import { setUpSubscription } from './graphqlTestHelpers';
import { onProductCreated } from '../src/handlers';

const testHelpers = new TestHelpers();

describe('When the onProductCreated handler is invoked', () => {
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
    const product = createRandomProduct({ storeId });

    // ACT
    await onProductCreated({ detail: { data: product } });

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
