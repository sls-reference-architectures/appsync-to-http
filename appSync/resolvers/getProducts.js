import { convertQueryForAppsyncJs, parseHttpDataSourceResponse } from './resolverUtils';

export function request(ctx) {
  const {
    arguments: {
      input: { cursor, limit, storeId },
    },
  } = ctx;
  const query = {};
  if (cursor) {
    query.cursor = cursor;
  }
  if (limit) {
    query.limit = limit;
  }
  const httpRequest = {
    version: '2018-05-29',
    method: 'GET',
    resourcePath: '/products',
    params: {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-custom-store-id': storeId,
      },
      query: convertQueryForAppsyncJs(query),
    },
  };

  return httpRequest;
}

export function response(ctx) {
  const productsResult = parseHttpDataSourceResponse(ctx);

  return productsResult;
}
