package com.exponea.widget

import com.exponea.fromJson
import com.exponea.getNullSafely
import com.exponea.getRequired
import com.exponea.mapOfPhasedRegistrationNames
import com.exponea.sdk.models.InAppContentBlock
import com.exponea.sdk.util.ExponeaGson
import com.exponea.sdk.util.Logger
import com.exponea.toArrayListRecursively
import com.exponea.toHashMapRecursively
import com.exponea.widget.carousel.CarouselDataRequestEventType
import com.exponea.widget.carousel.ContentBlockCarouselEvent
import com.exponea.widget.carousel.ContentBlockCarouselViewProxy
import com.exponea.widget.carousel.RnContentBlockCarouselDataRequestEvent
import com.exponea.widget.carousel.RnContentBlockCarouselEvent
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.annotations.ReactProp

class ContentBlockCarouselViewManager : SimpleViewManager<ContentBlockCarouselViewProxy>() {

    override fun getName() = "RNContentBlockCarouselView"

    override fun createViewInstance(reactContext: ThemedReactContext): ContentBlockCarouselViewProxy {
        val container = ContentBlockCarouselViewProxy(reactContext)
        container.setOnDimensChangedListener { width, height ->
            Logger.i(this, "InAppCbCarousel: Size changed with w${width}px h${height}px")
            val widthInDp = PixelUtil.toDIPFromPixel(width.toFloat())
            val heightInDp = PixelUtil.toDIPFromPixel(height.toFloat())
            notifyDimensChanged(reactContext, container.id, widthInDp, heightInDp)
        }
        container.setOnContentBlockCarouselEventListener { event ->
            Logger.i(
                this,
                """
                InAppCbCarousel: Event ${event.eventType} invoked on carousel ${event.placeholderId}:
                ${ExponeaGson.instance.toJson(event)}
                """.trimIndent()
            )
            notifyContentBlockCarouselEvent(reactContext, container.id, event)
        }
        return container
    }

    override fun receiveCommand(target: ContentBlockCarouselViewProxy, commandId: String?, args: ReadableArray?) {
        super.receiveCommand(target, commandId, args)
        when (commandId) {
            CarouselDataRequestEventType.FILTER.value + "Response" -> {
                val contentBlocks = readCarouselContentBlocksResponse(args)
                target.onContentFilterResponse(contentBlocks)
            }
            CarouselDataRequestEventType.SORT.value + "Response" -> {
                val contentBlocks = readCarouselContentBlocksResponse(args)
                target.onContentSortResponse(contentBlocks)
            }
            else -> {
                Logger.w(this, "InAppCbCarousel: Unknown command $commandId")
            }
        }
    }

    private fun readCarouselContentBlocksResponse(args: ReadableArray?): List<InAppContentBlock> {
        val argsArray = args?.toArrayListRecursively() ?: emptyList()
        val contentBlocksResponse = (argsArray.firstOrNull() as? List<Any?>) ?: emptyList()
        val contentBlocks = contentBlocksResponse
            .mapNotNull { it as? String }
            .mapNotNull {
                try {
                    ExponeaGson.instance.fromJson<InAppContentBlock>(it)
                } catch (e: Exception) {
                    Logger.e(this, "InAppCbCarousel: Unable to parse content block: $it", e)
                    return@mapNotNull null
                }
            }
        return contentBlocks
    }

    @ReactProp(name = "initProps")
    fun setInitProps(target: ContentBlockCarouselViewProxy, initProps: ReadableMap?) {
        if (initProps == null) {
            Logger.e(this, "InAppCbCarousel: initProps must be declared")
            return
        }
        val initPropsMap = initProps.toHashMapRecursively()
        val placeholderId = initPropsMap.getRequired<String>("placeholderId")
        val maxMessagesCount = initPropsMap.getNullSafely<Int>("maxMessagesCount")
        val scrollDelay = initPropsMap.getNullSafely<Int>("scrollDelay")
        target.recreateCarouselView(
            placeholderId = placeholderId,
            maxMessagesCount = maxMessagesCount,
            scrollDelay = scrollDelay
        )
    }

