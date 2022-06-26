import axios, { AxiosRequestConfig } from 'axios';
import retry from 'async-retry';

import { GetProductQuery, TestHelpers } from '../../common/testHelpers';

const BaseUri = process.env.GRAPH_API_URL ?? '';

describe('When querying for Products', () => {
  const testHelpers = new TestHelpers();

  afterAll(async () => {
    await testHelpers.teardown();
  });

  it('should return a page result', async () => {
    // ARRANGE
    const requestOptions: AxiosRequestConfig = {
      headers: {
        'x-api-key': process.env.GRAPH_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    };
    const input = { storeId: 'x' };

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
        expect(data.data.getProducts.items).toBeArray();
      },
      { retries: 3 },
    );
  });
});
