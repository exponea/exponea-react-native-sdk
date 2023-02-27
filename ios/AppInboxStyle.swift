//
//  AppInboxStyle.swift
//  Exponea
//
//  Created by Adam Mihalik on 20/02/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

import Foundation

class AppInboxStyle {
    var appInboxButton: ButtonStyle?
    var detailView: DetailViewStyle?
    var listView: ListScreenStyle?

    init(appInboxButton: ButtonStyle? = nil, detailView: DetailViewStyle? = nil, listView: ListScreenStyle? = nil) {
        self.appInboxButton = appInboxButton
        self.detailView = detailView
        self.listView = listView
    }
}
