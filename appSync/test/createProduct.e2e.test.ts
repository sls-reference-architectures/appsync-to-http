import axios, { AxiosRequestConfig } from 'axios';

import {
  CreateProductMutation,
  createRandomCreateProductInput,
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
    expect(data.data.createProduct).toBeString();
  });
});
