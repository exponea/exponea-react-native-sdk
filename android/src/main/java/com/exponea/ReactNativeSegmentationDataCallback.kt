package com.exponea

import com.exponea.sdk.models.Segment
import com.exponea.sdk.models.SegmentationDataCallback
import com.exponea.sdk.util.Logger
import java.util.UUID

class ReactNativeSegmentationDataCallback(
    override val exposingCategory: String,
    override var includeFirstLoad: Boolean,
    private val reactModuleCallback: (ReactNativeSegmentationDataCallback, List<Segment>) -> Unit
) : SegmentationDataCallback() {
    val instanceId = UUID.randomUUID().toString()
    val eventEmitterKey = "newSegments"
    override fun onNewData(segments: List<Segment>) {
        Logger.d(this, "Segments: New segments for '$exposingCategory' received: $segments")
        reactModuleCallback.invoke(this, segments)
    }
}
