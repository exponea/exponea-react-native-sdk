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
import struct ExponeaSDK.RichInAppMessagePayload

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
        type: InAppMessageType = .modal,
        isRichText: Bool = false
    ) -> InAppMessage {
        var oldPayload: InAppMessagePayload?
        var richPayload: RichInAppMessagePayload?
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
        } else if isRichText {
            richPayload = try? JSONDecoder().decode(RichInAppMessagePayload.self, from: Data("""
            {
                  "title": "filip.vozar@exponea.com",
                  "body_text": "This is an example of your in-app message body text.",
                  "image_url": "https://i.ytimg.com/vi/t4nM1FoUqYs/maxresdefault.jpg",
                  "title_text_color": "#000000",
                  "title_text_size": "22px",
                  "body_text_color": "#000000",
                  "body_text_size": "14px",
                  "background_color": "#ffffff",
                  "overlay_color": "#FF00FF10",
                  "buttons_align": "center",
                  "text_position": "top",
                  "image_enabled": true,
                  "image_size": "auto",
                  "image_margin": "200 10 10 10",
                  "image_corner_radius": "10px",
                  "image_aspect_ratio_width": "16",
                  "image_aspect_ratio_height": "9",
                  "image_object_fit": "fill",
                  "image_overlay_enabled":false,
                  "title_enabled": true,
                  "title_format": [
                    "bold"
                  ],
                  "title_align": "center",
                  "title_line_height": "32px",
                  "title_padding": "200px 10px 15px 10px",
                  "title_font_url": "https://webpagepublicity.com/free-fonts/x/Xtrusion%20(BRK).ttf",
                  "body_enabled": true,
                  "body_format": [
                    "bold"
                  ],
                  "body_align": "center",
                  "body_line_height": "32px",
                  "body_padding": "200px 10px 15px 10px",
                  "body_font_url": "https://webpagepublicity.com/free-fonts/x/Xtrusion%20(BRK).ttf",
                  "close_button_enabled": true,
                  "close_button_margin": "50px 10px",
                  "close_button_background_color": "yellow",
                  "close_button_color": "#ffffff",
                  "buttons": [
                    {
                      "button_text": "Action",
                      "button_type": "deep-link",
                      "button_link": "https://someaddress.com",
                      "button_text_color": "#ffffff",
                      "button_background_color": "blue",
                      "button_width": "hug",
                      "button_corner_radius": "12dp",
                      "button_margin": "20px 10px 15px 10px",
                      "button_font_size": "24px",
                      "button_line_height": "32px",
                      "button_padding": "20px 10px 15px 10px",
                      "button_border_color": "black",
                      "button_border_width": "1px",
                      "button_font_url": "https://webpagepublicity.com/free-fonts/x/Xtrusion%20(BRK).ttf",
                      "button_font_format": [
                        "bold"
                      ],
                      "button_enabled": true
                    },
                    {
                      "button_text": "Cancel",
                      "button_type": "cancel",
                      "button_text_color": "#ffffff",
                      "button_background_color": "#f44cac",
                      "button_width": "hug",
                      "button_corner_radius": "12dp",
                      "button_margin": "20px 10px 15px 10px",
                      "button_font_size": "24px",
                      "button_line_height": "32px",
                      "button_padding": "20px 10px 15px 10px",
                      "button_border_color": "black",
                      "button_border_width": "1px",
                      "button_font_url": "https://webpagepublicity.com/free-fonts/x/Xtrusion%20(BRK).ttf",
                      "button_font_format": [
                        "bold"
                      ],
                      "button_enabled": true
                    }
                  ]
                }
            """.utf8))
            if var nonNilPayload = richPayload {
                nonNilPayload.titleFontData = nil
                nonNilPayload.bodyFontData = nil
                nonNilPayload.buttons = nonNilPayload.buttons.map({ each in
                    var copy = each
                    copy.fontData = nil
                    return copy
                })
                richPayload = nonNilPayload
            }
        } else {
            oldPayload = InAppMessagePayload(
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
            payload: richPayload,
            oldPayload: oldPayload,
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
            isRichText: isRichText
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
