//
//  ProgressBarStyle.swift
//  Exponea
//
//  Created by Adam Mihalik on 20/02/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

import Foundation
import UIKit

class ProgressBarStyle {
    var visible: Bool?
    var progressColor: String?
    var backgroundColor: String?

    init(visible: Bool? = nil, progressColor: String? = nil, backgroundColor: String? = nil) {
        self.visible = visible
        self.progressColor = progressColor
        self.backgroundColor = backgroundColor
    }

    func applyTo(_ target: UIActivityIndicatorView) {
        if let visible = visible {
            target.isHidden = !visible
        }
        if let progressColor = UIColor.parse(progressColor) {
            target.tintColor = progressColor
        }
        if let backgroundColor = UIColor.parse(backgroundColor) {
            target.backgroundColor = backgroundColor
        }
    }
}