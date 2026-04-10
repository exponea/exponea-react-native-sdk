package com.exponea.widget

import com.exponea.fromJson
import com.exponea.sdk.models.InAppContentBlock
import com.exponea.sdk.util.ExponeaGson
import com.exponea.sdk.util.Logger
import com.exponea.widget.carousel.CarouselDataRequestEventType
import com.exponea.widget.carousel.ContentBlockCarouselEvent
import com.exponea.widget.carousel.ContentBlockCarouselViewProxy
import com.exponea.widget.carousel.RnContentBlockCarouselDataRequestEvent
import com.exponea.widget.carousel.RnContentBlockCarouselEvent
import com.facebook.react.bridge.Arguments
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.ContentBlockCarouselViewManagerDelegate
import com.facebook.react.viewmanagers.ContentBlockCarouselViewManagerInterface

@ReactModule(name = ContentBlockCarouselViewManager.REACT_CLASS)
class ContentBlockCarouselViewManager :
    SimpleViewManager<ContentBlockCarouselViewProxy>(),
    ContentBlockCarouselViewManagerInterface<ContentBlockCarouselViewProxy> {

    private val delegate: ViewManagerDelegate<ContentBlockCarouselViewProxy> =
        ContentBlockCarouselViewManagerDelegate(this)

    companion object {
        const val REACT_CLASS = "ContentBlockCarouselView"
    }

    override fun getName() = REACT_CLASS

    override fun getDelegate(): ViewManagerDelegate<ContentBlockCarouselViewProxy> = delegate

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

    // Codegen-generated interface methods
    override fun setPlaceholderId(view: ContentBlockCarouselViewProxy, value: String?) {
        // Store for later use when all props are set
        view.tag = (view.tag as? MutableMap<String, Any?> ?: mutableMapOf()).apply {
            put("placeholderId", value)
        }
        recreateCarouselIfReady(view)
    }

    override fun setMaxMessagesCount(view: ContentBlockCarouselViewProxy, value: Int) {
        view.tag = (view.tag as? MutableMap<String, Any?> ?: mutableMapOf()).apply {
            put("maxMessagesCount", value)
        }
        recreateCarouselIfReady(view)
    }

    override fun setScrollDelay(view: ContentBlockCarouselViewProxy, value: Int) {
        view.tag = (view.tag as? MutableMap<String, Any?> ?: mutableMapOf()).apply {
            put("scrollDelay", value)
        }
        recreateCarouselIfReady(view)
    }

    override fun setOverrideDefaultBehavior(view: ContentBlockCarouselViewProxy, value: Boolean) {
        view.setOverrideDefaultBehavior(value)
    }

    override fun setTrackActions(view: ContentBlockCarouselViewProxy, value: Boolean) {
        view.setTrackActions(value)
    }

    override fun setCustomFilterActive(view: ContentBlockCarouselViewProxy, value: Boolean) {
        var contentFilter: ((List<InAppContentBlock>) -> Unit)? = null
        if (value) {
            val rnContext = view.context as? ThemedReactContext
            if (rnContext == null) {
                Logger.e(this, "InAppCbCarousel: Unable to open custom filter binding, invalid context type")
            } else {
                contentFilter = { it -> notifyContentFilterRequest(rnContext, view.id, it) }
            }
        }
        view.setContentFilter(contentFilter)
    }

    override fun setCustomSortActive(view: ContentBlockCarouselViewProxy, value: Boolean) {
        var contentSorter: ((List<InAppContentBlock>) -> Unit)? = null
        if (value) {
            val rnContext = view.context as? ThemedReactContext
            if (rnContext == null) {
                Logger.e(this, "InAppCbCarousel: Unable to open custom sorter binding, invalid context type")
            } else {
                contentSorter = { it -> notifyContentSortRequest(rnContext, view.id, it) }
            }
        }
        view.setContentSort(contentSorter)
    }

    override fun filterResponse(view: ContentBlockCarouselViewProxy, contentBlocks: String) {
        val blocks = parseContentBlocksFromJson(contentBlocks)
        view.onContentFilterResponse(blocks)
    }

    override fun sortResponse(view: ContentBlockCarouselViewProxy, contentBlocks: String) {
        val blocks = parseContentBlocksFromJson(contentBlocks)
        view.onContentSortResponse(blocks)
    }

    private fun recreateCarouselIfReady(view: ContentBlockCarouselViewProxy) {
        val props = view.tag as? Map<String, Any?> ?: return
        val placeholderId = props["placeholderId"] as? String ?: return
        val maxMessagesCount = props["maxMessagesCount"] as? Int
        val scrollDelay = props["scrollDelay"] as? Int

        view.recreateCarouselView(
            placeholderId = placeholderId,
            maxMessagesCount = maxMessagesCount,
            scrollDelay = scrollDelay
        )
    }

    private fun parseContentBlocksFromJson(json: String): List<InAppContentBlock> {
        return try {
            val jsonArray = ExponeaGson.instance.fromJson(json, List::class.java) as? List<String> ?: emptyList()
            jsonArray.mapNotNull { blockJson ->
                try {
                    ExponeaGson.instance.fromJson<InAppContentBlock>(blockJson)
                } catch (e: Exception) {
                    Logger.e(this, "InAppCbCarousel: Unable to parse content block: $blockJson", e)
                    null
                }
            }
        } catch (e: Exception) {
            Logger.e(this, "InAppCbCarousel: Unable to parse content blocks array: $json", e)
            emptyList()
        }
    }

    // Event registration is handled automatically by Codegen in new architecture
    // No need to override getExportedCustomBubblingEventTypeConstants()

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
