module.exports = {
  rootDir: __dirname,
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@noble|react-native-exponea-sdk|react-native-picker-select|react-native-gesture-handler)/)',
  ],
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^react-native-exponea-sdk$':
      '<rootDir>/__mocks__/react-native-exponea-sdk.js',
    '^react-native-exponea-sdk/lib$':
      '<rootDir>/__mocks__/react-native-exponea-sdk/lib/index.js',
    '^react-native-exponea-sdk/lib/(.*)$':
      '<rootDir>/__mocks__/react-native-exponea-sdk/lib/$1.js',
  },
};
