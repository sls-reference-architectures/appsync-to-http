import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const {
    arguments: {
      input: { storeId, productId },
    },
  } = ctx;

  return {
    version: '2018-05-29',
    method: 'GET',
    resourcePath: `/products/${productId}`,
    params: {
      headers: {
        'x-custom-store-id': storeId,
      },
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  if (ctx.result.statusCode !== 200) {
    const message = `Delivery failed: ${ctx.result.statusCode}`;
    util.error(message);
  }

  return JSON.parse(ctx.result.body); // <-- Must return object in JS
}
