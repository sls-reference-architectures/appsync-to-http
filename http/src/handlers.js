import Logger from '@dazn/lambda-powertools-logger';
import middy from '@middy/core';
import eventNormalizer from '@middy/http-event-normalizer';
import errorHandler from '@middy/http-error-handler';
import bodyParser from '@middy/http-json-body-parser';
import inputOutputLogger from '@middy/input-output-logger';

import * as service from './service';
import Publisher from './publisher';

const publisher = new Publisher(process.env.EVENT_BUS_NAME);

const getProduct = async (event) => {
  Logger.debug('In handler.getProduct()', { event });
  const {
    pathParameters: { productId },
    headers: { 'x-custom-store-id': storeId },
  } = event;
  const product = await service.getProduct({ storeId, productId });

  return product;
};

const getProducts = async (event) => {
  Logger.debug('In getProducts()', { event });
  const {
    headers: { 'x-custom-store-id': storeId },
    queryStringParameters: { limit, cursor },
  } = event;
  const result = await service.getProducts({
    storeId,
    limit: service.parseLimit(limit),
    cursor,
  });

  return result;
};

const createProduct = async (event) => {
  Logger.debug('In createProduct()', { event });
  const {
    headers: { 'x-custom-store-id': storeId },
    body,
  } = event;
  const id = await service.createProduct({ ...body, storeId });

  return {
    statusCode: 201,
    body: JSON.stringify({ productId: id }),
  };
};

const publishProductEvents = async (event) => {
  await publisher.publish({ dynamoDbStreamEvent: event, sourceName: 'products' });
};

export const getProductHandler = middy(getProduct)
  .use(inputOutputLogger())
  .use(eventNormalizer())
  .use(errorHandler());
export const createProductHandler = middy(createProduct)
  .use(inputOutputLogger())
  .use(eventNormalizer())
  .use(bodyParser())
  .use(errorHandler());
export const getProductsHandler = middy(getProducts)
  .use(inputOutputLogger())
  .use(eventNormalizer())
  .use(errorHandler());
export const publishProductEventsHandler = middy(publishProductEvents).use(inputOutputLogger());
