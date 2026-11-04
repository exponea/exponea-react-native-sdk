const plugin = require('../../app.plugin.js');

describe('Expo config plugin options', () => {
  test('prefers an explicit app group', () => {
    expect(
      plugin._test.resolveAppGroup(
        {
          ios: {
            entitlements: {
              'com.apple.security.application-groups': ['group.inferred'],
            },
          },
        },
        { appGroup: 'group.explicit', enableRichPush: true }
      )
    ).toBe('group.explicit');
  });

  test('infers the app group from entitlements', () => {
    expect(
      plugin._test.resolveAppGroup(
        {
          ios: {
            entitlements: {
              'com.apple.security.application-groups': ['group.inferred'],
            },
          },
        },
        { enableRichPush: true }
      )
    ).toBe('group.inferred');
  });

  test('rejects rich push without an app group', () => {
    expect(() =>
      plugin._test.resolveAppGroup({}, { enableRichPush: true })
    ).toThrow('Rich push requires an appGroup');
  });

  test('does not require an app group when rich push is disabled', () => {
    expect(plugin._test.resolveAppGroup({}, {})).toBeUndefined();
  });

  test('does not store the app group on the config', () => {
    const config = plugin(
      {
        name: 'App',
        ios: { bundleIdentifier: 'com.example.app' },
        // Normally set by the Expo CLI.
        _internal: { projectRoot: require('os').tmpdir() },
      },
      { enableRichPush: true, appGroup: 'group.com.example.app' }
    );
    expect(config).not.toHaveProperty('_exponeaAppGroup');
    expect(JSON.stringify(config)).not.toContain('group.com.example.app');
  });

  test('rejects a content extension without rich push', () => {
    expect(() =>
      plugin(
        {},
        {
          enableNotificationContentExtension: true,
        }
      )
    ).toThrow('enableNotificationContentExtension requires enableRichPush');
  });
});

// AppDelegate.swift from expo-template-bare-minimum@57.
const EXPO_57_APP_DELEGATE = `internal import Expo
import React
import ReactAppDependencyProvider

@main
class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  override func bundleURL() -> URL? {
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
  }
}
`;

const REGISTER_TOKEN_SUPER =
  'super.application(application, didRegisterForRemoteNotificationsWithDeviceToken: deviceToken)';
const RECEIVE_PUSH_SUPER =
  'super.application(application, didReceiveRemoteNotification: userInfo, fetchCompletionHandler: completionHandler)';

function count(contents: string, expected: string): number {
  return contents.split(expected).length - 1;
}

// Body of the AppDelegate override that contains the given text.
function appDelegateMethod(contents: string, name: string): string {
  const start = contents.lastIndexOf(
    'func application(',
    contents.indexOf(name)
  );
  return contents.slice(start, contents.indexOf('\n  }', start));
}

// The template without the AppDelegate override that contains the given text.
function removeAppDelegateMethod(contents: string, name: string): string {
  const start = contents.lastIndexOf(
    '\n  public override func application(',
    contents.indexOf(name)
  );
  const end = contents.indexOf('\n  }\n', start) + '\n  }\n'.length;
  return contents.slice(0, start) + contents.slice(end);
}

