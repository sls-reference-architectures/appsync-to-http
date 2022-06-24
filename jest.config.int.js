const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  globalSetup: './http/test/jest.setup.int.ts',
};
