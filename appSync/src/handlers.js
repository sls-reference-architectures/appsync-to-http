import Logger from '@dazn/lambda-powertools-logger';

const echo = async (event) => {
  Logger.debug('In echo()', { event });

  return event;
};

const onProductCreated = async (event) => {
  Logger.debug('In onProductCreated()', { event });
};

export { echo, onProductCreated };
