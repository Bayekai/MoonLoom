/** @type {import('ts-jest').JestConfigWithTsJest} */
// Set timezone in the real test process, before Jest creates VM contexts.
process.env.TZ = 'America/New_York';
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
  ],
  moduleNameMapper: {
    "^expo-crypto$": "<rootDir>/src/__mocks__/expo-crypto.js",
    "^@react-native-async-storage/async-storage$": "<rootDir>/src/__mocks__/@react-native-async-storage/async-storage.js"
  }
};
