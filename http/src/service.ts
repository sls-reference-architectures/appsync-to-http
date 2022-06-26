import Logger from '@dazn/lambda-powertools-logger';
import { ulid } from 'ulid';

import { PageResult, Product } from './models';
import ProductsRepository from './repository';

const repo = new ProductsRepository();

export const getProduct = async (input: GetProductInput): Promise<Product> => {
  Logger.debug('In service.getProduct()', { input });
  const product = await repo.getProduct(input);

  return product;
};

export const createProduct = async (input: CreateProductInput) => {
  const id = ulid();
  await repo.saveProduct({ ...input, productId: id });

  return id;
};

export const getProducts = async (input: GetProductsInput): Promise<PageResult<Product>> => {
  Logger.debug('In service.getProducts()', { input });

  return repo.getProducts(input);
};

export const parseLimit = (rawLimit: string | undefined): number | undefined => {
  if (rawLimit === undefined) {
    return undefined;
  }

  return +rawLimit;
};

export interface GetProductInput {
  productId: string;
  storeId: string;
}

export type CreateProductInput = Product;

export interface GetProductsInput {
  storeId: string;
  limit?: number;
  cursor?: string;
}
