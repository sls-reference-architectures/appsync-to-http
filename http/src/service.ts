import Logger from '@dazn/lambda-powertools-logger';
import { ulid } from 'ulid';

import { Product } from './models';
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

export interface GetProductInput {
  productId: string;
  storeId: string;
}

export type CreateProductInput = Product
