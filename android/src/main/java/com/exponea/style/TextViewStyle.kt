package com.exponea.style

import android.view.View
import android.widget.TextView
import com.exponea.PlatformSize
import com.exponea.asColor
import com.exponea.toTypeface
import com.facebook.react.bridge.DynamicFromObject

data class TextViewStyle(
    var visible: Boolean? = null,
    var textColor: String? = null,
    var textSize: String? = null,
    var textWeight: String? = null,
    var textOverride: String? = null
) {
    fun applyTo(target: TextView) {
        visible?.let {
            target.visibility = if (it) View.VISIBLE else View.GONE
        }
        DynamicFromObject(textColor).asColor()?.let {
            target.setTextColor(it)
        }
        PlatformSize.parse(textSize)?.let {
            target.setTextSize(it.unit, it.size)
        }
        textWeight?.let {
            target.setTypeface(target.typeface, toTypeface(it))
        }
        textOverride?.let { target.text = it }
    }
}
