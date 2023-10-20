import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import aws4Interceptor from 'aws4-axios';
import retry from 'async-retry';

import { TestHelpers } from '../../common/testHelpers';
import { Product } from '../src/models';

const testHelpers = new TestHelpers();

describe('When getting product', () => {
  afterAll(async () => {
    await testHelpers.teardown();
  });

  it('should return the product', async () => {
    // ARRANGE
    const product = await testHelpers.createRandomProductInDb();
    const route = `/products/${product.productId}`;
    const options: AxiosRequestConfig = {
      baseURL: process.env.HTTP_API_URL,
      headers: {
        'x-custom-store-id': product.storeId,
      },
      validateStatus: () => true,
    };
    const interceptor = aws4Interceptor({
      options: {
        region: process.env.AWS_REGION,
        service: 'execute-api',
      },
    });
    axios.interceptors.request.use(interceptor);

    await retry(
      async () => {
        // ACT
        const { status, data }: AxiosResponse<Product> = await axios.get(route, options);

        // ASSERT
        expect(status).toEqual(200);
        expect(data.name).toEqual(product.name);
      },
      { retries: 3 },
    );
  });
});
