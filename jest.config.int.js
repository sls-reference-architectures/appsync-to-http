const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  globalSetup: './common/jest.setup.js',
  testTimeout: 600000,
};
