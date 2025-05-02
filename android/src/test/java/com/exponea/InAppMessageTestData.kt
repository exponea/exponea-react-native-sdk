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
            type: InAppMessageType = InAppMessageType.MODAL
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
                isRichText = false
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
