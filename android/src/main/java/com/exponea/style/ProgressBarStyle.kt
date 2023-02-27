package com.exponea.style

import android.content.res.ColorStateList
import android.view.View
import android.widget.ProgressBar
import com.exponea.asColor
import com.facebook.react.bridge.DynamicFromObject

data class ProgressBarStyle(
    var visible: Boolean? = null,
    var progressColor: String? = null,
    var backgroundColor: String? = null
) {
    fun applyTo(target: ProgressBar) {
        visible?.let {
            target.visibility = if (it) View.VISIBLE else View.GONE
        }
        DynamicFromObject(progressColor).asColor()?.let {
            target.progressTintList = ColorStateList.valueOf(it)
        }
        DynamicFromObject(backgroundColor).asColor()?.let {
            target.setBackgroundColor(it)
        }
    }
}
