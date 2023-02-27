package com.exponea.widget

import android.graphics.drawable.Drawable
import android.widget.Button
import com.exponea.asColorString
import com.exponea.asSize
import com.exponea.sdk.Exponea
import com.exponea.style.ButtonStyle
import com.facebook.react.bridge.Dynamic
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class AppInboxButtonManager : SimpleViewManager<Button>() {
    override fun getName() = "RNAppInboxButton"

    private var buttonStyle: ButtonStyle? = null
    private var defaultTextColor: String? = null
    private var defaultIcon: Drawable? = null

    override fun createViewInstance(reactContext: ThemedReactContext): Button {
        val button = Exponea.appInboxProvider.getAppInboxButton(reactContext)
        defaultIcon = button.compoundDrawablesRelative[0]
        defaultTextColor = button.currentTextColor.asColorString()
        buttonStyle = ButtonStyle(textColor = defaultTextColor)
        return button
    }

    private fun ensureStyle(): ButtonStyle {
        if (buttonStyle == null) {
            synchronized(this) {
                if (buttonStyle == null) {
                    buttonStyle = ButtonStyle()
                }
            }
        }
        return buttonStyle!!
    }

    @ReactProp(name = "textOverride")
    fun setText(button: Button, value: String?) {
        ensureStyle().merge(ButtonStyle(textOverride = value)).applyTo(button)
    }

    @ReactProp(name = "textColor")
    fun setTextColor(button: Button, value: String?) {
        ensureStyle().merge(ButtonStyle(textColor = value ?: defaultTextColor)).applyTo(button)
    }

    @ReactProp(name = "backgroundColor")
    fun setBackgroundColor(button: Button, value: String?) {
        ensureStyle().merge(ButtonStyle(backgroundColor = value)).applyTo(button)
    }

    @ReactProp(name = "showIcon")
    fun setShowIcon(button: Button, value: Boolean?) {
        ensureStyle().merge(ButtonStyle(showIcon = value))
        // !!! ButtonStyle is able only to hide icon
        value?.let {
            val icon = if (it) defaultIcon else null
            button.setCompoundDrawablesRelative(icon, null, null, null)
        }
    }

    @ReactProp(name = "textSize")
    fun setTextSize(button: Button, value: Dynamic) {
        ensureStyle().merge(ButtonStyle(textSize = value.asSize()?.asString())).applyTo(button)
    }

    @ReactProp(name = "enabled")
    fun setEnabled(button: Button, value: Boolean?) {
        ensureStyle().merge(ButtonStyle(enabled = value)).applyTo(button)
    }

    @ReactProp(name = "borderRadius")
    fun setBorderRadius(button: Button, value: Dynamic) {
        ensureStyle().merge(ButtonStyle(borderRadius = value.asSize()?.asString())).applyTo(button)
    }

    @ReactProp(name = "textWeight")
    fun setFontWeight(button: Button, value: String?) {
        ensureStyle().merge(ButtonStyle(textWeight = value)).applyTo(button)
    }
}
