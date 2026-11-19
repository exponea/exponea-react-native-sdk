// Expo example helper: a local config plugin that adds the example app's own
// native code to the projects Expo generates during prebuild.
//
// Why it exists: Expo prebuild regenerates android/ and ios/ from app.config.js,
// so native files can't be added to those folders by hand. This plugin copies
// the helpers from ./native into the generated projects on every prebuild and
// wires them up. It is registered in example_expo/app.config.js after the
// Bloomreach SDK plugin ('react-native-exponea-sdk').
//
// What the helpers show:
// - Customer token authorization: ExampleAuthProvider returns JWT customer
//   tokens to the SDK, backed by a demo token source (CustomerTokenStorage).
// - Manual push token tracking: TokenTracker backs the "Track push token" button.
//
// Do integrators need this file? No. The SDK's own config plugin does all the
// native setup the SDK requires. You only need a plugin like this when your app
// has native code of its own, most commonly an auth provider for customer token
// authorization. In that case this file is a working template: copy your
// sources into the generated project and register them as shown below.
// Everything in ./native is example code, not part of the SDK.
const {
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
  withPlugins,
  withXcodeProject,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const ANDROID_PACKAGE = 'exponea.example';
// The SDK looks up the customer token provider through manifest meta-data named
// ExponeaAuthProvider. Its value must be the provider's fully qualified class.
const ANDROID_PROVIDER = 'exponea.example.services.ExampleAuthProvider';

// Native Android SDK the helpers compile against: the version the React Native
// SDK pins in its android/build.gradle, read from the installed package so the
// two can't drift.
function nativeAndroidSdkDependency() {
  const sdkRoot = path.dirname(
    require.resolve('react-native-exponea-sdk/package.json', {
      paths: [__dirname],
    })
  );
  const gradle = fs.readFileSync(
    path.join(sdkRoot, 'android', 'build.gradle'),
    'utf8'
  );
  const match = gradle.match(/['"](com\.exponea\.sdk:sdk:[^'"]+)['"]/);
  if (!match) {
    throw new Error(
      '[example] Cannot find the native Android SDK version in react-native-exponea-sdk/android/build.gradle.'
    );
  }
  return match[1];
}

// Recursively copies the helper sources into the generated native project.
function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyDirectory(from, to);
    else fs.copyFileSync(from, to);
  }
}

// Android: three steps, matching what the classic example has in its native
// project.
function withAndroidHelpers(config) {
  // 1. Dependencies the helpers compile against. The native Bloomreach SDK is
  //    already part of the app through the React Native SDK, but only as that
  //    library's internal dependency. The helpers import its classes directly,
  //    so the app module needs it on its own classpath, at the same version.
  //    OkHttp and Gson are used by the demo token fetch, at the versions the
  //    classic example uses in example/android/app/build.gradle.
  config = withAppBuildGradle(config, (cfg) => {
    const nativeSdk = nativeAndroidSdkDependency();
    const dependencies = [
      `implementation '${nativeSdk}'`,
      "implementation 'com.squareup.okhttp3:okhttp:4.12.0'",
      "implementation 'com.google.code.gson:gson:2.14.0'",
    ];
    if (!cfg.modResults.contents.includes(nativeSdk)) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /dependencies\s*\{/,
        `dependencies {\n    ${dependencies.join('\n    ')}`
      );
    }
    return cfg;
  });

  // 2. Copy ./native/android into app/src/main/java, and register
  //    ExampleAppPackage in the generated MainApplication so React Native sees
  //    the example's native modules.
  config = withDangerousMod(config, [
    'android',
    (cfg) => {
      const root = cfg.modRequest.platformProjectRoot;
      const javaRoot = path.join(root, 'app', 'src', 'main', 'java');
      copyDirectory(path.join(__dirname, 'native', 'android'), javaRoot);

      const packagePath = cfg.android.package.replace(/\./g, path.sep);
      const applicationPath = path.join(
        javaRoot,
        packagePath,
        'MainApplication.kt'
      );
      let source = fs.readFileSync(applicationPath, 'utf8');
      if (!source.includes('exponea.example.ExampleAppPackage()')) {
        const packageList = /PackageList\(this\)\.packages\.apply \{/;
        // Without the registration the example's native modules are missing at
        // runtime, so fail the prebuild instead of building a broken app.
        if (!packageList.test(source)) {
          throw new Error(
            `[example] Cannot register ExampleAppPackage: \`PackageList(this).packages.apply {\` not found in ${applicationPath}.`
          );
        }
        source = source.replace(
          packageList,
          'PackageList(this).packages.apply {\n              add(exponea.example.ExampleAppPackage())'
        );
        fs.writeFileSync(applicationPath, source);
      }
      return cfg;
    },
  ]);

  // 3. Register the customer token provider for the SDK. Only needed when the
  //    project uses customer token authorization.
  return withAndroidManifest(config, (cfg) => {
    const application = cfg.modResults.manifest.application[0];
    application['meta-data'] = application['meta-data'] || [];
    if (
      !application['meta-data'].some(
        (item) => item.$?.['android:name'] === 'ExponeaAuthProvider'
      )
    ) {
      application['meta-data'].push({
        $: {
          'android:name': 'ExponeaAuthProvider',
          'android:value': ANDROID_PROVIDER,
        },
      });
    }
    return cfg;
  });
}

