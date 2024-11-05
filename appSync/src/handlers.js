import Logger from '@dazn/lambda-powertools-logger';

export const echo = async (event) => {
  Logger.debug('In echo()', { event });

  return event;
};
