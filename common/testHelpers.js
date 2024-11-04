import { ulid } from 'ulid';

import ProductsRepository from '../http/src/repository';

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
