const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  globalSetup: './common/jest.setup.ts',
  testTimeout: 600000,
};
