import Logger from '@dazn/lambda-powertools-logger';

import { Product } from './models';
import ProductsRepository from './repository';

const repo = new ProductsRepository();

export const getProduct = async (input: GetProductInput): Promise<Product> => {
  Logger.debug('In service.getProduct()', { input });
  const product = await repo.getProduct(input);

  return product;
};

export const placeholder = () => {
  Logger.debug('placeholder export');
};

export interface GetProductInput {
  productId: string;
  storeId: string;
}
