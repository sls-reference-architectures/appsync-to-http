module.exports = {
  setupFilesAfterEnv: ['jest-extended/all'],
  testMatch: ['**/?(*.)+(unit.test).[jt]s?(x)'],
  transform: {
    '^.+\\.js?$': '@swc/jest',
  },
};
