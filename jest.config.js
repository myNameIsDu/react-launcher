module.exports = {
    testMatch: ['<rootDir>/test/**/*.test.{ts,tsx}'],
    collectCoverage: false,
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['./src/**/*.{tsx,ts}'],
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['./test/jest.setup.ts'],
    transform: {
        '^.+\\.(t|j)sx?$': ['@swc/jest'],
    },
};
