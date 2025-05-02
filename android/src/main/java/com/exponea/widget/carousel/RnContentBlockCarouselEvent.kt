package com.exponea.widget.carousel

import com.exponea.sdk.util.ExponeaGson
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

internal class RnContentBlockCarouselEvent(
    surfaceId: Int,
    viewTag: Int,
    private val event: ContentBlockCarouselEvent
) : Event<RnContentBlockCarouselEvent>(surfaceId, viewTag) {
    companion object {
        const val EVENT_NAME = "contentBlockCarouselEvent"
    }
    override fun getEventName(): String = EVENT_NAME
    override fun getEventData(): WritableMap = event.run {
        Arguments.createMap().apply {
            putString("eventType", eventType.value)
            placeholderId?.let { putString("placeholderId", it) }
            contentBlock?.let { putString("contentBlock", ExponeaGson.instance.toJson(it)) }
            action?.let { putString("action", ExponeaGson.instance.toJson(it)) }
            errorMessage?.let { putString("errorMessage", it) }
            index?.let { putInt("index", it) }
            count?.let { putInt("count", it) }
            contentBlocks?.let { putString("contentBlocks", ExponeaGson.instance.toJson(it)) }
        }
    }
}
