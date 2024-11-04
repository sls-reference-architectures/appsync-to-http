import Logger from '@dazn/lambda-powertools-logger';
import { ulid } from 'ulid';

import ProductsRepository from './repository';

const repo = new ProductsRepository();

export const getProduct = async (input) => {
  Logger.debug('In service.getProduct()', { input });
  const product = await repo.getProduct(input);

  return product;
};

export const createProduct = async (input) => {
  const id = ulid();
  await repo.saveProduct({ ...input, productId: id });

  return id;
};

export const getProducts = async (input) => {
  Logger.debug('In service.getProducts()', { input });

  return repo.getProducts(input);
};

export const parseLimit = (rawLimit) => {
  if (rawLimit === undefined) {
    return undefined;
  }

  return +rawLimit;
};
