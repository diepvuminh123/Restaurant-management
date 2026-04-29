module.exports = {
  testEnvironment: 'node',
  verbose: true,
  setupFilesAfterEnv: ['./tests/setup.js'],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/services/**/*.js'
  ],
};
