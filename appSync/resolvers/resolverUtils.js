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

const convertQueryForAppsyncJs = (query) => {
  const convertedQuery = {};
  Object.keys(query).forEach((key) => {
    const value = query[key];
    if (typeof value !== 'string') {
      convertedQuery[key] = JSON.stringify(query[key]);
    } else {
      convertedQuery[key] = value;
    }
  });

  return convertedQuery;
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

export { convertQueryForAppsyncJs, parseHttpDataSourceResponse };
