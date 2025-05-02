package com.exponea.widget.carousel

import com.exponea.sdk.models.ContentBlockCarouselCallback
import com.exponea.sdk.models.InAppContentBlock
import com.exponea.sdk.models.InAppContentBlockAction
import com.exponea.widget.carousel.CarouselEventType.ON_ACTION_CLICKED
import com.exponea.widget.carousel.CarouselEventType.ON_CLOSE_CLICKED
import com.exponea.widget.carousel.CarouselEventType.ON_ERROR
import com.exponea.widget.carousel.CarouselEventType.ON_MESSAGES_CHANGED
import com.exponea.widget.carousel.CarouselEventType.ON_MESSAGE_SHOWN
import com.exponea.widget.carousel.CarouselEventType.ON_NO_MESSAGE_FOUND

internal class MutableContentBlockCarouselCallback(
    var mutableOverrideDefaultBehavior: Boolean,
    var mutableTrackActions: Boolean,
    var contentBlockEventListener: ((ContentBlockCarouselEvent) -> Unit)? = null,
    var sizeChangedListener: ((Int, Int) -> Unit)? = null
) : ContentBlockCarouselCallback {
    override val overrideDefaultBehavior: Boolean
        get() = mutableOverrideDefaultBehavior
    override val trackActions: Boolean
        get() = mutableTrackActions
    override fun onMessageShown(
        placeholderId: String,
        contentBlock: InAppContentBlock,
        index: Int,
        count: Int
    ) {
        contentBlockEventListener?.invoke(ContentBlockCarouselEvent(
            eventType = ON_MESSAGE_SHOWN,
            placeholderId = placeholderId,
            contentBlock = contentBlock,
            action = null,
            errorMessage = null,
            index = index,
            count = count,
            contentBlocks = null
        ))
    }
    override fun onMessagesChanged(count: Int, messages: List<InAppContentBlock>) {
        contentBlockEventListener?.invoke(ContentBlockCarouselEvent(
            eventType = ON_MESSAGES_CHANGED,
            placeholderId = null,
            contentBlock = null,
            action = null,
            errorMessage = null,
            index = null,
            count = count,
            contentBlocks = messages
        ))
    }
    override fun onNoMessageFound(placeholderId: String) {
        contentBlockEventListener?.invoke(ContentBlockCarouselEvent(
            eventType = ON_NO_MESSAGE_FOUND,
            placeholderId = placeholderId,
            contentBlock = null,
            action = null,
            errorMessage = null,
            index = null,
            count = null,
            contentBlocks = null
        ))
    }
    override fun onError(
        placeholderId: String,
        contentBlock: InAppContentBlock?,
        errorMessage: String
    ) {
        contentBlockEventListener?.invoke(ContentBlockCarouselEvent(
            eventType = ON_ERROR,
            placeholderId = placeholderId,
            contentBlock = contentBlock,
            action = null,
            errorMessage = errorMessage,
            index = null,
            count = null,
            contentBlocks = null
        ))
    }
    override fun onCloseClicked(
        placeholderId: String,
        contentBlock: InAppContentBlock
    ) {
        contentBlockEventListener?.invoke(ContentBlockCarouselEvent(
            eventType = ON_CLOSE_CLICKED,
            placeholderId = placeholderId,
            contentBlock = contentBlock,
            action = null,
            errorMessage = null,
            index = null,
            count = null,
            contentBlocks = null
        ))
    }
    override fun onActionClicked(
        placeholderId: String,
        contentBlock: InAppContentBlock,
        action: InAppContentBlockAction
    ) {
        contentBlockEventListener?.invoke(ContentBlockCarouselEvent(
            eventType = ON_ACTION_CLICKED,
            placeholderId = placeholderId,
            contentBlock = contentBlock,
            action = action,
            errorMessage = null,
            index = null,
            count = null,
            contentBlocks = null
        ))
    }

    override fun onHeightUpdate(placeholderId: String, height: Int) {
        sizeChangedListener?.invoke(0, height)
    }
}
