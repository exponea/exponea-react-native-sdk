// Load Expo's config-plugin helpers through the app's `expo` package
// (`expo/config-plugins`). This package doesn't depend on `@expo/config-plugins`
// directly, so that module isn't resolvable in isolated installs such as pnpm.
// Falls back to `@expo/config-plugins` for setups where it is installed directly.
function loadConfigPlugins() {
  let firstError;
  for (const request of ['expo/config-plugins', '@expo/config-plugins']) {
    for (const options of [undefined, { paths: [process.cwd()] }]) {
      try {
        return require(require.resolve(request, options));
      } catch (error) {
        firstError = firstError || error;
      }
    }
  }
  throw firstError;
}
const configPlugins = loadConfigPlugins();
const {
  withPlugins,
  withAppBuildGradle,
  withAndroidManifest,
  withAppDelegate,
  withDangerousMod,
  withEntitlementsPlist,
  withXcodeProject,
  WarningAggregator,
} = configPlugins;
const { writeFileSync, mkdirSync, existsSync, readFileSync } = require('fs');
const path = require('path');

const IPHONEOS_DEPLOYMENT_TARGET = '15.1';
const TARGETED_DEVICE_FAMILY = '"1,2"';

function resolveAppGroup(config, params) {
  if (params.appGroup) return params.appGroup;
  const groups =
    config.ios?.entitlements?.['com.apple.security.application-groups'];
  if (Array.isArray(groups) && groups.length > 0) return groups[0];
  if (params.enableRichPush) {
    throw new Error(
      '[react-native-exponea-sdk] Rich push requires an appGroup option or an iOS application-group entitlement.'
    );
  }
  return undefined;
}

// expo-notifications installs its own FCM service and notification center
// delegate, so the generated native code must cooperate with it when the app
// uses it. Only a dependency the app declares counts: in a monorepo, a copy
// hoisted from another workspace isn't linked into this app's native projects.
function hasExpoNotifications(projectRoot) {
  let packageJson;
  try {
    packageJson = JSON.parse(
      readFileSync(path.join(projectRoot, 'package.json'), 'utf-8')
    );
  } catch {
    return false;
  }
  const declared = ['dependencies', 'devDependencies'].some(
    (field) => packageJson[field] && packageJson[field]['expo-notifications']
  );
  if (!declared) return false;
  try {
    require.resolve('expo-notifications/package.json', {
      paths: [projectRoot],
    });
    return true;
  } catch {
    return false;
  }
}

// The SDK declares the native Exponea SDK as an `implementation` dependency, so
// app code that calls it directly needs the same version on its own classpath.
function getNativeAndroidSdkDependency() {
  const gradle = readFileSync(
    path.resolve(__dirname, 'android', 'build.gradle'),
    'utf-8'
  );
  const match = gradle.match(/['"](com\.exponea\.sdk:sdk:[^'"]+)['"]/);
  if (!match) {
    throw new Error(
      '[react-native-exponea-sdk] Cannot find the native Android SDK version.'
    );
  }
  return match[1];
}

