import axios, { AxiosRequestConfig } from 'axios';
import retry from 'async-retry';

import {
  CreateProductMutation,
  createRandomCreateProductInput,
  GetProductQuery,
  TestHelpers,
} from '../../common/testHelpers';

const BaseUri = process.env.GRAPH_API_URL ?? '';

describe('When creating a Product', () => {
  const testHelpers = new TestHelpers();

  afterAll(async () => {
    await testHelpers.teardown();
  });

  it('should return the new id', async () => {
    // ARRANGE
    const input = createRandomCreateProductInput();
    const requestOptions: AxiosRequestConfig = {
      headers: {
        'x-api-key': process.env.GRAPH_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    };

    // ACT
    const { data, status } = await axios.post(
      BaseUri,
      { query: CreateProductMutation, variables: { input } },
      requestOptions,
    );

    // ASSERT
    expect(status).toEqual(200);
    expect(data.errors).toBeUndefined();
    expect(data.data.createProduct.productId).toBeString();
  });

  it('should be queryable', async () => {
    // ARRANGE
    const input = createRandomCreateProductInput();
    const requestOptions: AxiosRequestConfig = {
      headers: {
        'x-api-key': process.env.GRAPH_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    };

    // ACT
    const { data, status } = await axios.post(
      BaseUri,
      { query: CreateProductMutation, variables: { input } },
      requestOptions,
    );

    // ASSERT
    expect(status).toEqual(200);
    expect(data.errors).toBeUndefined();
    const {
      data: {
        createProduct: { productId },
      },
    } = data;
    const getProductInput = { productId, storeId: input.storeId };
    await retry(
      async () => {
        const getResult = await axios.post(
          BaseUri,
          { query: GetProductQuery, variables: { input: getProductInput } },
          requestOptions,
        );
        expect(getResult.status).toEqual(200);
        expect(getResult.data.errors).toBeUndefined();
        expect(getResult.data.data.getProduct.name).toEqual(input.name);
      },
      { retries: 3 },
    );
  });
});
