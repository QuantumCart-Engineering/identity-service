module.exports = {
    preset: "ts-jest",

    testEnvironment: "node",

    roots: ["<rootDir>/src"],

    testMatch: [
        "**/__tests__/**/*.test.ts",
        "**/?(*.)+(spec|test).ts"
    ],

    clearMocks: true,

    setupFilesAfterEnv: [
        "<rootDir>/src/__tests__/integration/setup.ts"
    ],

    coverageThreshold: {
        global: {
            statements: 95,
            branches: 90,
            functions: 100,
            lines: 95
        }
    }
};