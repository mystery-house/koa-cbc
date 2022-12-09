import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  automock: false,
  testPathIgnorePatterns: [
    "tests/helpers/*"
  ]
}
export default config
