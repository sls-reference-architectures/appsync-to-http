import retry from 'async-retry';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import aws4Interceptor from 'aws4-axios';

import { TestHelpers } from '../../common/testHelpers';

const BaseUri = process.env.GRAPH_API_URL ?? '';

describe.skip('When querying for Product', () => {
  const testHelpers = new TestHelpers();
  const axiosInstance = axios.create();

  afterAll(async () => {
    await testHelpers.teardown();
  });

  describe('from the internal-only endpoint', () => {
    it('should return the Product', async () => {
      // ARRANGE
      const { productId, storeId, name } = await testHelpers.createRandomProductInDb();
      const requestOptions: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      };
      const interceptor = aws4Interceptor({
        region: process.env.AWS_REGION,
        service: 'appsync',
      });
      axiosInstance.interceptors.request.use(interceptor);
      const input = { productId, storeId };
      const payload = { query: 'use query from test helpers', variables: { input } };
      console.log(payload);

      await retry(
        async () => {
          // ACT
          const { status, data }: AxiosResponse = await axiosInstance.post(
            BaseUri,
            payload,
            requestOptions,
          );
          console.log(status);
          console.log(JSON.stringify(data, null, 2));

          // ASSERT
          expect(status).toEqual(200);
          expect(data.errors).toBeUndefined();
          expect(data.data.getProductJSInternal.name).toEqual(name);
        },
        { retries: 3 },
      );
      expect(true).toBeTrue();
    });
  });
});
