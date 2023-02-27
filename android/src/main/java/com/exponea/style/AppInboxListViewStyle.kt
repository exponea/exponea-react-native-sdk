package com.exponea.style

import androidx.recyclerview.widget.RecyclerView
import com.exponea.asColor
import com.facebook.react.bridge.DynamicFromObject

data class AppInboxListViewStyle(
    var backgroundColor: String? = null,
    var item: AppInboxListItemStyle? = null
) {
    fun applyTo(target: RecyclerView) {
        DynamicFromObject(backgroundColor).asColor()?.let {
            target.setBackgroundColor(it)
        }
        // note: 'item' style is used elsewhere due to performance reasons
    }
}
