/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests", "<rootDir>/src"],
  clearMocks: true,
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts",
    "!<rootDir>/src/**/*.spec.ts",
    "!<rootDir>/src/index.ts",
    "!<rootDir>/src/openapi.ts",
  ],
  coverageDirectory: "<rootDir>/coverage",
  coverageThresholds: {
    global: {
      statements: 90,
      branches: 85,
      functions: 85,
      lines: 90,
    },
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" }],
  },
};
