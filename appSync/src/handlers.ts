import Logger from '@dazn/lambda-powertools-logger';

export const echo = async (event: any) => {
  Logger.debug('In echo()', { event });

  return event;
};

export const placeHolder = () => {
  Logger.debug('Will drop when we have 2nd export');
};
