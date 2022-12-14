import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  automock: false,
  testPathIgnorePatterns: [
    "<rootDir>/tests/helpers/"
  ],
  coveragePathIgnorePatterns: [
    "<rootDir>/tests/helpers/"
  ]
}
export default config
