import { parseHttpDataSourceResponse } from './resolverUtils';

export function request(ctx) {
  const {
    arguments: {
      input: { productId, storeId },
    },
  } = ctx;
  const httpRequest = {
    version: '2018-05-29',
    method: 'GET',
    resourcePath: `/products/${productId}`,
    params: {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-custom-store-id': storeId,
      },
    },
  };

  return httpRequest;
}

export function response(ctx) {
  const product = parseHttpDataSourceResponse(ctx);

  return product;
}
