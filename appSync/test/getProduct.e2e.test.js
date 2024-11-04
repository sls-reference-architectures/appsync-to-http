import axios from 'axios';
import retry from 'async-retry';

import { GetProductQuery, TestHelpers } from '../../common/testHelpers';

const BaseUri = process.env.GRAPH_API_URL ?? '';

describe('When querying for Product', () => {
  const testHelpers = new TestHelpers();

  afterAll(async () => {
    await testHelpers.teardown();
  });

  it('should return the Product', async () => {
    // ARRANGE
    const product = await testHelpers.createRandomProductInDb();
    const requestOptions = {
      headers: {
        'x-api-key': process.env.GRAPH_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    };
    const input = { productId: product.productId, storeId: product.storeId };

    await retry(
      async () => {
        // ACT
        const { data, status } = await axios.post(
          BaseUri,
          { query: GetProductQuery, variables: { input } },
          requestOptions,
        );

        // ASSERT
        expect(status).toEqual(200);
        expect(data.errors).toBeUndefined();
        expect(data.data.getProduct.name).toEqual(product.name);
      },
      { retries: 3 },
    );
  });
});
