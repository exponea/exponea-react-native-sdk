package com.exponea.widget.carousel

import android.content.Context
import android.widget.LinearLayout
import com.exponea.sdk.Exponea
import com.exponea.sdk.models.InAppContentBlock
import com.exponea.sdk.util.Logger
import com.exponea.sdk.view.ContentBlockCarouselView

class ContentBlockCarouselViewProxy(context: Context?) : LinearLayout(context) {

    private var currentCarouselInstance: ContentBlockCarouselView? = null
    private val carouselCallbackProxy: MutableContentBlockCarouselCallback
    private val carouselContentSelector: BridgedContentBlockCarouselSelector

    init {
        orientation = VERTICAL
        carouselCallbackProxy = MutableContentBlockCarouselCallback(
            mutableOverrideDefaultBehavior = false,
            mutableTrackActions = true
        )
        carouselContentSelector = BridgedContentBlockCarouselSelector()
    }

    private fun destroyPreviousCarouselInstance() {
        currentCarouselInstance?.let { previousInstance ->
            previousInstance.behaviourCallback = null
            this.removeView(previousInstance)
        }
        currentCarouselInstance = null
    }

    internal fun recreateCarouselView(placeholderId: String, maxMessagesCount: Int?, scrollDelay: Int?) {
        destroyPreviousCarouselInstance()
        currentCarouselInstance = Exponea.getInAppContentBlocksCarousel(
            context, placeholderId, maxMessagesCount, scrollDelay
        )
        currentCarouselInstance?.let {
            it.behaviourCallback = carouselCallbackProxy
            val layoutParams = LayoutParams(
                LayoutParams.MATCH_PARENT,
                LayoutParams.WRAP_CONTENT
            )
            this.addView(it, layoutParams)
            it.contentBlockSelector = carouselContentSelector
        }
    }

    fun setOverrideDefaultBehavior(newOverrideDefaultBehavior: Boolean?) {
        carouselCallbackProxy.mutableOverrideDefaultBehavior = newOverrideDefaultBehavior ?: false
    }

    private val measureAndLayout = Runnable {
        measure(
                MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(height, MeasureSpec.UNSPECIFIED)
        )
        Logger.i(this, "InAppCbCarousel: Measuring with $left $top $right $bottom")
        layout(left, top, right, bottom)
    }

    override fun requestLayout() {
        super.requestLayout()
        post(measureAndLayout)
    }

    fun setOnDimensChangedListener(listener: (Int, Int) -> Unit) {
        carouselCallbackProxy.sizeChangedListener = listener
    }

    fun setOnContentBlockCarouselEventListener(listener: (ContentBlockCarouselEvent) -> Unit) {
        carouselCallbackProxy.contentBlockEventListener = listener
    }

    fun setTrackActions(value: Boolean?) {
        carouselCallbackProxy.mutableTrackActions = value ?: true
    }

    fun setContentFilter(filterFn: ((List<InAppContentBlock>) -> Unit)?) {
        carouselContentSelector.filterFn = filterFn
    }

    fun setContentSort(sortFn: ((List<InAppContentBlock>) -> Unit)?) {
        carouselContentSelector.sortFn = sortFn
    }

    fun onContentFilterResponse(response: List<InAppContentBlock>) {
        carouselContentSelector.onFilterResponse(response)
    }

    fun onContentSortResponse(response: List<InAppContentBlock>) {
        carouselContentSelector.onSortResponse(response)
    }
}
