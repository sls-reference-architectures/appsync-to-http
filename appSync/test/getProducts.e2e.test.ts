import axios, { AxiosRequestConfig } from 'axios';
import retry from 'async-retry';

import { ulid } from 'ulid';
import { GetProductsQuery, TestHelpers } from '../../common/testHelpers';
import { GetProductsInput } from '../../http/src/service';

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
          { query: GetProductsQuery, variables: { input } },
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

  describe('using limit', () => {
    it('should restrict result to limit', async () => {
      // ARRANGE
      const storeId = ulid();
      const { productId: id1 } = await testHelpers.createRandomProductInDb({ storeId });
      await testHelpers.createRandomProductInDb({ storeId });
      const requestOptions: AxiosRequestConfig = {
        headers: {
          'x-api-key': process.env.GRAPH_API_KEY ?? '',
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      };
      const input = { storeId, limit: 1 };

      await retry(
        async () => {
          // ACT
          const { data, status } = await axios.post(
            BaseUri,
            { query: GetProductsQuery, variables: { input } },
            requestOptions,
          );

          // ASSERT
          expect(status).toEqual(200);
          expect(data.errors).toBeUndefined();
          expect(data.data.getProducts.items).toHaveLength(1);
          expect(data.data.getProducts.items[0].productId).toEqual(id1);
        },
        { retries: 3 },
      );
    });

    it('should respect cursor with limit', async () => {
      // ARRANGE
      const storeId = ulid();
      await testHelpers.createRandomProductInDb({ storeId });
      const { productId: id2 } = await testHelpers.createRandomProductInDb({ storeId });
      const requestOptions: AxiosRequestConfig = {
        headers: {
          'x-api-key': process.env.GRAPH_API_KEY ?? '',
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      };
      const input: GetProductsInput = { storeId, limit: 1 };

      await retry(
        async () => {
          const {
            data: {
              data: {
                getProducts: { cursor },
              },
            },
          } = await axios.post(
            BaseUri,
            { query: GetProductsQuery, variables: { input } },
            requestOptions,
          );
          input.cursor = cursor;

          // ACT
          const { data, status } = await axios.post(
            BaseUri,
            { query: GetProductsQuery, variables: { input } },
            requestOptions,
          );

          // ASSERT
          expect(status).toEqual(200);
          expect(data.errors).toBeUndefined();
          expect(data.data.getProducts.items).toHaveLength(1);
          expect(data.data.getProducts.items[0].productId).toEqual(id2);
        },
        { retries: 3 },
      );
    });
  });
});
