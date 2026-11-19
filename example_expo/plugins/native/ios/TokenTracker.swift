import UIKit
import React

/// Expo example helper: re-sends the current APNs push token to the SDK (iOS).
///
/// iOS counterpart of the Android TokenTracker helper module, behind the
/// "Track push token" button. Re-registering for remote notifications makes
/// UIKit call `application(_:didRegisterForRemoteNotificationsWithDeviceToken:)`
/// again, where the SDK config plugin forwards the token to
/// `Exponea.shared.handlePushNotificationToken`.
///
/// Do integrators need it? No. The SDK config plugin already tracks push tokens
/// automatically in the generated AppDelegate. This only lets the example
/// re-send the token on demand while testing.
@objc(TokenTracker)
class TokenTracker: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc func trackToken() {
    DispatchQueue.main.async {
      UIApplication.shared.registerForRemoteNotifications()
    }
  }
}
