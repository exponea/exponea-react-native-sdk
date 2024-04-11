package com.exponea.widget

import android.content.Context
import android.widget.LinearLayout
import com.exponea.sdk.Exponea
import com.exponea.sdk.models.InAppContentBlock
import com.exponea.sdk.models.InAppContentBlockAction
import com.exponea.sdk.models.InAppContentBlockCallback
import com.exponea.sdk.models.InAppContentBlockPlaceholderConfiguration
import com.exponea.sdk.util.Logger
import com.exponea.sdk.view.InAppContentBlockPlaceholderView
import com.facebook.react.bridge.Arguments
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.google.gson.Gson

class InAppContentBlocksPlaceholderManager : SimpleViewManager<InAppContentBlocksPlaceholder>() {

    override fun getName() = "RNInAppContentBlocksPlaceholder"

    override fun createViewInstance(reactContext: ThemedReactContext): InAppContentBlocksPlaceholder {
        val container = InAppContentBlocksPlaceholder(reactContext)
        container.setOnDimensChangedListener { width, height ->
            Logger.i(this, "InAppCB: Size changed with w${width}px h${height}px")
            val widthInDp = PixelUtil.toDIPFromPixel(width.toFloat())
            val heightInDp = PixelUtil.toDIPFromPixel(height.toFloat())
            notifyDimensChanged(reactContext, container.id, widthInDp, heightInDp)
        }
        container.setOnInAppContentBlockEventListener { eventType, placeholderId, contentBlock, action, errorMessage ->
            Logger.i(this, "InAppCB: Event $eventType invoked with placeholderId:$placeholderId, " +
                    "cb:$contentBlock, action:$action, errorMessage:$errorMessage")
            notifyInAppContentBlockEvent(
                reactContext,
                container.id,
                eventType,
                placeholderId,
                contentBlock,
                action,
                errorMessage
            )
        }
        return container
    }

    @ReactProp(name = "placeholderId")
    fun setPlaceholderId(placeholderContainer: InAppContentBlocksPlaceholder, newPlaceholderId: String?) {
        placeholderContainer.setPlaceholderId(newPlaceholderId)
    }

    @ReactProp(name = "overrideDefaultBehavior")
    fun setOverrideDefaultBehavior(
        placeholderContainer: InAppContentBlocksPlaceholder,
        newOverrideDefaultBehavior: Boolean?
    ) {
        placeholderContainer.setOverrideDefaultBehavior(newOverrideDefaultBehavior)
    }

    override fun getExportedCustomBubblingEventTypeConstants(): MutableMap<String, Any>? {
        val map = super.getExportedCustomBubblingEventTypeConstants() ?: MapBuilder.builder<String, Any>().build()
        map.put("dimensChanged", MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onDimensChanged")))
        map.put(
            "inAppContentBlockEvent",
            MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onInAppContentBlockEvent"))
        )
        return map
    }

    private fun notifyDimensChanged(context: ThemedReactContext, viewId: Int, width: Float, height: Float) {
        val event = Arguments.createMap().apply {
            putDouble("width", width.toDouble())
            putDouble("height", height.toDouble())
        }
        val eventEmitter = context.getJSModule(RCTEventEmitter::class.java)
        eventEmitter.receiveEvent(viewId, "dimensChanged", event)
    }

    private fun notifyInAppContentBlockEvent(
        context: ThemedReactContext,
        viewId: Int,
        eventType: String,
        placeholderId: String,
        contentBlock: InAppContentBlock?,
        action: InAppContentBlockAction?,
        errorMessage: String?
    ) {
        val event = Arguments.createMap().apply {
            putString("eventType", eventType)
            putString("placeholderId", placeholderId)
            putString("contentBlock", Gson().toJson(contentBlock))
            putString("action", Gson().toJson(action))
            putString("errorMessage", errorMessage)
        }
        val eventEmitter = context.getJSModule(RCTEventEmitter::class.java)
        eventEmitter.receiveEvent(viewId, "inAppContentBlockEvent", event)
    }
}

class InAppContentBlocksPlaceholder(context: Context?) : LinearLayout(context) {

    private var currentPlaceholderId: String? = null
    private var currentOverrideDefaultBehavior: Boolean = false
    private var currentOriginalBehavior: InAppContentBlockCallback? = null
    private var currentPlaceholderInstance: InAppContentBlockPlaceholderView? = null

    private var sizeChangedListener: ((Int, Int) -> Unit)? = null
    private var inAppContentBlockEventListener: (
        (String, String, InAppContentBlock?, InAppContentBlockAction?, String?) -> Unit
        )? = null

