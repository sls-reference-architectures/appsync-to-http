import { parseHttpDataSourceResponse } from './resolverUtils';

export function request(ctx) {
  const {
    arguments: { input },
  } = ctx;
  const httpRequest = {
    version: '2018-05-29',
    method: 'POST',
    resourcePath: '/products',
    params: {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-custom-store-id': input.storeId,
      },
      body: input,
    },
  };

  return httpRequest;
}

export function response(ctx) {
  const product = parseHttpDataSourceResponse(ctx);

  return product;
}
