module.exports = {
  setupFilesAfterEnv: ['jest-extended/all'],
  transform: {
    "^.+\\.tsx?$": "esbuild-jest"
  },
  testEnvironment: 'node',
};
