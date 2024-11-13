export function request(ctx) {
  const {
    arguments: {
      input: { storeId },
    },
  } = ctx;
  return {
    payload: {
      storeId,
    },
  };
}

export function response(ctx) {
  return ctx.result;
}
