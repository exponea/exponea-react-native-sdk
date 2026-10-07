import UIKit
import React
import ExponeaSDK
import class react_native_exponea_sdk.ExponeaSceneHandler

/// UIScene lifecycle entry point. `ExponeaSceneDelegate` tracks universal links
/// (cold launch in `willConnectTo`, warm launch in `continue`) as long as `super` is called.
class SceneDelegate: ExponeaSceneDelegate {
  var window: UIWindow?

  override func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    super.scene(scene, willConnectTo: session, options: connectionOptions)

    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory else {
      return
    }

    let window = UIWindow(windowScene: windowScene)
    self.window = window

    // Under UIScene, launchOptions from didFinishLaunchingWithOptions don't contain the launch URL.
    // Rebuild them from connectionOptions so that Linking.getInitialURL() works on cold launch.
    factory.startReactNative(
      withModuleName: "ExponeaExample",
      in: window,
      launchOptions: ExponeaSceneHandler.launchOptions(from: connectionOptions)
    )
  }

  // MARK: - Universal Links (warm launch)

  override func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    super.scene(scene, continue: userActivity)
    RCTLinkingManager.application(
      UIApplication.shared,
      continue: userActivity,
      restorationHandler: { _ in }
    )
  }

  // MARK: - Custom URL Schemes (warm launch)

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    for context in URLContexts {
      var options: [UIApplication.OpenURLOptionsKey: Any] = [:]
      if let sourceApplication = context.options.sourceApplication {
        options[.sourceApplication] = sourceApplication
      }
      RCTLinkingManager.application(UIApplication.shared, open: context.url, options: options)
    }
  }
}
