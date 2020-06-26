//
//  NotificationService.swift
//  exampleNotificationService
//
//  Created by Juraj Dudak on 26/06/2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import UserNotifications
import ExponeaSDK_Notifications

class NotificationService: UNNotificationServiceExtension {
  let exponeaService = ExponeaNotificationService(
      appGroup: "group.com.exponea.ExponeaSDK-Example2"
  )

  override func didReceive(
      _ request: UNNotificationRequest,
      withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
  ) {
      exponeaService.process(request: request, contentHandler: contentHandler)
  }

  override func serviceExtensionTimeWillExpire() {
      exponeaService.serviceExtensionTimeWillExpire()
  }
}
