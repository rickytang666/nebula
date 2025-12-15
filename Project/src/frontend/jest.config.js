module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'utils/**/*.{ts,tsx}',
    '!**/__tests__/**',
    '!**/node_modules/**'
  ],
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  }
};
