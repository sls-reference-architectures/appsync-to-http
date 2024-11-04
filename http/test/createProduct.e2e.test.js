import aws4Interceptor from 'aws4-axios';
import axios from 'axios';
import retry from 'async-retry';

import { createRandomProduct, TestHelpers } from '../../common/testHelpers';

describe('When creating a product', () => {
  const testHelpers = new TestHelpers();

  afterAll(async () => {
    await testHelpers.teardown();
  });

  it('should return 201 and the new id', async () => {
    // ARRANGE
    const newProduct = createRandomProduct();
    const route = '/products';
    const options = {
      baseURL: process.env.HTTP_API_URL,
      headers: {
        'x-custom-store-id': newProduct.storeId,
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

    await retry(async () => {
      // ACT
      const { status, data } = await axios.post(route, newProduct, options);

      // ASSERT
      expect(status).toEqual(201);
      expect(data.productId).toBeString();
      expect(data.productId).not.toEqual(newProduct.productId);
    });
  });
});
