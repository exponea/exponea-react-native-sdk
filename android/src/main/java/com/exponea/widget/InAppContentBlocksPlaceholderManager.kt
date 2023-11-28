package com.exponea.widget

import android.content.Context
import android.widget.LinearLayout
import com.exponea.sdk.Exponea
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
        return container
    }

    @ReactProp(name = "placeholderId")
    fun setPlaceholderId(placeholderContainer: InAppContentBlocksPlaceholder, newPlaceholderId: String?) {
        placeholderContainer.setPlaceholderId(newPlaceholderId)
    }

    override fun getExportedCustomBubblingEventTypeConstants(): MutableMap<String, Any>? {
        val map = super.getExportedCustomBubblingEventTypeConstants() ?: MapBuilder.builder<String, Any>().build()
        map.put("dimensChanged", MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onDimensChanged")))
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
}

class InAppContentBlocksPlaceholder(context: Context?) : LinearLayout(context) {

    private var currentPlaceholderId: String? = null
    private var currentPlaceholderInstance: InAppContentBlockPlaceholderView? = null

    private var sizeChangedListener: ((Int, Int) -> Unit)? = null

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
        } else {
            currentPlaceholderInstance = Exponea.getInAppContentBlocksPlaceholder(
                    newPlaceholderId, context, InAppContentBlockPlaceholderConfiguration(true)
            )
            currentPlaceholderInstance?.let { registerContentLoadedListeners(it) }
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
}
