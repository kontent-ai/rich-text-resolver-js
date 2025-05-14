const baseConfig = require('../../jest.config.base.cjs');

module.exports = {
  ...baseConfig,
  displayName: 'react',
  rootDir: '.',
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@kontent-ai/rich-text-resolver$': '<rootDir>/../core/src',
    '^@kontent-ai/rich-text-resolver/(.*)$': '<rootDir>/../core/src/$1'
  }
}; 