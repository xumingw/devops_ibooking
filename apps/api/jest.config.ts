import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }]
  },
  collectCoverageFrom: ['src/**/*.(t|j)s', '!src/main.ts', '!src/scripts/**'],
  coverageDirectory: '../../coverage/apps/api',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@ibooking/shared-types$': '<rootDir>/../../packages/shared-types/src/index.ts'
  }
};

export default config;
