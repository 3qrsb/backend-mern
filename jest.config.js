/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/src/$1"
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    collectCoverageFrom: [
      "src/**/*.ts",
      "!src/**/*.d.ts",
      "!src/server.ts",
      "!src/config.ts",
    ],
    coverageDirectory: "coverage",
  };
  