describe('Expo config plugin Android MessageService', () => {
  test('extends FirebaseMessagingService without expo-notifications', () => {
    const source = plugin._test.getMessageServiceSource('com.example', false);
    expect(source).toContain('package com.example;');
    expect(source).toContain(
      'public class MessageService extends FirebaseMessagingService {'
    );
    expect(source).not.toContain('expo.modules.notifications');
    expect(source).toContain('ExponeaModule.Companion.handleRemoteMessage(');
    expect(source).toContain('ExponeaModule.Companion.handleNewToken(');
  });

  test('extends ExpoFirebaseMessagingService with expo-notifications', () => {
    const source = plugin._test.getMessageServiceSource('com.example', true);
    expect(source).toContain(
      'import expo.modules.notifications.service.ExpoFirebaseMessagingService;'
    );
    expect(source).toContain(
      'public class MessageService extends ExpoFirebaseMessagingService {'
    );

    const onMessage = source.slice(
      source.indexOf('onMessageReceived'),
      source.indexOf('onNewToken')
    );
    // Only non-Exponea messages go to expo-notifications.
    expect(onMessage).toMatch(
      /if \(!Exponea\.INSTANCE\.isExponeaPushNotification\(remoteMessage\.getData\(\)\)\) \{\s*super\.onMessageReceived\(remoteMessage\);\s*return;\s*\}\s*ExponeaModule\.Companion\.handleRemoteMessage\(/
    );

    const onNewToken = source.slice(source.indexOf('onNewToken'));
    expect(onNewToken).toContain('super.onNewToken(token);');
    expect(onNewToken).toContain('ExponeaModule.Companion.handleNewToken(');
  });
});

describe('Expo config plugin Swift AppDelegate', () => {
  const { modifySwiftAppDelegate } = plugin._test;

  test('owns the notification center delegate without expo-notifications', () => {
    const result = modifySwiftAppDelegate(EXPO_57_APP_DELEGATE, {
      expoNotifications: false,
    });
    expect(result).toContain(
      'class AppDelegate: ExpoAppDelegate, UNUserNotificationCenterDelegate {'
    );
    expect(
      count(result, 'UNUserNotificationCenter.current().delegate = self')
    ).toBe(1);
    expect(
      count(
        result,
        'Exponea.shared.handlePushNotificationOpened(response: response)'
      )
    ).toBe(1);
    expect(result).toContain('completionHandler([.banner, .list, .sound])');
    expect(result).not.toContain('ExpoNotifications');
    expect(result).not.toContain('NotificationCenterManager');
  });

  test('registers with expo-notifications instead of taking the delegate', () => {
    const result = modifySwiftAppDelegate(EXPO_57_APP_DELEGATE, {
      expoNotifications: true,
    });
    expect(result).toContain('internal import ExpoNotifications');
    expect(result).toContain('class AppDelegate: ExpoAppDelegate {');
    expect(result).not.toContain('UNUserNotificationCenterDelegate');
    expect(result).not.toContain('UNUserNotificationCenter.current().delegate');
    expect(result).not.toContain('willPresent');
    expect(
      count(
        result,
        'NotificationCenterManager.shared.addDelegate(ExponeaNotificationDelegate.shared)'
      )
    ).toBe(1);
    // The singleton keeps the delegate alive however the manager stores it.
    expect(result).toMatch(
      /final class ExponeaNotificationDelegate: NotificationDelegate \{\s*static let shared = ExponeaNotificationDelegate\(\)\s*func didReceive\(_ response: UNNotificationResponse, completionHandler: @escaping \(\) -> Void\) -> Bool \{\s*Exponea\.shared\.handlePushNotificationOpened\(response: response\)[\s\S]*?return false/
    );
  });

  test.each([false, true])(
    'calls Exponea and then super for remote notifications (expo-notifications: %s)',
    (expoNotifications) => {
      const result = modifySwiftAppDelegate(EXPO_57_APP_DELEGATE, {
        expoNotifications,
      });
      const registerToken = appDelegateMethod(
        result,
        'didRegisterForRemoteNotificationsWithDeviceToken'
      );
      expect(registerToken).toMatch(
        /\{\s*Exponea\.shared\.handlePushNotificationToken\(deviceToken: deviceToken\)\s*super\.application\(application, didRegisterForRemoteNotificationsWithDeviceToken: deviceToken\)\s*$/
      );

      const receivePush = appDelegateMethod(
        result,
        'didReceiveRemoteNotification'
      );
      expect(receivePush).toMatch(
        /\{\s*Exponea\.shared\.handlePushNotificationOpened\(userInfo: userInfo\)\s*super\.application\(application, didReceiveRemoteNotification: userInfo, fetchCompletionHandler: completionHandler\)\s*$/
      );
      expect(result).not.toContain('completionHandler(.newData)');
      expect(result).toContain(
        'Exponea.shared.handleUniversalLink(userActivity)'
      );
      expect(result).not.toContain('trackCampaignClick');
    }
  );

  test('tracks universal links with the activity parameter of the override', () => {
    const template = EXPO_57_APP_DELEGATE.replace(
      'continue userActivity: NSUserActivity',
      'continue activity: NSUserActivity'
    ).replace(/continue: userActivity/g, 'continue: activity');
    const result = modifySwiftAppDelegate(template, {});
    expect(result).toMatch(
      /restorationHandler: @escaping \(\[UIUserActivityRestoring\]\?\) -> Void\s*\) -> Bool \{\s*Exponea\.shared\.handleUniversalLink\(activity\)\s*let result = RCTLinkingManager/
    );
  });

  test('warns instead of failing when the universal link override is missing', () => {
    const { WarningAggregator } = require('@expo/config-plugins');
    const warn = jest
      .spyOn(WarningAggregator, 'addWarningIOS')
      .mockImplementation(() => {});
    try {
      const template = removeAppDelegateMethod(
        EXPO_57_APP_DELEGATE,
        'continue userActivity'
      );
      const result = modifySwiftAppDelegate(template, {});
      expect(result).not.toContain('handleUniversalLink');
      expect(warn).toHaveBeenCalledWith(
        'react-native-exponea-sdk',
        expect.stringContaining('application(_:continue:restorationHandler:)')
      );
    } finally {
      warn.mockRestore();
    }
  });

  test('installs the notification delegate at the start of didFinishLaunching', () => {
    // A customised launch method that does not end with `return super...`.
    const template = EXPO_57_APP_DELEGATE.replace(
      'return super.application(application, didFinishLaunchingWithOptions: launchOptions)',
      'let launched = super.application(application, didFinishLaunchingWithOptions: launchOptions)\n    return launched'
    );
    const result = modifySwiftAppDelegate(template, {
      expoNotifications: false,
    });
    expect(appDelegateMethod(result, 'didFinishLaunchingWithOptions')).toMatch(
      /-> Bool \{\s*UNUserNotificationCenter\.current\(\)\.delegate = self\s*let delegate = ReactNativeDelegate\(\)/
    );
    expect(
      count(result, 'UNUserNotificationCenter.current().delegate = self')
    ).toBe(1);
  });

  test('fails when didFinishLaunching is missing instead of skipping the delegate', () => {
    const template = removeAppDelegateMethod(
      EXPO_57_APP_DELEGATE,
      'didFinishLaunchingWithOptions'
    );
    expect(() =>
      modifySwiftAppDelegate(template, { expoNotifications: false })
    ).toThrow('Cannot find `application(_:didFinishLaunchingWithOptions:)`');
  });

  test.each([
    [false, true],
    [true, false],
  ])(
    'rejects an AppDelegate generated with expo-notifications: %s once the app has it: %s',
    (generated, now) => {
      const once = modifySwiftAppDelegate(EXPO_57_APP_DELEGATE, {
        expoNotifications: generated,
      });
      expect(() =>
        modifySwiftAppDelegate(once, { expoNotifications: now })
      ).toThrow('npx expo prebuild --clean');
    }
  );

  test('patches remote notification methods already in the template', () => {
    const template = EXPO_57_APP_DELEGATE.replace(
      '\n}\n\nclass ReactNativeDelegate',
      `
  public override func application(
    _ app: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken token: Data
  ) {
    print("token")
    super.application(app, didRegisterForRemoteNotificationsWithDeviceToken: token)
  }

  public override func application(
    _ app: UIApplication,
    didReceiveRemoteNotification payload: [AnyHashable: Any],
    fetchCompletionHandler handler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    if payload.isEmpty {
      print("empty")
    }
  }
}

class ReactNativeDelegate`
    );
    const result = modifySwiftAppDelegate(template, {
      expoNotifications: true,
    });
    expect(
      count(result, 'didRegisterForRemoteNotificationsWithDeviceToken')
    ).toBe(2);
    expect(count(result, 'didReceiveRemoteNotification')).toBe(2);

    const registerToken = appDelegateMethod(
      result,
      'didRegisterForRemoteNotificationsWithDeviceToken token'
    );
    expect(registerToken).toMatch(
      /\{\s*Exponea\.shared\.handlePushNotificationToken\(deviceToken: token\)\s*print\("token"\)\s*super\.application\(app, didRegisterForRemoteNotificationsWithDeviceToken: token\)\s*$/
    );
    expect(
      count(
        result,
        'super.application(app, didRegisterForRemoteNotificationsWithDeviceToken'
      )
    ).toBe(1);

    const receivePush = appDelegateMethod(
      result,
      'didReceiveRemoteNotification payload'
    );
    expect(receivePush).toMatch(
      /\{\s*Exponea\.shared\.handlePushNotificationOpened\(userInfo: payload\)\s*if payload\.isEmpty \{\s*print\("empty"\)\s*\}\s*super\.application\(app, didReceiveRemoteNotification: payload, fetchCompletionHandler: handler\)\s*$/
    );
  });

  test('keeps a template completion handler call instead of adding super', () => {
    const template = EXPO_57_APP_DELEGATE.replace(
      '\n}\n\nclass ReactNativeDelegate',
      `
  public override func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    completionHandler(.noData)
  }
}

class ReactNativeDelegate`
    );
    const result = modifySwiftAppDelegate(template, {});
    expect(result).not.toContain(RECEIVE_PUSH_SUPER);
    expect(count(result, 'completionHandler(.noData)')).toBe(1);
  });

  test('rejects an Objective-C AppDelegate', () => {
    expect(() => plugin._test.assertSwiftAppDelegate('objc')).toThrow(
      'Only a Swift AppDelegate is supported'
    );
    expect(() => plugin._test.assertSwiftAppDelegate('swift')).not.toThrow();
  });

  test.each([
    [
      'public class AppDelegate: ExpoAppDelegate {',
      'public class AppDelegate: ExpoAppDelegate, UNUserNotificationCenterDelegate {',
    ],
    [
      'final class AppDelegate : ExpoAppDelegate, CustomProtocol {',
      'final class AppDelegate : ExpoAppDelegate, CustomProtocol, UNUserNotificationCenterDelegate {',
    ],
  ])('adds delegate conformance to "%s"', (declaration, expected) => {
    const template = EXPO_57_APP_DELEGATE.replace(
      'class AppDelegate: ExpoAppDelegate {',
      declaration
    );
    const result = modifySwiftAppDelegate(template, {
      expoNotifications: false,
    });
    expect(result).toContain(expected);
    expect(count(result, 'UNUserNotificationCenterDelegate')).toBe(1);
  });

  test('keeps existing delegate conformance', () => {
    const template = EXPO_57_APP_DELEGATE.replace(
      'class AppDelegate: ExpoAppDelegate {',
      'class AppDelegate: ExpoAppDelegate, UNUserNotificationCenterDelegate {'
    );
    const result = modifySwiftAppDelegate(template, {
      expoNotifications: false,
    });
    expect(count(result, 'UNUserNotificationCenterDelegate')).toBe(1);
  });

  test('fails when the AppDelegate class declaration is missing', () => {
    const template = EXPO_57_APP_DELEGATE.replace(
      'class AppDelegate: ExpoAppDelegate {',
      'class MyDelegate: ExpoAppDelegate {'
    );
    expect(() =>
      modifySwiftAppDelegate(template, { expoNotifications: false })
    ).toThrow('Cannot find `class AppDelegate: ...`');
  });

  test('patches an existing didReceive handler with nested braces', () => {
    const template = EXPO_57_APP_DELEGATE.replace(
      '\n}\n\nclass ReactNativeDelegate',
      `
  public func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive tapped: UNNotificationResponse,
    withCompletionHandler done: @escaping () -> Void
  ) {
    if tapped.actionIdentifier == "x" {
      print("x")
    }
    done()
  }
}

class ReactNativeDelegate`
    );
    const result = modifySwiftAppDelegate(template, {
      expoNotifications: false,
    });
    expect(count(result, 'didReceive tapped: UNNotificationResponse')).toBe(1);
    expect(result).toMatch(
      /withCompletionHandler done: @escaping \(\) -> Void\s*\) \{\s*Exponea\.shared\.handlePushNotificationOpened\(response: tapped\)\s*if tapped\.actionIdentifier == "x" \{\s*print\("x"\)\s*\}\s*done\(\)\s*\}/
    );
    expect(result).not.toContain('didReceive response: UNNotificationResponse');
  });

  test.each([false, true])(
    'is idempotent (expo-notifications: %s)',
    (expoNotifications) => {
      const once = modifySwiftAppDelegate(EXPO_57_APP_DELEGATE, {
        expoNotifications,
      });
      expect(modifySwiftAppDelegate(once, { expoNotifications })).toBe(once);
      expect(count(once, REGISTER_TOKEN_SUPER)).toBe(1);
      expect(count(once, RECEIVE_PUSH_SUPER)).toBe(1);
    }
  );
});

describe('Expo config plugin expo-notifications detection', () => {
  const fs = require('fs');
  const os = require('os');
  const path = require('path');

  function projectRoot(installed: boolean, declared = installed): string {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'exponea-expo-'));
    roots.push(root);
    fs.writeFileSync(
      path.join(root, 'package.json'),
      JSON.stringify({
        name: 'app',
        dependencies: declared ? { 'expo-notifications': '~57.0.0' } : {},
      })
    );
    if (installed) {
      const packageDir = path.join(root, 'node_modules', 'expo-notifications');
      fs.mkdirSync(packageDir, { recursive: true });
      fs.writeFileSync(
        path.join(packageDir, 'package.json'),
        '{"name":"expo-notifications","version":"57.0.0"}'
      );
    }
    return root;
  }
  const roots: string[] = [];

  afterAll(() => {
    for (const root of roots) {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('resolves expo-notifications from the app project', () => {
    expect(plugin._test.hasExpoNotifications(projectRoot(true))).toBe(true);
  });

  test('does not find expo-notifications in a project without it', () => {
    expect(plugin._test.hasExpoNotifications(projectRoot(false))).toBe(false);
  });

  test('ignores an installed copy the app does not depend on', () => {
    // For example hoisted from another workspace in a monorepo.
    expect(plugin._test.hasExpoNotifications(projectRoot(true, false))).toBe(
      false
    );
  });

  test('ignores a declared dependency that is not installed', () => {
    expect(plugin._test.hasExpoNotifications(projectRoot(false, true))).toBe(
      false
    );
  });
});

describe('Expo config plugin Xcode targets', () => {
  // The xcode library stores target names quoted.
  function xcodeProject(embedded: boolean) {
    const objects = {
      PBXBuildFile: embedded
        ? { BUILDFILE: { fileRef: 'PRODUCT' }, BUILDFILE_comment: 'x' }
        : {},
      PBXCopyFilesBuildPhase: {
        COPY: { dstSubfolderSpec: 13, files: [{ value: 'BUILDFILE' }] },
      },
    };
    const targets = {
      APP: {
        name: '"App"',
        productType: '"com.apple.product-type.application"',
        buildPhases: [{ value: 'COPY' }],
      },
      APP_comment: 'App',
      NSE: {
        name: '"ExponeaNotificationService"',
        productType: '"com.apple.product-type.app-extension"',
        productReference: 'PRODUCT',
      },
      NSE_comment: 'ExponeaNotificationService',
    };
    return {
      hash: { project: { objects } },
      pbxNativeTargetSection: () => targets,
      addBuildPhase: jest.fn(),
    };
  }

  test('finds targets whose names are quoted', () => {
    expect(
      plugin._test.findNativeTargetByName(
        xcodeProject(true),
        'ExponeaNotificationService'
      )
    ).toEqual(expect.objectContaining({ uuid: 'NSE' }));
  });

  test('does not embed an extension twice', () => {
    const project = xcodeProject(true);
    expect(
      plugin._test.ensureNseEmbeddedInAppTarget(
        project,
        'ExponeaNotificationService',
        'App'
      )
    ).toBe(false);
    expect(project.addBuildPhase).not.toHaveBeenCalled();
  });

  test('embeds a missing extension in the app target', () => {
    const project = xcodeProject(false);
    expect(
      plugin._test.ensureNseEmbeddedInAppTarget(
        project,
        'ExponeaNotificationService',
        'App'
      )
    ).toBe(true);
    expect(project.addBuildPhase).toHaveBeenCalledWith(
      ['ExponeaNotificationService.appex'],
      'PBXCopyFilesBuildPhase',
      'Embed App Extensions',
      'APP',
      { dstSubfolderSpec: 13, dstPath: '' }
    );
  });
});

describe('Expo config plugin build.gradle', () => {
  const GRADLE = `android {
    defaultConfig {
        applicationId "com.example"
    }
}

dependencies {
    implementation("com.facebook.react:react-android")
}
`;

  test('adds Firebase Messaging and multidex', () => {
    const result = plugin._test.patchAppBuildGradle(GRADLE, null);
    expect(result).toMatch(/defaultConfig \{\n\s+multiDexEnabled true/);
    expect(result).toMatch(
      /dependencies \{\n\s+implementation\("com\.google\.firebase:firebase-messaging:24\.0\.0"\)/
    );
    expect(plugin._test.patchAppBuildGradle(result, null)).toBe(result);
  });

  test('adds the native SDK when expo-notifications needs it', () => {
    const result = plugin._test.patchAppBuildGradle(
      GRADLE,
      'com.exponea.sdk:sdk:5.4.0'
    );
    expect(result).toContain('implementation("com.exponea.sdk:sdk:5.4.0")');
  });

  test.each([
    [
      'without defaultConfig',
      GRADLE.replace('defaultConfig {', 'productFlavors {'),
    ],
    [
      'without dependencies',
      GRADLE.replace('dependencies {', 'configurations {'),
    ],
  ])('fails %s instead of corrupting the file', (_name, gradle) => {
    expect(() => plugin._test.patchAppBuildGradle(gradle, null)).toThrow(
      'Cannot find the \`defaultConfig {\` and \`dependencies {\` blocks'
    );
  });
});

describe('Expo config plugin generated files', () => {
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  let dir: string;

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'exponea-expo-files-'));
  });

  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('rewrites a plugin-owned file only when its content changes', () => {
    const file = path.join(dir, 'MessageService.java');
    const standalone = plugin._test.getMessageServiceSource(
      'com.example',
      false
    );
    const withExpoNotifications = plugin._test.getMessageServiceSource(
      'com.example',
      true
    );
    expect(plugin._test.writeFileIfChanged(file, standalone)).toBe(true);
    expect(plugin._test.writeFileIfChanged(file, standalone)).toBe(false);
    // Adding expo-notifications without `prebuild --clean` regenerates the service.
    expect(plugin._test.writeFileIfChanged(file, withExpoNotifications)).toBe(
      true
    );
    expect(fs.readFileSync(file, 'utf-8')).toBe(withExpoNotifications);
  });

  test('fills extension templates and rejects unknown placeholders', () => {
    expect(
      plugin._test.fillTemplate(
        '<string>{{APP_VERSION}}</string> {{APP_GROUP_ID}}',
        { APP_VERSION: '1.2.3', APP_GROUP_ID: 'group.app' }
      )
    ).toBe('<string>1.2.3</string> group.app');
    expect(() => plugin._test.fillTemplate('{{APP_GROUP_ID}}', {})).toThrow(
      'No value for {{APP_GROUP_ID}}'
    );
  });

  test('extension templates take the bundle identifier from the build settings', () => {
    for (const target of [
      'ExponeaNotificationService',
      'ExponeaNotificationContent',
    ]) {
      const plist = fs.readFileSync(
        path.resolve(
          __dirname,
          '..',
          '..',
          'plugin',
          'ios',
          target,
          `${target}-Info.plist`
        ),
        'utf-8'
      );
      expect(plist).toContain(
        '<key>CFBundleIdentifier</key>\n\t<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>'
      );
      expect(plist).not.toContain('{{APP_BUNDLE_ID}}');
    }
  });
});

describe('Expo config plugin native pins', () => {
  const fs = require('fs');
  const path = require('path');
  const root = path.resolve(__dirname, '..', '..');

  test('reads the Android SDK pin from android/build.gradle', () => {
    expect(plugin._test.getNativeAndroidSdkDependency()).toMatch(
      /^com\.exponea\.sdk:sdk:\d+\.\d+\.\d+$/
    );
  });

  test('pins the extension pods to the core SDK version of the podspec', () => {
    const version = plugin._test.getNativeIosSdkVersion();
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    // The bare example pins its extensions to the same version.
    const podfile = fs.readFileSync(
      path.join(root, 'example', 'ios', 'Podfile'),
      'utf-8'
    );
    expect(podfile).toContain(`pod 'ExponeaSDK-Notifications', '${version}'`);
  });

  test('adds a pinned Podfile target once', () => {
    const podfile = "target 'App' do\nend\n";
    const result = plugin._test.addExtensionPodTarget(
      podfile,
      'ExponeaNotificationService',
      '5.0.0'
    );
    expect(result).toBe(
      "target 'App' do\nend\n\ntarget 'ExponeaNotificationService' do\n  pod 'ExponeaSDK-Notifications', '5.0.0'\nend\n"
    );
    expect(
      plugin._test.addExtensionPodTarget(
        result,
        'ExponeaNotificationService',
        '5.0.0'
      )
    ).toBe(result);
  });
});
