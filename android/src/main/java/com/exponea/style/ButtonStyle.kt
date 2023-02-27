package com.exponea.style

import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.Drawable
import android.graphics.drawable.DrawableWrapper
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.InsetDrawable
import android.graphics.drawable.LayerDrawable
import android.graphics.drawable.RippleDrawable
import android.widget.Button
import com.exponea.applyTint
import com.exponea.asColor
import com.exponea.asSize
import com.exponea.sdk.util.Logger
import com.exponea.toTypeface
import com.facebook.react.bridge.DynamicFromObject

data class ButtonStyle(
    var textOverride: String? = null,
    var textColor: String? = null,
    var backgroundColor: String? = null,
    var showIcon: Boolean? = null,
    var textSize: String? = null,
    var enabled: Boolean? = null,
    var borderRadius: String? = null,
    var textWeight: String? = null
) {
    private fun applyColorTo(target: Drawable?, color: Int): Boolean {
        if (target == null) {
            return false
        }
        val colorizedDrawable = findColorizedDrawable(target)
        when (colorizedDrawable) {
            is GradientDrawable -> { colorizedDrawable.setColor(color) }
            is ColorDrawable -> { colorizedDrawable.color = color }
        }
        Logger.e(this, "Unable to find colored background")
        return false
    }
    private fun findColorizedDrawable(root: Drawable?): Drawable? {
        if (root == null) {
            return null
        }
        when (root) {
            is GradientDrawable -> return root
            is ColorDrawable -> return root
            is DrawableWrapper -> return findColorizedDrawable(root.drawable)
            is LayerDrawable -> {
                for (i in 0 until root.numberOfLayers) {
                    val drawableLayer = root.getDrawable(i)
                    val colorizedDrawable = findColorizedDrawable(drawableLayer)
                    if (colorizedDrawable != null) {
                        return colorizedDrawable
                    }
                    // continue
                }
                Logger.d(this, "No colorizable Drawable found in LayerDrawable")
                return null
            }
            else -> {
                Logger.d(this, "Not implemented Drawable type to search colorized drawable")
                return null
            }
        }
    }
    fun applyTo(button: Button) {
        textOverride?.let {
            button.text = it
        }
        DynamicFromObject(textColor).asColor()?.let {
            button.setTextColor(it)
            val origIcons = button.compoundDrawablesRelative
            button.setCompoundDrawablesRelative(
                origIcons[0].applyTint(it),
                origIcons[1].applyTint(it),
                origIcons[2].applyTint(it),
                origIcons[3].applyTint(it)
            )
        }
        DynamicFromObject(backgroundColor).asColor()?.let {
            val currentBackground = button.background
            if (!applyColorTo(currentBackground, it)) {
                Logger.d(this, "Overriding color as new background")
                button.setBackgroundColor(it)
            }
        }
        showIcon?.let {
            if (!it) {
                button.setCompoundDrawablesRelative(null, null, null, null)
            }
        }
        DynamicFromObject(textSize).asSize()?.let {
            button.setTextSize(it.unit, it.size)
        }
        button.setTypeface(button.typeface, toTypeface(textWeight))
        enabled?.let {
            button.isEnabled = it
        }
        DynamicFromObject(borderRadius).asSize()?.let {
            when (val currentBackground = button.background) {
                is GradientDrawable -> {
                    currentBackground.cornerRadius = it.size
                    button.background = currentBackground
                }
                is ColorDrawable -> {
                    val newBackground = GradientDrawable()
                    newBackground.cornerRadius = it.size
                    newBackground.setColor(currentBackground.color)
                    button.background = newBackground
                }
                is RippleDrawable -> {
                    for (i in 0 until currentBackground.numberOfLayers) {
                        try {
                            val drawable = currentBackground.getDrawable(i)
                            if (drawable is InsetDrawable) {
                                val subdrawable = drawable.drawable
                                Logger.e(this, "SubDrawable $i is ${subdrawable?.javaClass}")
                                if (subdrawable is GradientDrawable) {
                                    subdrawable.cornerRadius = it.size
                                }
                            }
                            Logger.e(this, "Drawable $i is ${drawable.javaClass}")
                        } catch (e: Exception) {
                            Logger.e(this, "No Drawable for $i")
                        }
                    }
                    Logger.e(this, "Background is ${currentBackground.current.javaClass}")
                    button.background = currentBackground
                }
                else -> {
                    Logger.e(this, "BorderRadius for Button can be used only with colored background")
                }
            }
        }
    }

    fun merge(source: ButtonStyle): ButtonStyle {
        this.textOverride = source.textOverride
        this.textColor = source.textColor ?: this.textColor
        this.backgroundColor = source.backgroundColor ?: this.backgroundColor
        this.showIcon = source.showIcon ?: this.showIcon
        this.textSize = source.textSize ?: this.textSize
        this.enabled = source.enabled ?: this.enabled
        this.borderRadius = source.borderRadius ?: this.borderRadius
        return this
    }
}
