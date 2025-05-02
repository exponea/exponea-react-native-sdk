package com.exponea.widget.carousel

import com.exponea.sdk.models.InAppContentBlock
import com.exponea.sdk.models.InAppContentBlockAction

data class ContentBlockCarouselEvent(
    val eventType: CarouselEventType,
    val placeholderId: String?,
    val contentBlock: InAppContentBlock?,
    val action: InAppContentBlockAction?,
    val errorMessage: String?,
    val index: Int?,
    val count: Int?,
    val contentBlocks: List<InAppContentBlock>?
)
