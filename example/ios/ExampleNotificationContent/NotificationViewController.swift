//
//  NotificationViewController.swift
//  exponeaNotificationContent
//
//  Created by Juraj Dudak on 26/06/2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import UIKit
import UserNotifications
import UserNotificationsUI
import ExponeaSDK_Notifications

class NotificationViewController: UIViewController, UNNotificationContentExtension {
  let exponeaService = ExponeaNotificationContentService()

  func didReceive(_ notification: UNNotification) {
      exponeaService.didReceive(notification, context: extensionContext, viewController: self)
  }
}