// The notification extensions must use the ExponeaSDK-Notifications version that
// matches the core SDK pinned in the podspec. A mismatch doesn't break
// notification display, but silently stops delivery tracking.
function getNativeIosSdkVersion() {
  const podspec = readFileSync(
    path.resolve(__dirname, 'react-native-exponea-sdk.podspec'),
    'utf-8'
  );
  const match = podspec.match(
    /s\.dependency\s+["']ExponeaSDK["']\s*,\s*["']([^"']+)["']/
  );
  if (!match) {
    throw new Error(
      '[react-native-exponea-sdk] Cannot find the native iOS SDK version.'
    );
  }
  return match[1];
}

// Writes a plugin-owned file, but only when its content changes: an unchanged
// prebuild leaves the file alone, and a changed mode (for example adding or
// removing expo-notifications without `prebuild --clean`) regenerates it.
function writeFileIfChanged(filePath, contents) {
  if (existsSync(filePath) && readFileSync(filePath, 'utf-8') === contents) {
    return false;
  }
  writeFileSync(filePath, contents);
  return true;
}

// Fills the `{{NAME}}` placeholders of an extension template. A placeholder
// without a value is a plugin bug, so it fails instead of reaching the project.
function fillTemplate(template, values) {
  return template.replace(/\{\{(\w+)\}\}/g, (placeholder, name) => {
    if (values[name] === undefined) {
      throw new Error(
        `[react-native-exponea-sdk] No value for ${placeholder} in a notification extension template.`
      );
    }
    return values[name];
  });
}

// ---------------------------------------------------------------------------
// iOS: Xcode helpers
// ---------------------------------------------------------------------------
function normalizePbxValue(value) {
  return typeof value === 'string' ? value.replace(/"/g, '') : value;
}

function isPbxCommentKey(key) {
  return key.endsWith('_comment');
}

function findNativeTargetByName(xcodeProject, name) {
  const targets = xcodeProject.pbxNativeTargetSection();
  for (const key of Object.keys(targets)) {
    if (isPbxCommentKey(key)) continue;
    const target = targets[key];
    if (typeof target === 'object' && normalizePbxValue(target.name) === name) {
      return { uuid: key, target };
    }
  }
  return null;
}

function findAppNativeTarget(xcodeProject, appName, excludeName) {
  const targets = xcodeProject.pbxNativeTargetSection();
  const entries = Object.keys(targets)
    .filter((key) => !isPbxCommentKey(key))
    .map((key) => ({ uuid: key, target: targets[key] }))
    .filter(({ target }) => typeof target === 'object');

  let appTarget = entries.find(
    ({ target }) =>
      normalizePbxValue(target.productType) ===
      'com.apple.product-type.application'
  );
  if (!appTarget && appName) {
    appTarget = entries.find(
      ({ target }) => normalizePbxValue(target.name) === appName
    );
  }
  if (!appTarget) {
    appTarget = entries.find(
      ({ target }) =>
        target.name && normalizePbxValue(target.name) !== excludeName
    );
  }
  return appTarget || null;
}

function ensureNseEmbeddedInAppTarget(xcodeProject, nseTargetName, appName) {
  const nseTargetEntry = findNativeTargetByName(xcodeProject, nseTargetName);
  const appTargetEntry = findAppNativeTarget(
    xcodeProject,
    appName,
    nseTargetName
  );
  if (!appTargetEntry || !nseTargetEntry) {
    return false;
  }

  const productReference = nseTargetEntry.target.productReference;
  const buildFiles = xcodeProject.hash.project.objects.PBXBuildFile || {};
  const copyFilesPhases =
    xcodeProject.hash.project.objects.PBXCopyFilesBuildPhase || {};
  const appBuildPhaseIds = (appTargetEntry.target.buildPhases || [])
    .map((phase) => (typeof phase === 'string' ? phase : phase.value))
    .filter(Boolean);

  let hasEmbeddedExtension = false;
  const buildFileIds = Object.keys(buildFiles)
    .filter((key) => !isPbxCommentKey(key))
    .filter((key) => buildFiles[key].fileRef === productReference);

  for (const phaseId of Object.keys(copyFilesPhases)) {
    if (isPbxCommentKey(phaseId)) continue;
    if (!appBuildPhaseIds.includes(phaseId)) continue;
    const phase = copyFilesPhases[phaseId];
    if (!phase) continue;
    const dst = normalizePbxValue(phase.dstSubfolderSpec);
    if (dst !== 13 && dst !== '13') continue;
    const phaseFiles = (phase.files || [])
      .map((file) => (typeof file === 'string' ? file : file.value))
      .filter(Boolean);
    if (buildFileIds.some((id) => phaseFiles.includes(id))) {
      hasEmbeddedExtension = true;
      break;
    }
  }

  if (!hasEmbeddedExtension) {
    xcodeProject.addBuildPhase(
      [`${nseTargetName}.appex`],
      'PBXCopyFilesBuildPhase',
      'Embed App Extensions',
      appTargetEntry.uuid,
      {
        dstSubfolderSpec: 13,
        dstPath: '',
      }
    );
    return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Android: Update android/app/build.gradle
// ---------------------------------------------------------------------------
// Adds Firebase Messaging (and, with expo-notifications, the native SDK) to a
// Groovy android/app/build.gradle. Throws instead of guessing when the
// `defaultConfig {` or `dependencies {` block can't be found.
function patchAppBuildGradle(contents, nativeSdkDependency) {
  const lines = contents.split('\n');

  // Guard: don't add duplicates
  const addFirebase = !contents.includes(
    'com.google.firebase:firebase-messaging'
  );
  const addNativeSdk =
    Boolean(nativeSdkDependency) && !contents.includes(nativeSdkDependency);
  if (!addFirebase && !addNativeSdk) {
    return contents;
  }

  const configIndex = lines.findIndex((line) =>
    /defaultConfig\s*\{/.test(line)
  );
  const dependenciesIndex = lines.findIndex((line) =>
    /^\s*dependencies\s*\{/.test(line)
  );
  if (
    configIndex === -1 ||
    dependenciesIndex === -1 ||
    dependenciesIndex < configIndex
  ) {
    throw new Error(
      '[react-native-exponea-sdk] Cannot find the `defaultConfig {` and `dependencies {` blocks in android/app/build.gradle.'
    );
  }

  return [
    ...lines.slice(0, configIndex + 1),
    ...(addFirebase ? ['        multiDexEnabled true'] : []),
    ...lines.slice(configIndex + 1, dependenciesIndex + 1),
    ...(addFirebase
      ? ['    implementation("com.google.firebase:firebase-messaging:24.0.0")']
      : []),
    ...(addNativeSdk ? [`    implementation("${nativeSdkDependency}")`] : []),
    ...lines.slice(dependenciesIndex + 1),
  ].join('\n');
}

function withExponeaBuildGradle(config, { expoNotifications }) {
  return withAppBuildGradle(config, async (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error(
        `[react-native-exponea-sdk] Only a Groovy android/app/build.gradle is supported, found ${cfg.modResults.language}.`
      );
    }
    // The generated MessageService checks the payload with the native SDK
    // before handing other messages to expo-notifications.
    const nativeSdkDependency = expoNotifications
      ? getNativeAndroidSdkDependency()
      : null;
    cfg.modResults.contents = patchAppBuildGradle(
      cfg.modResults.contents,
      nativeSdkDependency
    );
    return cfg;
  });
}

// ---------------------------------------------------------------------------
// Android: Update AndroidManifest.xml
// ---------------------------------------------------------------------------
function withExponeaAndroidManifest(config) {
  return withAndroidManifest(config, async (cfg) => {
    const application = cfg.modResults.manifest.application[0];
    if (!application.service) {
      application.service = [];
    }

    // Guard: don't add duplicates
    const alreadyRegistered = application.service.some(
      (s) => s.$ && s.$['android:name'] === '.MessageService'
    );
    if (alreadyRegistered) {
      return cfg;
    }

    application.service.push({
      '$': {
        'android:name': '.MessageService',
        'android:exported': 'false',
      },
      'intent-filter': [
        {
          action: {
            $: {
              'android:name': 'com.google.firebase.MESSAGING_EVENT',
            },
          },
        },
      ],
    });
    return cfg;
  });
}

// ---------------------------------------------------------------------------
// Android: Generate MessageService.java
// ---------------------------------------------------------------------------
function getMessageServiceSource(packageName, expoNotifications) {
  if (expoNotifications) {
    // Firebase delivers MESSAGING_EVENT to one service only. Extend
    // expo-notifications' service so non-Exponea messages and token refreshes
    // still reach it.
    return `package ${packageName};

import android.app.NotificationManager;
import android.content.Context;
import androidx.annotation.NonNull;
import com.exponea.ExponeaModule;
import com.exponea.sdk.Exponea;
import com.google.firebase.messaging.RemoteMessage;
import expo.modules.notifications.service.ExpoFirebaseMessagingService;

public class MessageService extends ExpoFirebaseMessagingService {

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        if (!Exponea.INSTANCE.isExponeaPushNotification(remoteMessage.getData())) {
            super.onMessageReceived(remoteMessage);
            return;
        }
        ExponeaModule.Companion.handleRemoteMessage(
                getApplicationContext(),
                remoteMessage.getData(),
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE),
                true);
    }

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        ExponeaModule.Companion.handleNewToken(
                getApplicationContext(),
                token);
    }
}
`;
  }
  return `package ${packageName};

import android.app.NotificationManager;
import android.content.Context;
import androidx.annotation.NonNull;
import com.exponea.ExponeaModule;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MessageService extends FirebaseMessagingService {

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        ExponeaModule.Companion.handleRemoteMessage(
                getApplicationContext(),
                remoteMessage.getData(),
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE),
                true);
    }

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        ExponeaModule.Companion.handleNewToken(
                getApplicationContext(),
                token);
    }
}
`;
}

function withExponeaAndroidMessageService(config, { expoNotifications }) {
  return withDangerousMod(config, [
    'android',
    (cfg) => {
      const androidProjRoot = cfg.modRequest.platformProjectRoot;
      const packageName = cfg.android.package;
      const pathToDir = packageName.replace(/\./g, '/');
      const dirPath = `${androidProjRoot}/app/src/main/java/${pathToDir}`;
      mkdirSync(dirPath, { recursive: true });

      // The service is plugin-owned: rewriting it keeps the generated class in
      // step with the app's expo-notifications setup.
      writeFileIfChanged(
        `${dirPath}/MessageService.java`,
        getMessageServiceSource(packageName, expoNotifications)
      );
      return cfg;
    },
  ]);
}

// ---------------------------------------------------------------------------
// iOS: Swift AppDelegate helpers
// ---------------------------------------------------------------------------
// Inserts code before the closing brace of the AppDelegate class, which is the
// first top-level closing brace in the Expo template.
function insertBeforeAppDelegateEnd(contents, code) {
  return contents.replace(/\n\}[ \t]*$/m, `\n\n${code}\n}`);
}

// Returns the body offsets of the first function whose declaration (up to and
// including its opening brace) matches the expression.
function findSwiftFunction(contents, declarationRegexp) {
  const match = declarationRegexp.exec(contents);
  if (!match) return null;
  const openBrace = match.index + match[0].length - 1;
  let depth = 0;
  for (let i = openBrace; i < contents.length; i++) {
    if (contents[i] === '{') {
      depth++;
    } else if (contents[i] === '}' && --depth === 0) {
      return { match, bodyStart: openBrace + 1, bodyEnd: i };
    }
  }
  return null;
}

// Calls Exponea at the start of an ExpoAppDelegate override and makes sure the
// override still calls super, which forwards to ExpoAppDelegateSubscribers.
function patchAppDelegateOverride(contents, { declaration, stub, patch }) {
  if (!declaration.test(contents)) {
    contents = insertBeforeAppDelegateEnd(contents, stub);
  }
  const fn = findSwiftFunction(contents, declaration);
  if (!fn) return contents;
  const body = contents.slice(fn.bodyStart, fn.bodyEnd);
  const { exponeaCall, superCall } = patch(fn.match, body);
  let newBody = `\n    ${exponeaCall}${body}`;
  if (superCall) {
    newBody = `${newBody.replace(/\s*$/, '')}\n    ${superCall}\n  `;
  }
  return contents.slice(0, fn.bodyStart) + newBody + contents.slice(fn.bodyEnd);
}

// `class AppDelegate: <superclass and protocols> {`, with optional attributes
// and modifiers. Group 1 is everything up to the inheritance list, group 2 the
// list itself.
const APP_DELEGATE_DECLARATION =
  /^([ \t]*(?:@\w+[ \t]+)*(?:(?:public|internal|open|final)[ \t]+)*class[ \t]+AppDelegate[ \t]*:[ \t]*)([^{\n]+?)[ \t]*\{/m;
const DID_RECEIVE_DECLARATION =
  /func userNotificationCenter\(\s*_ (\w+): UNUserNotificationCenter,\s*didReceive (\w+): UNNotificationResponse,\s*withCompletionHandler (\w+): @escaping \(\) -> Void\s*\)\s*\{/;
const WILL_PRESENT_DECLARATION =
  /func userNotificationCenter\(\s*_ (\w+): UNUserNotificationCenter,\s*willPresent (\w+): UNNotification,\s*withCompletionHandler (\w+): @escaping \(UNNotificationPresentationOptions\) -> Void\s*\)\s*\{/;
const REGISTER_TOKEN_DECLARATION =
  /func application\(\s*_ (\w+): UIApplication,\s*didRegisterForRemoteNotificationsWithDeviceToken (\w+): Data\s*\)\s*\{/;
const RECEIVE_PUSH_DECLARATION =
  /func application\(\s*_ (\w+): UIApplication,\s*didReceiveRemoteNotification (\w+): \[AnyHashable\s*:\s*Any\],\s*fetchCompletionHandler (\w+): @escaping \(UIBackgroundFetchResult\) -> Void\s*\)\s*\{/;
const DID_FINISH_LAUNCHING_DECLARATION =
  /func application\(\s*_ (\w+): UIApplication,\s*didFinishLaunchingWithOptions (\w+): \[UIApplication\.LaunchOptionsKey: Any\]\?(?:\s*=\s*nil)?\s*\)\s*-> Bool\s*\{/;
const CONTINUE_ACTIVITY_DECLARATION =
  /func application\(\s*_ (\w+): UIApplication,\s*continue (\w+): NSUserActivity,\s*restorationHandler(?: \w+)?: @escaping \(\[UIUserActivityRestoring\]\?\) -> Void\s*\)\s*-> Bool\s*\{/;

// With expo-notifications, its NotificationCenterManager owns the
// UNUserNotificationCenter delegate; Exponea registers as one of its delegates.
// The delegate is a singleton so that it stays alive however the manager stores
// its delegates.
const EXPONEA_NOTIFICATION_DELEGATE = `
// Forwards notification responses to Exponea. expo-notifications owns the
// UNUserNotificationCenter delegate and foreground presentation.
final class ExponeaNotificationDelegate: NotificationDelegate {
  static let shared = ExponeaNotificationDelegate()

  func didReceive(_ response: UNNotificationResponse, completionHandler: @escaping () -> Void) -> Bool {
    Exponea.shared.handlePushNotificationOpened(response: response)
    // Not handled, so expo-notifications still delivers the response to its listeners.
    return false
  }
}
`;

function modifySwiftAppDelegate(contents, { expoNotifications = false } = {}) {
  // Guard: don't modify if already patched. A file patched for the other
  // expo-notifications setup would keep native code for the wrong mode, so it
  // is an error rather than a silent skip.
  if (contents.includes('Exponea.shared.handlePushNotificationToken')) {
    const patchedForExpoNotifications = contents.includes(
      'class ExponeaNotificationDelegate'
    );
    if (patchedForExpoNotifications !== expoNotifications) {
      throw new Error(
        `[react-native-exponea-sdk] AppDelegate.swift was generated ${patchedForExpoNotifications ? 'with' : 'without'} expo-notifications, but the app now ${expoNotifications ? 'lists' : "doesn't list"} it. Run \`npx expo prebuild --clean\` to regenerate the native projects.`
      );
    }
    return contents;
  }

  // Step 1: import required modules
  const importLines = [];
  if (!contents.includes('import UserNotifications')) {
    importLines.push('import UserNotifications');
  }
  if (!contents.includes('import ExponeaSDK')) {
    importLines.push('import ExponeaSDK');
  }
  if (expoNotifications && !/import ExpoNotifications\b/.test(contents)) {
    // Match the template's access level for the Expo import, if any.
    importLines.push(
      contents.includes('internal import Expo')
        ? 'internal import ExpoNotifications'
        : 'import ExpoNotifications'
    );
  }
  if (importLines.length > 0) {
    contents = importLines.join('\n') + '\n' + contents;
  }

  // Step 2: Register as UNUserNotificationCenterDelegate. The delegate
  // assignment below needs the conformance, so a declaration we can't find is
  // an error rather than a silent skip.
  if (!expoNotifications) {
    const declaration = APP_DELEGATE_DECLARATION.exec(contents);
    if (!declaration) {
      throw new Error(
        '[react-native-exponea-sdk] Cannot find `class AppDelegate: ...` in AppDelegate.swift.'
      );
    }
    if (!/\bUNUserNotificationCenterDelegate\b/.test(declaration[2])) {
      contents = contents.replace(
        APP_DELEGATE_DECLARATION,
        '$1$2, UNUserNotificationCenterDelegate {'
      );
    }
  }

  // Step 3: Install the notification delegate at the start of
  // didFinishLaunching, before React Native starts and before ExpoAppDelegate
  // forwards the launch to its subscribers. Without the override the delegate
  // is never set, so a missing one is an error rather than a silent skip.
  const delegateSetup = expoNotifications
    ? 'NotificationCenterManager.shared.addDelegate(ExponeaNotificationDelegate.shared)'
    : 'UNUserNotificationCenter.current().delegate = self';
  if (!contents.includes(delegateSetup)) {
    const launch = findSwiftFunction(
      contents,
      DID_FINISH_LAUNCHING_DECLARATION
    );
    if (!launch) {
      throw new Error(
        '[react-native-exponea-sdk] Cannot find `application(_:didFinishLaunchingWithOptions:)` in AppDelegate.swift.'
      );
    }
    contents =
      contents.slice(0, launch.bodyStart) +
      `\n    ${delegateSetup}` +
      contents.slice(launch.bodyStart);
  }

  if (expoNotifications) {
    if (!contents.includes('class ExponeaNotificationDelegate')) {
      contents = contents.replace(/\s*$/, '\n') + EXPONEA_NOTIFICATION_DELEGATE;
    }
  } else {
    // Step 4: Track notification opens in the didReceive response handler.
    if (!DID_RECEIVE_DECLARATION.test(contents)) {
      contents = insertBeforeAppDelegateEnd(
        contents,
        `  public func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    completionHandler()
  }`
      );
    }
    const didReceive = findSwiftFunction(contents, DID_RECEIVE_DECLARATION);
    if (didReceive) {
      const response = didReceive.match[2];
      const call = `Exponea.shared.handlePushNotificationOpened(response: ${response})`;
      const body = contents.slice(didReceive.bodyStart, didReceive.bodyEnd);
      if (!body.includes(call)) {
        contents =
          contents.slice(0, didReceive.bodyStart) +
          `\n    ${call}` +
          contents.slice(didReceive.bodyStart);
      }
    }

    // Step 5: Show notifications while the app is in the foreground.
    if (!WILL_PRESENT_DECLARATION.test(contents)) {
      contents = insertBeforeAppDelegateEnd(
        contents,
        `  public func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    completionHandler([.banner, .list, .sound])
  }`
      );
    }
  }

  // Step 6: Track the push token, then let ExpoAppDelegate forward it
  contents = patchAppDelegateOverride(contents, {
    declaration: REGISTER_TOKEN_DECLARATION,
    stub: `  public override func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
  }`,
    patch: ([, application, deviceToken], body) => ({
      exponeaCall: `Exponea.shared.handlePushNotificationToken(deviceToken: ${deviceToken})`,
      superCall: body.includes('super.application(')
        ? null
        : `super.application(${application}, didRegisterForRemoteNotificationsWithDeviceToken: ${deviceToken})`,
    }),
  });

  // Step 7: Handle remote notifications; super owns the completion handler
  contents = patchAppDelegateOverride(contents, {
    declaration: RECEIVE_PUSH_DECLARATION,
    stub: `  public override func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
  }`,
    patch: ([, application, userInfo, completionHandler], body) => ({
      exponeaCall: `Exponea.shared.handlePushNotificationOpened(userInfo: ${userInfo})`,
      superCall:
        body.includes('super.application(') ||
        body.includes(`${completionHandler}(`)
          ? null
          : `super.application(${application}, didReceiveRemoteNotification: ${userInfo}, fetchCompletionHandler: ${completionHandler})`,
    }),
  });

  // Step 8: Track universal-link campaign clicks before Expo and React Native
  // handle the URL. handleUniversalLink ignores activities that aren't universal
  // links. The template's override returns true for universal links through
  // RCTLinkingManager, which keeps the native SDK from delivering links it opens
  // itself a second time through the scene delegate.
  if (!contents.includes('Exponea.shared.handleUniversalLink(')) {
    const match = CONTINUE_ACTIVITY_DECLARATION.exec(contents);
    if (match) {
      const [declaration, , userActivity] = match;
      contents = contents.replace(
        declaration,
        () =>
          `${declaration}\n    Exponea.shared.handleUniversalLink(${userActivity})`
      );
    } else {
      WarningAggregator.addWarningIOS(
        'react-native-exponea-sdk',
        'AppDelegate.swift has no application(_:continue:restorationHandler:) override, so universal link campaign clicks are not tracked. Add the override and call Exponea.shared.handleUniversalLink(_:) from it.'
      );
    }
  }

  return contents;
}

// ---------------------------------------------------------------------------
// iOS: Modify AppDelegate.swift
// ---------------------------------------------------------------------------
// Expo SDK 57 generates a Swift AppDelegate. The Objective-C AppDelegate APIs
// this plugin used to patch (ExponeaRNAppDelegate, EXAppDelegateWrapper) no
// longer exist, so an Objective-C AppDelegate is rejected with a clear error.
function assertSwiftAppDelegate(language) {
  if (language !== 'swift') {
    throw new Error(
      `[react-native-exponea-sdk] Only a Swift AppDelegate is supported (Expo SDK 57 generates AppDelegate.swift), found ${language}.`
    );
  }
}

function withExponeaAppDelegate(config, { expoNotifications }) {
  return withAppDelegate(config, (cfg) => {
    assertSwiftAppDelegate(cfg.modResults.language);
    cfg.modResults.contents = modifySwiftAppDelegate(cfg.modResults.contents, {
      expoNotifications,
    });
    return cfg;
  });
}

// The app group is passed to the mods as a plugin parameter rather than stored
// on the config, because the config is embedded in the app as its manifest.
function withExponeaAppGroupEntitlement(config, appGroup) {
  return withEntitlementsPlist(config, (cfg) => {
    if (!appGroup) return cfg;
    const key = 'com.apple.security.application-groups';
    const groups = cfg.modResults[key] || [];
    if (!groups.includes(appGroup)) {
      cfg.modResults[key] = [...groups, appGroup];
    }
    return cfg;
  });
}

// ---------------------------------------------------------------------------
// iOS: Notification extensions (rich push, opt-in)
// ---------------------------------------------------------------------------
// Both extensions are generated the same way from the templates in
// plugin/ios/<targetName>: a folder next to the Xcode project, an app-extension
// target embedded in the app, and a Podfile target whose
// ExponeaSDK-Notifications pod is pinned to the core SDK version.
const NOTIFICATION_SERVICE_EXTENSION = {
  targetName: 'ExponeaNotificationService',
  sourceFile: 'NotificationService.swift',
};
const NOTIFICATION_CONTENT_EXTENSION = {
  targetName: 'ExponeaNotificationContent',
  sourceFile: 'NotificationViewController.swift',
};

function extensionFiles({ targetName, sourceFile }) {
  return [`${targetName}.entitlements`, `${targetName}-Info.plist`, sourceFile];
}

function withExponeaNotificationExtensionFolder(config, extension) {
  return withDangerousMod(config, [
    'ios',
    (cfg) => {
      const { targetName, appGroup } = extension;
      const folder = path.resolve(
        cfg.modRequest.platformProjectRoot,
        targetName
      );
      mkdirSync(folder, { recursive: true });
      const templateDir = path.resolve(__dirname, 'plugin', 'ios', targetName);
      const values = {
        APP_GROUP_ID: appGroup,
        APP_VERSION: cfg.version || '1.0.0',
        IOS_BUILD_NUMBER: cfg.ios?.buildNumber || '1',
      };
      for (const file of extensionFiles(extension)) {
        writeFileSync(
          path.resolve(folder, file),
          fillTemplate(
            readFileSync(path.resolve(templateDir, file), 'utf-8'),
            values
          )
        );
      }
      return cfg;
    },
  ]);
}

function withExponeaNotificationExtensionXcodeTarget(config, extension) {
  return withXcodeProject(config, (cfg) => {
    const { targetName, sourceFile } = extension;
    const bundleIdentifier = cfg.ios?.bundleIdentifier || 'com.example.app';
    const project = cfg.modResults;
    if (!findNativeTargetByName(project, targetName)) {
      // Create the extension's PBXGroup under the top-level group
      const group = project.addPbxGroup(
        extensionFiles(extension),
        targetName,
        targetName
      );
      const groups = project.hash.project.objects.PBXGroup;
      const rootGroupId = Object.keys(groups).find(
        (key) =>
          !isPbxCommentKey(key) &&
          typeof groups[key] === 'object' &&
          groups[key].name === undefined &&
          groups[key].path === undefined
      );
      if (rootGroupId) project.addToPbxGroup(group.uuid, rootGroupId);

      // Workaround for cordova-node-xcode bug with single-target projects
      const objects = project.hash.project.objects;
      objects.PBXTargetDependency = objects.PBXTargetDependency || {};
      objects.PBXContainerItemProxy = objects.PBXContainerItemProxy || {};

      const target = project.addTarget(
        targetName,
        'app_extension',
        targetName,
        `${bundleIdentifier}.${targetName}`
      );
      project.addBuildPhase(
        [sourceFile],
        'PBXSourcesBuildPhase',
        'Sources',
        target.uuid
      );
      project.addBuildPhase(
        [],
        'PBXResourcesBuildPhase',
        'Resources',
        target.uuid
      );
      project.addBuildPhase(
        [],
        'PBXFrameworksBuildPhase',
        'Frameworks',
        target.uuid
      );

      const configurations = project.pbxXCBuildConfigurationSection();
      for (const key of Object.keys(configurations)) {
        const settings = configurations[key].buildSettings;
        if (settings?.PRODUCT_NAME === `"${targetName}"`) {
          settings.IPHONEOS_DEPLOYMENT_TARGET = IPHONEOS_DEPLOYMENT_TARGET;
          settings.TARGETED_DEVICE_FAMILY = TARGETED_DEVICE_FAMILY;
          settings.CODE_SIGN_ENTITLEMENTS = `${targetName}/${targetName}.entitlements`;
          settings.INFOPLIST_FILE = `${targetName}/${targetName}-Info.plist`;
          settings.PRODUCT_BUNDLE_IDENTIFIER = `${bundleIdentifier}.${targetName}`;
          settings.CODE_SIGN_STYLE = 'Automatic';
          settings.SWIFT_VERSION = '5.0';
        }
      }
    }
    ensureNseEmbeddedInAppTarget(project, targetName, cfg.name);
    return cfg;
  });
}

// Adds the extension's Podfile target unless the Podfile already has one.
function addExtensionPodTarget(contents, targetName, version) {
  if (contents.includes(`target '${targetName}'`)) return contents;
  return `${contents}\ntarget '${targetName}' do\n  pod 'ExponeaSDK-Notifications', '${version}'\nend\n`;
}

function withExponeaNotificationExtensionPodfile(config, extension) {
  return withDangerousMod(config, [
    'ios',
    (cfg) => {
      const podfilePath = path.resolve(
        cfg.modRequest.platformProjectRoot,
        'Podfile'
      );
      const contents = readFileSync(podfilePath, 'utf-8');
      const patched = addExtensionPodTarget(
        contents,
        extension.targetName,
        getNativeIosSdkVersion()
      );
      if (patched !== contents) writeFileSync(podfilePath, patched);
      return cfg;
    },
  ]);
}

function withExponeaNotificationExtension(config, extension) {
  return withPlugins(config, [
    [withExponeaNotificationExtensionFolder, extension],
    [withExponeaNotificationExtensionXcodeTarget, extension],
    [withExponeaNotificationExtensionPodfile, extension],
  ]);
}

// ---------------------------------------------------------------------------
// Main plugin export
// ---------------------------------------------------------------------------
/**
 * Expo Config Plugin for react-native-exponea-sdk.
 *
 * Usage in app.json:
 *   "plugins": ["react-native-exponea-sdk"]
 *
 * With rich push (iOS Notification Service Extension):
 *   "plugins": [["react-native-exponea-sdk", { "enableRichPush": true }]]
 *
 * Supports: EAS Build and custom dev clients only.
 * Expo Go is NOT supported (custom native modules cannot load in Expo Go).
 */
const withExponea = (config, params = {}) => {
  if (params.enableNotificationContentExtension && !params.enableRichPush) {
    throw new Error(
      '[react-native-exponea-sdk] enableNotificationContentExtension requires enableRichPush.'
    );
  }
  const appGroup = resolveAppGroup(config, params);
  // Checked once per prebuild: the Gradle dependencies, the Android message
  // service and the AppDelegate all depend on it.
  const expoNotifications = hasExpoNotifications(
    config._internal?.projectRoot || process.cwd()
  );
  const plugins = [
    [withExponeaBuildGradle, { expoNotifications }],
    withExponeaAndroidManifest,
    [withExponeaAndroidMessageService, { expoNotifications }],
    [withExponeaAppDelegate, { expoNotifications }],
  ];

  if (appGroup) {
    plugins.push([withExponeaAppGroupEntitlement, appGroup]);
  }

  if (params.enableRichPush) {
    plugins.push([
      withExponeaNotificationExtension,
      { ...NOTIFICATION_SERVICE_EXTENSION, appGroup },
    ]);
  }
  if (params.enableNotificationContentExtension) {
    plugins.push([
      withExponeaNotificationExtension,
      NOTIFICATION_CONTENT_EXTENSION,
    ]);
  }

  return withPlugins(config, plugins);
};

module.exports = withExponea;
module.exports._test = {
  addExtensionPodTarget,
  assertSwiftAppDelegate,
  ensureNseEmbeddedInAppTarget,
  fillTemplate,
  findNativeTargetByName,
  getMessageServiceSource,
  getNativeAndroidSdkDependency,
  getNativeIosSdkVersion,
  hasExpoNotifications,
  modifySwiftAppDelegate,
  patchAppBuildGradle,
  resolveAppGroup,
  writeFileIfChanged,
};
