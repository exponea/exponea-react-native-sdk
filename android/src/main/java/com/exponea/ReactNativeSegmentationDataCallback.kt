package com.exponea

import com.exponea.sdk.models.Segment
import com.exponea.sdk.models.SegmentationDataCallback
import com.exponea.sdk.util.Logger

/**
 * ReactNativeSegmentationDataCallback extends SegmentationDataCallback from Exponea SDK
 * and proxies segmentation data updates to JavaScript via a callback function.
 *
 * Each JavaScript `SegmentationDataCallback` registration owns exactly one instance, so
 * several instances may observe the same category while the native SDK evaluates
 * `includeFirstLoad` for each of them independently.
 *
 * - instanceId: Identifier issued by JavaScript for this registration; emitted with every
 *   update so JavaScript can route the data to the exact registration that produced it
 * - eventEmitterKey: The event name used for emission ("newSegments")
 * - exposingCategory: The segmentation category this callback listens to
 * - includeFirstLoad: Whether to emit segments on first load or only on changes
 */
class ReactNativeSegmentationDataCallback(
    val instanceId: String,
    override val exposingCategory: String,
    override var includeFirstLoad: Boolean,
    private val reactModuleCallback: (ReactNativeSegmentationDataCallback, List<Segment>) -> Unit
) : SegmentationDataCallback() {

    val eventEmitterKey: String = "newSegments"

    override fun onNewData(segments: List<Segment>) {
        Logger.d(this, "Segments: New segments for '$exposingCategory' received: $segments")
        reactModuleCallback.invoke(this, segments)
    }
}
