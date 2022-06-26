import Logger from '@dazn/lambda-powertools-logger';
import middy from '@middy/core';
import eventNormalizer from '@middy/http-event-normalizer';
import errorHandler from '@middy/http-error-handler';
import bodyParser from '@middy/http-json-body-parser';

import { APIGatewayProxyEventMiddyNormalized, PageResult, Product } from './models';
import * as service from './service';

const getProduct = async (event: APIGatewayProxyEventMiddyNormalized<null>): Promise<Product> => {
  Logger.debug('In getProduct()', { event });
  const {
    pathParameters: { productId },
    headers: { 'x-custom-store-id': storeId },
  } = event;
  const product = await service.getProduct({
    storeId: storeId ?? '',
    productId: productId ?? '',
  });

  return product;
};

const getProducts = async (
  event: APIGatewayProxyEventMiddyNormalized<null>,
): Promise<PageResult<Product>> => {
  Logger.debug('In getProducts()', { event });
  const {
    headers: { 'x-custom-store-id': storeId },
    queryStringParameters: { limit, cursor },
  } = event;
  const result = await service.getProducts({
    storeId: storeId ?? '',
    limit: service.parseLimit(limit),
    cursor,
  });

  return result;
};

const createProduct = async (event: APIGatewayProxyEventMiddyNormalized<Product>) => {
  Logger.debug('In createProduct()', { event });
  const {
    headers: { 'x-custom-store-id': storeId },
    body,
  } = event;
  const id = await service.createProduct({ ...body, storeId: storeId ?? '' });

  return {
    statusCode: 201,
    body: JSON.stringify({ productId: id }),
  };
};

export const getProductHandler = middy(getProduct).use(eventNormalizer()).use(errorHandler());
export const createProductHandler = middy(createProduct)
  .use(eventNormalizer())
  .use(bodyParser())
  .use(errorHandler());
export const getProductsHandler = middy(getProducts).use(eventNormalizer()).use(errorHandler());
