import Logger from '@dazn/lambda-powertools-logger';
// import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import { APIGatewayProxyEventMiddyNormalized, Product } from './models';

import * as service from './service';

// type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>

export const getProduct = async (event: APIGatewayProxyEventMiddyNormalized<null>): Promise<Product> => {
  Logger.debug('In getProduct()', { event });
  const { pathParameters: { storeId = '', productId = '' } } = event;
  const product = await service.getProduct({ storeId, productId });

  return product;
};

export const placeHolder = () => { };