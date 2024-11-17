/* eslint-disable import/no-extraneous-dependencies */
import { ulid } from 'ulid';
import axios from 'axios';

import ProductsRepository from '../http/src/repository';

export const createTestId = () => `test_${ulid()}`;

export const createRandomProduct = () => ({
  metadata: {
    createdBy: `user_${ulid()}`,
    sourceId: ulid(),
  },
  name: `nifty-product-${ulid()}`,
  price: 42,
  productId: ulid(),
  storeId: ulid(),
});

export const createRandomCreateProductInput = () => ({
  metadata: {
    createdBy: `user_${ulid()}`,
    sourceId: ulid(),
  },
  name: `nifty-product-${ulid()}`,
  price: 42,
  storeId: ulid(),
});

export class TestHelpers {
  constructor() {
    this.repo = new ProductsRepository();
    this.createdProducts = [];
  }

  async createRandomProductInDb(overrideWith) {
    let product = createRandomProduct();
    if (overrideWith) {
      product = { ...product, ...overrideWith };
    }
    await this.repo.saveProduct(product);
    this.createdProducts.push(product);

    return product;
  }

  async createRandomProductGql(overrideWith) {
    const createProductInput = { ...createRandomCreateProductInput(), ...overrideWith };
    const requestOptions = {
      headers: {
        'x-api-key': process.env.GRAPH_API_KEY,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    };
    const { data, status } = await axios.post(
      process.env.GRAPH_API_URL,
      { query: CreateProductMutation, variables: { input: createProductInput } },
      requestOptions,
    );
    expect(status).toEqual(200);
    expect(data.errors).toBeUndefined();
    const { productId } = data.data.createProduct;
    const product = { ...createProductInput, productId };
    this.trackProductForTeardown(product);

    return product;
  }

  async teardown() {
    await Promise.all(this.createdProducts.map(async (p) => this.repo.deleteProduct(p)));
  }

  trackProductForTeardown(product) {
    this.createdProducts.push(product);
  }
}

export const GetProductQuery = /* GraphQL */ `
  query getProduct($input: GetProductInput!) {
    getProduct(input: $input) {
      name
      price
      productId
      storeId
    }
  }
`;

export const GetProductInternalQuery = /* GraphQL */ `
  query getProductInternal($input: GetProductInput!) {
    getProductInternal(input: $input) {
      metadata {
        createdBy
        sourceId
      }
      name
      price
      productId
      storeId
    }
  }
`;

export const GetProductV2Query = /* GraphQL */ `
  query getProductV2($input: GetProductInput!) {
    getProductV2(input: $input) {
      name
      cost
      productId
      storeId
    }
  }
`;

export const GetProductsQuery = /* GraphQL */ `
  query getProducts($input: GetProductsInput!) {
    getProducts(input: $input) {
      items {
        name
        price
        productId
        storeId
      }
      cursor
    }
  }
`;

export const CreateProductMutation = /* GraphQL */ `
  mutation createProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      productId
    }
  }
`;

export const OnProductCreatedSubscription = /* GraphQL */ `
  subscription onProductCreated($storeId: String!) {
    onProductCreated(storeId: $storeId) {
      metadata {
        createdBy
        sourceId
      }
      name
      price
      productId
      storeId
    }
  }
`;
