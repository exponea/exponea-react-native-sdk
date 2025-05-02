package com.exponea.widget.carousel

import com.exponea.sdk.models.ContentBlockSelector
import com.exponea.sdk.models.InAppContentBlock
import com.exponea.sdk.util.Logger
import java.util.concurrent.CompletableFuture
import java.util.concurrent.TimeUnit

class BridgedContentBlockCarouselSelector(
    var filterFn: ((List<InAppContentBlock>) -> Unit)? = null,
    var sortFn: ((List<InAppContentBlock>) -> Unit)? = null
) : ContentBlockSelector() {

    companion object {
        private const val RESPONSE_TIMEOUT_MILLIS = 2000L
    }

    private var filterResponse: CompletableFuture<List<InAppContentBlock>>? = null
    private var sortResponse: CompletableFuture<List<InAppContentBlock>>? = null

    override fun filterContentBlocks(source: List<InAppContentBlock>): List<InAppContentBlock> {
        val filterOverride = filterFn
        if (filterOverride != null) {
            try {
                filterOverride.invoke(source)
                return awaitForFilterResponse()
            } catch (e: Exception) {
                Logger.e(this, "InAppCbCarousel: Custom filter failed, invoking original behaviour", e)
                // continue with super implementation
            }
        }
        return super.filterContentBlocks(source)
    }

    private fun awaitForFilterResponse(): List<InAppContentBlock> {
        // cancel previous awaiting
        filterResponse?.cancel(true)
        // register new awaiting
        return CompletableFuture<List<InAppContentBlock>>().also {
            this.filterResponse = it
        }.get(RESPONSE_TIMEOUT_MILLIS, TimeUnit.MILLISECONDS)
    }

    override fun sortContentBlocks(source: List<InAppContentBlock>): List<InAppContentBlock> {
        val sortOverride = sortFn
        if (sortOverride != null) {
            try {
                sortOverride.invoke(source)
                return awaitForSortResponse()
            } catch (e: Exception) {
                Logger.e(this, "InAppCbCarousel: Custom sort failed, invoking original behaviour", e)
                // continue with super implementation
            }
        }
        return super.sortContentBlocks(source)
    }

    private fun awaitForSortResponse(): List<InAppContentBlock> {
        // cancel previous awaiting
        sortResponse?.cancel(true)
        // register new awaiting
        return CompletableFuture<List<InAppContentBlock>>().also {
            this.sortResponse = it
        }.get(RESPONSE_TIMEOUT_MILLIS, TimeUnit.MILLISECONDS)
    }

    fun onFilterResponse(response: List<InAppContentBlock>) {
        filterResponse?.complete(response)
    }

    fun onSortResponse(response: List<InAppContentBlock>) {
        sortResponse?.complete(response)
    }
}
