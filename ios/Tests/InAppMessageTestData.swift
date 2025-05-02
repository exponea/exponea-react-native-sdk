//
//  InAppMessageTestData.swift
//  Tests
//
//  Created by Adam Mihalik on 15/10/2024.
//  Copyright © 2024 Facebook. All rights reserved.
//

import Foundation
import struct ExponeaSDK.DateFilter
import struct ExponeaSDK.EventFilter
import struct ExponeaSDK.InAppMessage
import struct ExponeaSDK.InAppMessagePayloadButton
import struct ExponeaSDK.InAppMessagePayload
import struct ExponeaSDK.InAppMessageButton
import enum ExponeaSDK.InAppMessageType

struct InAppMessageTestData {
    static func buildInAppMessage(
        id: String? = nil,
        dateFilter: DateFilter? = nil,
        trigger: EventFilter? = nil,
        frequency: String? = nil,
        imageUrl: String? = nil,
        priority: Int? = nil,
        timeout: Int? = nil,
        delay: Int? = nil,
        type: InAppMessageType = .modal
    ) -> InAppMessage {
        var payload: InAppMessagePayload?
        var payloadHtml: String?
        if type == .freeform {
            payloadHtml = """
            <html>
            <head>
            <style>
            .css-image {
                background-image: url('https://i.ytimg.com/vi/t4nM1FoUqYs/maxresdefault.jpg')
            }
            </style>
            </head>
            <body>
                <img src='https://i.ytimg.com/vi/t4nM1FoUqYs/maxresdefault.jpg'/>
                <div data-actiontype='close'>Close</div>
                <div data-link='https://someaddress.com'>Action 1</div>
            </body>
            </html>
            """
        } else {
            payload = InAppMessagePayload(
                imageUrl: imageUrl ?? "https://i.ytimg.com/vi/t4nM1FoUqYs/maxresdefault.jpg",
                title: "filip.vozar@exponea.com",
                titleTextColor: "#000000",
                titleTextSize: "22px",
                bodyText: "This is an example of your in-app message body text.",
                bodyTextColor: "#000000",
                bodyTextSize: "14px",
                buttons: [
                    InAppMessagePayloadButton(
                        buttonText: "Action",
                        rawButtonType: "deep-link",
                        buttonLink: "https://someaddress.com",
                        buttonTextColor: "#ffffff",
                        buttonBackgroundColor: "#f44cac"
                    ),
                    InAppMessagePayloadButton(
                        buttonText: "Cancel",
                        rawButtonType: "cancel",
                        buttonLink: nil,
                        buttonTextColor: "#ffffff",
                        buttonBackgroundColor: "#f44cac"
                    )
                ],
                backgroundColor: "#ffffff",
                closeButtonColor: "#ffffff",
                messagePosition: nil,
                textPosition: nil,
                textOverImage: nil
            )
        }
        return InAppMessage(
            id: id ?? "5dd86f44511946ea55132f29",
            name: "Test serving in-app message",
            rawMessageType: type.rawValue,
            rawFrequency: frequency ?? "unknown",
            oldPayload: payload,
            variantId: 0,
            variantName: "Variant A",
            trigger: trigger ?? EventFilter(eventType: "session_start", filter: []),
            dateFilter: dateFilter ?? DateFilter(enabled: false, startDate: nil, endDate: nil),
            priority: priority,
            delayMS: delay,
            timeoutMS: timeout,
            payloadHtml: payloadHtml,
            isHtml: type == .freeform,
            hasTrackingConsent: nil,
            consentCategoryTracking: nil,
            isRichText: false
        )
    }

    static func buildInAppMessageButton(
        text: String? = "Click me!",
        url: String? = "https://example.com"
    ) -> InAppMessageButton? {
        return try? JSONDecoder().decode(InAppMessageButton.self, from: JSONEncoder().encode([
            "text": text,
            "url": url
        ]))
    }
}
