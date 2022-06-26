import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import aws4Interceptor from 'aws4-axios';
// import retry from 'async-retry';

import { TestHelpers } from '../../common/testHelpers';
import { PageResult, Product } from '../src/models';

describe('When getting products', () => {
  const testHelpers = new TestHelpers();

  beforeAll(() => {
    const interceptor = aws4Interceptor({
      region: process.env.AWS_REGION,
      service: 'execute-api',
    });
    axios.interceptors.request.use(interceptor);
  });

  afterAll(async () => {
    await testHelpers.teardown();
  });

  it('should return 200 with page result', async () => {
    // ARRANGE
    const route = '/products';
    const options: AxiosRequestConfig = {
      baseURL: process.env.HTTP_API_URL,
      headers: {
        'x-custom-store-id': 'does-not-exist',
      },
      validateStatus: () => true,
    };

    // ACT
    const { status, data: pageResult }: AxiosResponse<PageResult<Product>> = await axios.get(
      route,
      options,
    );

    // ASSERT
    expect(status).toEqual(200);
    expect(pageResult.items).toBeArray();
    expect(pageResult.items).toBeEmpty();
  });
});
