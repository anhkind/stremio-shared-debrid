module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/test/**/*.test.js'
  ],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};