    init {
        orientation = VERTICAL
    }

    fun setPlaceholderId(newPlaceholderId: String?) {
        if (currentPlaceholderId == newPlaceholderId && currentPlaceholderInstance != null) {
            // placeholderContainer holds same currentPlaceholderInstance
            currentPlaceholderInstance?.refreshContent()
            return
        }
        currentPlaceholderId = newPlaceholderId
        if (newPlaceholderId == null) {
            currentPlaceholderInstance = null
            currentOriginalBehavior = null
        } else {
            currentPlaceholderInstance = Exponea.getInAppContentBlocksPlaceholder(
                    newPlaceholderId, context, InAppContentBlockPlaceholderConfiguration(true)
            )
            currentOriginalBehavior = currentPlaceholderInstance?.behaviourCallback
            currentPlaceholderInstance?.let { registerContentLoadedListeners(it) }
            currentPlaceholderInstance?.let { applyCallbackOverride(it) }
        }
        this.removeAllViews()
        currentPlaceholderInstance?.let {
            val layoutParams = LayoutParams(
                    LayoutParams.MATCH_PARENT,
                    LayoutParams.WRAP_CONTENT
            )
            this.addView(it, layoutParams)
        }
    }

    fun setOverrideDefaultBehavior(newOverrideDefaultBehavior: Boolean?) {
        currentOverrideDefaultBehavior = newOverrideDefaultBehavior ?: false
        currentPlaceholderInstance?.let { applyCallbackOverride(it) }
    }

    private fun applyCallbackOverride(target: InAppContentBlockPlaceholderView) {
        target.behaviourCallback = object : InAppContentBlockCallback {
            override fun onActionClicked(
                placeholderId: String,
                contentBlock: InAppContentBlock,
                action: InAppContentBlockAction
            ) {
                inAppContentBlockEventListener?.invoke("onActionClicked", placeholderId, contentBlock, action, null)
                if (!currentOverrideDefaultBehavior) {
                    currentOriginalBehavior?.onActionClicked(placeholderId, contentBlock, action)
                }
            }

            override fun onCloseClicked(
                placeholderId: String,
                contentBlock: InAppContentBlock
            ) {
                inAppContentBlockEventListener?.invoke("onCloseClicked", placeholderId, contentBlock, null, null)
                if (!currentOverrideDefaultBehavior) {
                    currentOriginalBehavior?.onCloseClicked(placeholderId, contentBlock)
                }
            }

            override fun onError(
                placeholderId: String,
                contentBlock: InAppContentBlock?,
                errorMessage: String
            ) {
                inAppContentBlockEventListener?.invoke("onError", placeholderId, contentBlock, null, errorMessage)
                if (!currentOverrideDefaultBehavior) {
                    currentOriginalBehavior?.onError(placeholderId, contentBlock, errorMessage)
                }
            }

            override fun onMessageShown(
                placeholderId: String,
                contentBlock: InAppContentBlock
            ) {
                inAppContentBlockEventListener?.invoke("onMessageShown", placeholderId, contentBlock, null, null)
                if (!currentOverrideDefaultBehavior) {
                    currentOriginalBehavior?.onMessageShown(placeholderId, contentBlock)
                }
            }

            override fun onNoMessageFound(placeholderId: String) {
                inAppContentBlockEventListener?.invoke("onNoMessageFound", placeholderId, null, null, null)
                if (!currentOverrideDefaultBehavior) {
                    currentOriginalBehavior?.onNoMessageFound(placeholderId)
                }
            }
        }
    }

    private fun registerContentLoadedListeners(target: InAppContentBlockPlaceholderView) {
        target.setOnContentReadyListener { _ ->
            sizeChangedListener?.invoke(target.width, target.height)
        }
    }

    private val measureAndLayout = Runnable {
        measure(
                MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(height, MeasureSpec.UNSPECIFIED)
        )
        Logger.i(this, "InAppCB: Measuring with $left $top $right $bottom")
        layout(left, top, right, bottom)
    }

    override fun requestLayout() {
        super.requestLayout()
        post(measureAndLayout)
    }

    fun setOnDimensChangedListener(listener: (Int, Int) -> Unit) {
        sizeChangedListener = listener
    }

    fun setOnInAppContentBlockEventListener(
        listener: (String, String, InAppContentBlock?, InAppContentBlockAction?, String?) -> Unit
    ) {
        inAppContentBlockEventListener = listener
    }
}
