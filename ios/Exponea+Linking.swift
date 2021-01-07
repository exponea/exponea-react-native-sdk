//
//  Exponea+Linking.swift
//  Exponea
//
//  Created by Panaxeo on 07/01/2021.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation

extension Exponea {
    @objc(continueUserActivity:)
    static func continueUserActivity(userActivity: NSUserActivity) {
        guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
            let incomingURL = userActivity.webpageURL
            else { return }
        Exponea.exponeaInstance.trackCampaignClick(url: incomingURL, timestamp: nil)
    }
}
