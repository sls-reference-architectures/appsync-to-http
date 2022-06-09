import Logger from '@dazn/lambda-powertools-logger';

import { Product } from './models';

export const getProduct = async (input: GetProductInput): Promise<Product> => {
  Logger.debug('In service.getProduct()', { input });
  const defaultProduct: Product = {
    id: 'x',
    name: 'placeholder',
    price: 0.42,
  };
  
  return defaultProduct;
};

interface GetProductInput {
  productId: string;
  storeId: string;
}