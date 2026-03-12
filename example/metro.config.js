const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const sdkRoot = path.resolve(__dirname, 'node_modules/react-native-exponea-sdk');

const config = {
  resolver: {
    blockList: [
      new RegExp(`${sdkRoot}/node_modules/.*`),
      new RegExp(`${sdkRoot}/example/node_modules/.*`),
    ],
    extraNodeModules: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
    },
  },
  watchFolders: [sdkRoot],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
