export function request(ctx) {
  const {
    arguments: {
      input: { metadata, name, price, productId, storeId },
    },
  } = ctx;
  return {
    payload: {
      metadata,
      name,
      price,
      productId,
      storeId,
    },
  };
}

export function response(ctx) {
  return ctx.result;
}
