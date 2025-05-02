package com.exponea.widget.carousel

import com.exponea.sdk.models.InAppContentBlock
import com.exponea.sdk.util.ExponeaGson
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

internal class RnContentBlockCarouselDataRequestEvent(
    surfaceId: Int,
    viewTag: Int,
    private val requestType: CarouselDataRequestEventType,
    private val input: List<InAppContentBlock>
) : Event<RnContentBlockCarouselDataRequestEvent>(surfaceId, viewTag) {
    companion object {
        const val EVENT_NAME = "contentBlockCarouselDataRequestEvent"
    }
    override fun getEventName(): String = EVENT_NAME
    override fun getEventData(): WritableMap {
        return Arguments.createMap().apply {
            putString("requestType", requestType.value)
            putArray("data", Arguments.fromList(
                input.map { ExponeaGson.instance.toJson(it) }
            ))
        }
    }
}

enum class CarouselDataRequestEventType(val value: String) {
    SORT("sort"), FILTER("filter")
}
