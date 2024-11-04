import { util } from '@aws-appsync/utils';

const parseHttpDataSourceResponse = (ctx) => {
  if (isGqlError(ctx)) {
    util.error(ctx.error);
  }
  handleDataSourceError(ctx);
  const {
    result: { body },
  } = ctx;

  return JSON.parse(body);
};

const isGqlError = (ctx) => !!ctx.error;
const isServerErrorResult = (ctx) => !!ctx.result && ctx.result.statusCode >= 500;
const isClientErrorResult = (ctx) =>
  !!ctx.result && ctx.result.statusCode >= 400 && ctx.result.statusCode < 500;

const handleDataSourceError = (ctx) => {
  if (isServerErrorResult(ctx)) {
    util.error('Internal Error', `${ctx.result.statusCode}`);
  }
  if (isClientErrorResult(ctx)) {
    util.error(ctx.result.body, `${ctx.result.statusCode}`);
  }
};

export { parseHttpDataSourceResponse };
