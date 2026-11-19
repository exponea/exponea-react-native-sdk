module.exports = {
  watchman: false,
  preset: 'react-native',
  setupFiles: ['<rootDir>/../jest.setup.js'],
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-native-exponea-sdk$':
      '<rootDir>/__mocks__/react-native-exponea-sdk.js',
    '\\.(png|jpg|jpeg|gif)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@noble|react-native-exponea-sdk|react-native-picker-select|react-native-gesture-handler)/)',
  ],
};
