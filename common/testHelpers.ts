import { ulid } from 'ulid';

import { Product } from '../http/src/models';
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
  private repo: ProductsRepository;

  private createdProducts: Product[];

  constructor() {
    this.repo = new ProductsRepository();
    this.createdProducts = [];
  }

  async createRandomProductInDb(overrideWith?: Partial<Product>): Promise<Product> {
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

  trackProductForTeardown(product: Product) {
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

export const GetProductJSQuery = /* GraphQL */ `
  query getProductJS($input: GetProductInput!) {
    getProduct(input: $input) {
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
