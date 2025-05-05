package com.exponea

import com.exponea.sdk.models.DateFilter
import com.exponea.sdk.models.InAppMessage
import com.exponea.sdk.models.InAppMessageButton
import com.exponea.sdk.models.InAppMessagePayload
import com.exponea.sdk.models.InAppMessagePayloadButton
import com.exponea.sdk.models.InAppMessageType
import com.exponea.sdk.models.eventfilter.EventFilter

class InAppMessageTestData {
    companion object {
        fun buildInAppMessage(
            id: String? = null,
            dateFilter: DateFilter? = null,
            trigger: EventFilter? = null,
            frequency: String? = null,
            imageUrl: String? = null,
            priority: Int? = null,
            timeout: Long? = null,
            delay: Long? = null,
            type: InAppMessageType = InAppMessageType.MODAL,
            isRichstyle: Boolean = false
        ): InAppMessage {
            var payload: InAppMessagePayload? = null
            var payloadHtml: String? = null
            if (type == InAppMessageType.FREEFORM) {
                payloadHtml = "<html>" +
                    "<head>" +
                    "<style>" +
                    ".css-image {" +
                    "   background-image: url('https://i.ytimg.com/vi/t4nM1FoUqYs/maxresdefault.jpg')" +
                    "}" +
                    "</style>" +
                    "</head>" +
                    "<body>" +
                    "<img src='https://i.ytimg.com/vi/t4nM1FoUqYs/maxresdefault.jpg'/>" +
                    "<div data-actiontype='close'>Close</div>" +
                    "<div data-link='https://someaddress.com'>Action 1</div>" +
                    "</body></html>"
            } else if (isRichstyle) {
                val buttonFontUrl = "https://webpagepublicity.com/free-fonts/x/Xtrusion%20(BRK).ttf"
                val imageSizing = "auto"
                val titleFontUrl = "https://webpagepublicity.com/free-fonts/x/Xtrusion%20(BRK).ttf"
                val bodyFontUrl = "https://webpagepublicity.com/free-fonts/x/Xtrusion%20(BRK).ttf"
                payload = InAppMessagePayload(
                    imageUrl = imageUrl ?: "https://i.ytimg.com/vi/t4nM1FoUqYs/maxresdefault.jpg",
                    title = "filip.vozar@exponea.com",
                    titleTextColor = "#000000",
                    titleTextSize = "22px",
                    bodyText = "This is an example of your in-app message body text.",
                    bodyTextColor = "#000000",
                    bodyTextSize = "14px",
                    buttons = arrayListOf(
                        InAppMessagePayloadButton(
                            rawType = "deep-link",
                            text = "Action",
                            link = "https://someaddress.com",
                            backgroundColor = "blue",
                            textColor = "#ffffff",
                            fontUrl = buttonFontUrl,
                            sizing = "hug",
                            radius = "12dp",
                            margin = "20px 10px 15px 10px",
                            textSize = "24px",
                            lineHeight = "32px",
                            padding = "20px 10px 15px 10px",
                            textStyle = listOf("bold"),
                            borderColor = "black",
                            borderWeight = "1px",
                            isEnabled = true
                        ),
                        InAppMessagePayloadButton(
                            rawType = "cancel",
                            text = "Cancel",
                            link = null,
                            backgroundColor = "#f44cac",
                            textColor = "#ffffff",
                            fontUrl = buttonFontUrl,
                            sizing = "hug",
                            radius = "12dp",
                            margin = "20px 10px 15px 10px",
                            textSize = "24px",
                            lineHeight = "32px",
                            padding = "20px 10px 15px 10px",
                            textStyle = listOf("bold"),
                            borderColor = "black",
                            borderWeight = "1px",
                            isEnabled = true
                        )
                    ),
                    backgroundColor = "#ffffff",
                    closeButtonIconColor = "#ffffff",
                    imageSizing = imageSizing,
                    imageScale = "fill",
                    imageMargin = "200 10 10 10",
                    isImageOverlayEnabled = false,
                    titleFontUrl = titleFontUrl,
                    titleTextAlignment = "center",
                    titleTextStyle = listOf("bold"),
                    titleLineHeight = "32px",
                    titlePadding = "200px 10px 15px 10px",
                    bodyFontUrl = bodyFontUrl,
                    bodyTextAlignment = "center",
                    bodyTextStyle = listOf("bold"),
                    bodyLineHeight = "32px",
                    bodyPadding = "200px 10px 15px 10px",
                    buttonsAlignment = "center",
                    imageRatioWidth = "16",
                    imageRatioHeight = "9",
                    closeButtonBackgroundColor = "yellow",
                    closeButtonIconUrl = null,
                    closeButtonMargin = "50px 10px",
                    isCloseButtonEnabled = true,
                    backgroundOverlayColor = "#FF00FF10",
                    textPosition = "top",
                    isTextOverImage = null,
                    imageRadius = "10px",
                    isTitleEnabled = true,
                    isImageEnabled = true,
                    isBodyEnabled = true
                )
            } else {
                payload = InAppMessagePayload(
                    imageUrl = imageUrl ?: "https://i.ytimg.com/vi/t4nM1FoUqYs/maxresdefault.jpg",
                    title = "filip.vozar@exponea.com",
                    titleTextColor = "#000000",
                    titleTextSize = "22px",
                    bodyText = "This is an example of your in-app message body text.",
                    bodyTextColor = "#000000",
                    bodyTextSize = "14px",
                    backgroundColor = "#ffffff",
                    closeButtonIconColor = "#ffffff",
                    buttons = arrayListOf(
                        InAppMessagePayloadButton(
                            rawType = "deep-link",
                            text = "Action",
                            link = "https://someaddress.com",
                            textColor = "#ffffff",
                            backgroundColor = "#f44cac"
                        ),
                        InAppMessagePayloadButton(
                            rawType = "cancel",
                            text = "Cancel",
                            link = null,
                            textColor = "#ffffff",
                            backgroundColor = "#f44cac"
                        )
                    )
                )
            }
            return InAppMessage(
                id = id ?: "5dd86f44511946ea55132f29",
                name = "Test serving in-app message",
                rawMessageType = type.value,
                rawFrequency = frequency ?: "unknown",
                variantId = 0,
                variantName = "Variant A",
                trigger = trigger ?: EventFilter("session_start", arrayListOf()),
                dateFilter = dateFilter ?: DateFilter(false, null, null),
                priority = priority,
                delay = delay,
                timeout = timeout,
                payload = payload,
                payloadHtml = payloadHtml,
                isHtml = type == InAppMessageType.FREEFORM,
                consentCategoryTracking = null,
                rawHasTrackingConsent = null,
                isRichText = isRichstyle
            )
        }

        fun buildInAppMessageButton(
            text: String? = "Click me!",
            url: String? = "https://example.com"
        ): InAppMessageButton {
            return InAppMessageButton(
                text = text,
                url = url
            )
        }
    }
}
