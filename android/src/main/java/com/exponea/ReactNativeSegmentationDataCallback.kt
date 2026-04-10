package com.exponea

import com.exponea.sdk.models.Segment
import com.exponea.sdk.models.SegmentationDataCallback
import com.exponea.sdk.util.Logger
import java.util.UUID

/**
 * ReactNativeSegmentationDataCallback extends SegmentationDataCallback from Exponea SDK
 * and proxies segmentation data updates to JavaScript via a callback function.
 *
 * Each callback instance has:
 * - instanceId: Unique identifier for this callback instance (used for unregistering)
 * - eventEmitterKey: The event name used for emission ("newSegments")
 * - exposingCategory: The segmentation category this callback listens to
 * - includeFirstLoad: Whether to emit segments on first load or only on changes
 */
class ReactNativeSegmentationDataCallback(
    override val exposingCategory: String,
    override var includeFirstLoad: Boolean,
    private val reactModuleCallback: (ReactNativeSegmentationDataCallback, List<Segment>) -> Unit
) : SegmentationDataCallback() {

    val instanceId: String = UUID.randomUUID().toString()
    val eventEmitterKey: String = "newSegments"

    override fun onNewData(segments: List<Segment>) {
        Logger.d(this, "Segments: New segments for '$exposingCategory' received: $segments")
        reactModuleCallback.invoke(this, segments)
    }
}
