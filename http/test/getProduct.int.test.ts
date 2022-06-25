import retry from 'async-retry';

import * as service from '../src/service';
import { TestHelpers } from '../../common/testHelpers';

const testHelpers = new TestHelpers();

describe('When invoking service getProduct()', () => {
  afterAll(async () => {
    await testHelpers.teardown();
  });

  it('should return Product', async () => {
    // ARRANGE
    const testProduct = await testHelpers.createRandomProductInDb();

    await retry(
      async () => {
        // ACT
        const result = await service.getProduct({
          productId: testProduct.productId,
          storeId: testProduct.storeId,
        });

        // ASSERT
        expect(result.name).toEqual(testProduct.name);
      },
      { retries: 3 },
    );
  });
});
