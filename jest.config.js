export default {
  preset: "ts-jest",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      useESM: true,
    }],
  },
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts",
    "!src/tests/**/*",
    "!src/**/index.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@/domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@/application/(.*)$": "<rootDir>/src/application/$1",
    "^@/infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
    "^@/interfaces/(.*)$": "<rootDir>/src/interfaces/$1",
  },
  setupFiles: ["<rootDir>/src/tests/setup.ts"],
  testTimeout: 10000,
  verbose: true,
};
