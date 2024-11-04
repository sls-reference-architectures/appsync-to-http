module.exports = {
  setupFilesAfterEnv: ['jest-extended/all'],
  transform: {
    '^.+\\.jsx?$': '@swc/jest',
  },
  testEnvironment: 'node',
};
