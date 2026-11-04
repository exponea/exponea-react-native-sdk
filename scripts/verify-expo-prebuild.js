const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'example_expo');

function read(relativePath) {
  const file = path.join(root, relativePath);
  assert(fs.existsSync(file), `Missing generated file: ${relativePath}`);
  return fs.readFileSync(file, 'utf8');
}

function includes(contents, expected, file) {
  assert(contents.includes(expected), `${file} does not contain ${expected}`);
}

function occurs(contents, expected, expectedCount, file) {
  const count = contents.split(expected).length - 1;
  assert.equal(
    count,
    expectedCount,
    `${file} contains ${expected} ${count} times`
  );
}

function occursOnce(contents, expected, file) {
  occurs(contents, expected, 1, file);
}

const gradleFile = 'android/app/build.gradle';
const gradle = read(gradleFile);
for (const dependency of [
  'com.google.firebase:firebase-messaging:24.0.0',
  'com.exponea.sdk:sdk:5.4.0',
  'com.squareup.okhttp3:okhttp:4.12.0',
  'com.google.code.gson:gson:2.14.0',
]) {
  occursOnce(gradle, dependency, gradleFile);
}

const manifestFile = 'android/app/src/main/AndroidManifest.xml';
const manifest = read(manifestFile);
occursOnce(manifest, 'android:name=".MessageService"', manifestFile);
occursOnce(manifest, 'android:name="ExponeaAuthProvider"', manifestFile);

const messageServiceFile =
  'android/app/src/main/java/com/bloomreach/sdk/example/expo/MessageService.java';
const messageService = read(messageServiceFile);
includes(
  messageService,
  'extends FirebaseMessagingService',
  messageServiceFile
);
includes(
  messageService,
  'ExponeaModule.Companion.handleRemoteMessage',
  messageServiceFile
);
includes(
  messageService,
  'ExponeaModule.Companion.handleNewToken',
  messageServiceFile
);

const applicationFile =
  'android/app/src/main/java/com/bloomreach/sdk/example/expo/MainApplication.kt';
occursOnce(
  read(applicationFile),
  'add(exponea.example.ExampleAppPackage())',
  applicationFile
);

for (const helper of [
  'android/app/src/main/java/exponea/example/services/ExampleAuthProvider.java',
  'android/app/src/main/java/exponea/example/push/TokenTracker.kt',
  'ios/ExponeaExampleHelpers/ExampleAuthProvider.swift',
  'ios/ExponeaExampleHelpers/TokenTracker.swift',
]) {
  read(helper);
}

const appDelegateFile = 'ios/BloomreachSDKDemoExpo/AppDelegate.swift';
const appDelegate = read(appDelegateFile);
for (const handler of [
  'UNUserNotificationCenter.current().delegate = self',
  'Exponea.shared.handlePushNotificationToken',
  'Exponea.shared.handlePushNotificationOpened(response: response)',
  'Exponea.shared.handlePushNotificationOpened(userInfo: userInfo)',
  'Exponea.shared.handleUniversalLink(userActivity)',
  'super.application(application, didRegisterForRemoteNotificationsWithDeviceToken: deviceToken)',
  'super.application(application, didReceiveRemoteNotification: userInfo, fetchCompletionHandler: completionHandler)',
]) {
  occursOnce(appDelegate, handler, appDelegateFile);
}
occurs(appDelegate, 'completionHandler(.newData)', 0, appDelegateFile);

const podfile = read('ios/Podfile');
for (const target of [
  "target 'ExponeaNotificationService'",
  "target 'ExponeaNotificationContent'",
]) {
  occursOnce(podfile, target, 'ios/Podfile');
}
// Both extension targets pin the pod to the core SDK version from the podspec.
occurs(podfile, "pod 'ExponeaSDK-Notifications', '5.0.0'", 2, 'ios/Podfile');

const projectFile = 'ios/BloomreachSDKDemoExpo.xcodeproj/project.pbxproj';
const project = read(projectFile);
for (const target of [
  'ExponeaNotificationService',
  'ExponeaNotificationContent',
]) {
  includes(
    project,
    `PRODUCT_BUNDLE_IDENTIFIER = com.bloomreach.sdk.example.expo.${target}`,
    projectFile
  );
  includes(
    project,
    `CODE_SIGN_ENTITLEMENTS = ${target}/${target}.entitlements`,
    projectFile
  );
  // One PBXBuildFile plus its entry in the app's copy-files phase.
  occurs(project, `/* ${target}.appex in `, 2, projectFile);
}
for (const helper of [
  'CustomerTokenStorage.swift in Sources',
  'ExampleAuthProvider.swift in Sources',
  'TokenTracker.swift in Sources',
]) {
  occurs(project, helper, 2, projectFile);
}

for (const entitlementsFile of [
  'ios/BloomreachSDKDemoExpo/BloomreachSDKDemoExpo.entitlements',
  'ios/ExponeaNotificationService/ExponeaNotificationService.entitlements',
]) {
  includes(
    read(entitlementsFile),
    'group.com.bloomreach.sdk.example.expo',
    entitlementsFile
  );
}

for (const target of [
  'ExponeaNotificationService',
  'ExponeaNotificationContent',
]) {
  const infoFile = `ios/${target}/${target}-Info.plist`;
  includes(
    read(infoFile),
    '<key>CFBundleIdentifier</key>\n\t<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>',
    infoFile
  );
}

const contentInfoFile =
  'ios/ExponeaNotificationContent/ExponeaNotificationContent-Info.plist';
const contentInfo = read(contentInfoFile);
includes(
  contentInfo,
  '<key>CFBundleVersion</key>\n\t<string>1</string>',
  contentInfoFile
);
assert(
  !contentInfo.includes('$(CURRENT_PROJECT_VERSION)'),
  `${contentInfoFile} must contain a concrete build number`
);

read('ios/ExponeaNotificationContent/NotificationViewController.swift');
read('ios/ExponeaNotificationService/NotificationService.swift');

console.log('Expo Android and iOS prebuild assertions passed.');