    @ReactProp(name = "overrideDefaultBehavior")
    fun setOverrideDefaultBehavior(target: ContentBlockCarouselViewProxy, value: Boolean?) {
        target.setOverrideDefaultBehavior(value)
    }

    @ReactProp(name = "trackActions")
    fun setTrackActions(target: ContentBlockCarouselViewProxy, value: Boolean?) {
        target.setTrackActions(value)
    }

    @ReactProp(name = "customFilterActive")
    fun setCustomFilterActive(target: ContentBlockCarouselViewProxy, value: Boolean?) {
        val customFilterIsActive = value ?: false
        var contentFilter: ((List<InAppContentBlock>) -> Unit)? = null
        if (customFilterIsActive) {
            val rnContext = target.context as? ThemedReactContext
            if (rnContext == null) {
                Logger.e(this, "InAppCbCarousel: Unable to open custom filter binding, invalid context type")
            } else {
                contentFilter = { it -> notifyContentFilterRequest(rnContext, target.id, it) }
            }
        }
        target.setContentFilter(contentFilter)
    }

    @ReactProp(name = "customSortActive")
    fun setCustomSortActive(target: ContentBlockCarouselViewProxy, value: Boolean?) {
        val customSortIsActive = value ?: false
        var contentSorter: ((List<InAppContentBlock>) -> Unit)? = null
        if (customSortIsActive) {
            val rnContext = target.context as? ThemedReactContext
            if (rnContext == null) {
                Logger.e(this, "InAppCbCarousel: Unable to open custom sorter binding, invalid context type")
            } else {
                contentSorter = { it -> notifyContentSortRequest(rnContext, target.id, it) }
            }
        }
        target.setContentSort(contentSorter)
    }

    override fun getExportedCustomBubblingEventTypeConstants(): MutableMap<String, Any> {
        val map = (super.getExportedCustomBubblingEventTypeConstants() ?: MapBuilder.builder<String, Any>().build())
            .toMutableMap()
        map[DimensChangedEvent.EVENT_NAME] = mapOfPhasedRegistrationNames("onDimensChanged")
        map[RnContentBlockCarouselEvent.EVENT_NAME] = mapOfPhasedRegistrationNames("onContentBlockEvent")
        map[RnContentBlockCarouselDataRequestEvent.EVENT_NAME] = mapOfPhasedRegistrationNames(
            "onContentBlockDataRequestEvent"
        )
        return map
    }

    private fun notifyDimensChanged(context: ThemedReactContext, viewId: Int, width: Float, height: Float) {
        val event = Arguments.createMap().apply {
            putDouble("width", width.toDouble())
            putDouble("height", height.toDouble())
        }
        val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(context, viewId)
        val surfaceId: Int = UIManagerHelper.getSurfaceId(context)
        dispatcher?.dispatchEvent(
            DimensChangedEvent(surfaceId, viewId, event)
        )
    }

    private fun notifyContentBlockCarouselEvent(
        context: ThemedReactContext,
        viewId: Int,
        event: ContentBlockCarouselEvent
    ) {
        val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(context, viewId)
        val surfaceId: Int = UIManagerHelper.getSurfaceId(context)
        dispatcher?.dispatchEvent(RnContentBlockCarouselEvent(surfaceId, viewId, event))
    }

    private fun notifyContentFilterRequest(
        context: ThemedReactContext,
        viewId: Int,
        input: List<InAppContentBlock>
    ) {
        val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(context, viewId)
        val surfaceId: Int = UIManagerHelper.getSurfaceId(context)
        dispatcher?.dispatchEvent(
            RnContentBlockCarouselDataRequestEvent(
                surfaceId,
                viewId,
                CarouselDataRequestEventType.FILTER,
                input
            )
        )
    }

    private fun notifyContentSortRequest(
        context: ThemedReactContext,
        viewId: Int,
        input: List<InAppContentBlock>
    ) {
        val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(context, viewId)
        val surfaceId: Int = UIManagerHelper.getSurfaceId(context)
        dispatcher?.dispatchEvent(
            RnContentBlockCarouselDataRequestEvent(
                surfaceId,
                viewId,
                CarouselDataRequestEventType.SORT,
                input
            )
        )
    }
}
