import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import aws4Interceptor from 'aws4-axios';
import retry from 'async-retry';

import { ulid } from 'ulid';
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

  describe('with no items in the database', () => {
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

  describe('when using limit', () => {
    it('should restrict result to limit', async () => {
      // ARRANGE
      const storeId = ulid();
      const { productId: id1 } = await testHelpers.createRandomProductInDb({ storeId });
      await testHelpers.createRandomProductInDb({ storeId });
      const route = '/products';
      const options: AxiosRequestConfig = {
        baseURL: process.env.HTTP_API_URL,
        headers: {
          'x-custom-store-id': storeId,
        },
        params: {
          limit: 1,
        },
        validateStatus: () => true,
      };

      await retry(
        async () => {
          // ACT
          const { status, data: pageResult }: AxiosResponse<PageResult<Product>> = await axios.get(
            route,
            options,
          );

          // ASSERT
          expect(status).toEqual(200);
          expect(pageResult.items).toHaveLength(1);
          expect(pageResult.items[0].productId).toEqual(id1);
        },
        { retries: 3 },
      );
    });

    it('should respect cursor', async () => {
      // ARRANGE
      const storeId = ulid();
      await testHelpers.createRandomProductInDb({ storeId });
      const { productId: id2 } = await testHelpers.createRandomProductInDb({ storeId });
      const route = '/products';
      const options: AxiosRequestConfig = {
        baseURL: process.env.HTTP_API_URL,
        headers: {
          'x-custom-store-id': storeId,
        },
        params: {
          limit: 1,
        },
        validateStatus: () => true,
      };

      await retry(
        async () => {
          const {
            data: { cursor },
          }: AxiosResponse<PageResult<Product>> = await axios.get(route, options);
          options.params!.cursor = cursor!;

          // ACT
          const { status, data: pageResult }: AxiosResponse<PageResult<Product>> = await axios.get(
            route,
            options,
          );

          // ASSERT
          expect(status).toEqual(200);
          expect(pageResult.items).toHaveLength(1);
          expect(pageResult.items[0].productId).toEqual(id2);
        },
        { retries: 3 },
      );
    });
  });
});
