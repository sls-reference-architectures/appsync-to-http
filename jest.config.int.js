const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  globalSetup: './http/test/jest.setup.ts',
  testTimeout: 600000,
};