// Finds the app target in the generated Xcode project, so the helper sources
// compile into the app and not into the SDK's notification extensions.
function appTarget(project) {
  const targets = project.pbxNativeTargetSection();
  for (const key of Object.keys(targets)) {
    const target = targets[key];
    if (
      !key.endsWith('_comment') &&
      target?.productType?.replace(/"/g, '') ===
        'com.apple.product-type.application'
    ) {
      return { uuid: key, target };
    }
  }
  throw new Error('[example] Unable to locate the iOS application target.');
}

// iOS: copy ./native/ios into an ExponeaExampleHelpers folder next to the
// generated Xcode project, then add each file to the app target. No other
// registration is needed: the SDK finds ExampleAuthProvider by its Objective-C
// class name, and React Native finds the modules through their .m export files.
function withIosHelpers(config) {
  config = withDangerousMod(config, [
    'ios',
    (cfg) => {
      copyDirectory(
        path.join(__dirname, 'native', 'ios'),
        path.join(cfg.modRequest.platformProjectRoot, 'ExponeaExampleHelpers')
      );
      return cfg;
    },
  ]);

  return withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    const target = appTarget(project);
    const folder = 'ExponeaExampleHelpers';
    let group = project.pbxGroupByName(folder);
    let groupKey;
    if (!group) {
      const created = project.addPbxGroup([], folder, folder);
      groupKey = created.uuid;
      const groups = project.hash.project.objects.PBXGroup;
      const rootKey = Object.keys(groups).find(
        (key) =>
          !key.endsWith('_comment') &&
          groups[key]?.name === undefined &&
          groups[key]?.path === undefined
      );
      if (rootKey) project.addToPbxGroup(groupKey, rootKey);
    } else {
      groupKey = project.findPBXGroupKey({ name: folder });
    }

    const files = fs.readdirSync(
      path.join(cfg.modRequest.platformProjectRoot, folder)
    );
    for (const file of files) {
      const fileSection = project.pbxFileReferenceSection();
      const alreadyAdded = Object.values(fileSection).some(
        (entry) =>
          entry?.path?.replace(/"/g, '') === file ||
          entry?.path?.replace(/"/g, '') === `${folder}/${file}`
      );
      if (!alreadyAdded) {
        project.addSourceFile(file, { target: target.uuid }, groupKey);
      }
    }
    return cfg;
  });
}

module.exports = (config) =>
  withPlugins(config, [withAndroidHelpers, withIosHelpers]);

// Internals exposed for unit tests only.
module.exports._test = {
  copyDirectory,
  appTarget,
  nativeAndroidSdkDependency,
  ANDROID_PACKAGE,
};
