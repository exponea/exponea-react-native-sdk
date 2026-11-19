const fs = require('fs');
const path = require('path');

const appGroup = 'group.com.bloomreach.sdk.example.expo';
const googleServicesFile = './google-services.json';
const googleServicesPlist = './GoogleService-Info.plist';

const hasGoogleServicesFile = fs.existsSync(
  path.join(__dirname, googleServicesFile)
);
const hasGoogleServicesPlist = fs.existsSync(
  path.join(__dirname, googleServicesPlist)
);

// Push configuration is intentionally not committed; see README.md.
if (!hasGoogleServicesFile) {
  console.warn(
    `[example_expo] ${googleServicesFile} not found. Android push notifications will not work; see example_expo/README.md.`
  );
}

module.exports = {
  expo: {
    name: 'Bloomreach SDK Demo (Expo)',
    slug: 'bloomreach-sdk-demo-expo',
    version: '1.0.0',
    orientation: 'portrait',
    // 'exponea' matches ../example, so the shared deeplink handling and
    // test-hub's exponea:// deeplink tests work unchanged. 'exponea-expo' is
    // unique to this build, for opening it when both example apps are installed.
    scheme: ['exponea', 'exponea-expo'],
    newArchEnabled: true,
    // Bloomreach icons with an "EXPO" label, so this build is easy to tell apart
    // from ../example. ios.icon is the classic example's Icon Composer bundle
    // with the labelled mark as its layer; the Android PNGs show the same mark.
    icon: './assets/icon.png',
    ios: {
      icon: './assets/AppIcon.icon',
      bundleIdentifier: 'com.bloomreach.sdk.example.expo',
      buildNumber: '1',
      supportsTablet: true,
      entitlements: {
        'aps-environment': 'development',
        'com.apple.security.application-groups': [appGroup],
      },
      ...(hasGoogleServicesPlist
        ? { googleServicesFile: googleServicesPlist }
        : {}),
    },
    android: {
      package: 'com.bloomreach.sdk.example.expo',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon-foreground.png',
        monochromeImage: './assets/adaptive-icon-foreground.png',
        backgroundColor: '#FFD400',
      },
      ...(hasGoogleServicesFile ? { googleServicesFile } : {}),
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [{ scheme: 'https', host: 'mobile-sdk-example-apps.web.app' }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    plugins: [
      [
        'react-native-exponea-sdk',
        {
          enableRichPush: true,
          enableNotificationContentExtension: true,
          appGroup,
        },
      ],
      './plugins/withExampleNativeHelpers',
    ],
  },
};
