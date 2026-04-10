package com.exponea.widget

import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.Drawable
import android.util.TypedValue
import android.widget.Button
import com.exponea.asColorString
import com.exponea.asSize
import com.exponea.sdk.Exponea
import com.exponea.style.ButtonStyle
import com.facebook.react.bridge.Dynamic
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.AppInboxButtonManagerDelegate
import com.facebook.react.viewmanagers.AppInboxButtonManagerInterface

@ReactModule(name = AppInboxButtonManager.REACT_CLASS)
class AppInboxButtonManager :
    SimpleViewManager<Button>(),
    AppInboxButtonManagerInterface<Button> {

    private val delegate: ViewManagerDelegate<Button> =
        AppInboxButtonManagerDelegate(this)

    companion object {
        const val REACT_CLASS = "AppInboxButton"
    }

    private var buttonStyle: ButtonStyle? = null
    private var defaultTextColor: String? = null
    private var defaultIcon: Drawable? = null

    override fun getName() = REACT_CLASS

    override fun getDelegate(): ViewManagerDelegate<Button> = delegate

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

    // Codegen-generated interface methods
    override fun setTextOverride(button: Button, value: String?) {
        ensureStyle().merge(ButtonStyle(textOverride = value)).applyTo(button)
    }

    override fun setTextColor(button: Button, value: String?) {
        ensureStyle().merge(ButtonStyle(textColor = value ?: defaultTextColor)).applyTo(button)
    }

    override fun setBackgroundColor(button: Button, value: String?) {
        ensureStyle().merge(ButtonStyle(backgroundColor = value)).applyTo(button)
    }

    override fun setShowIcon(button: Button, value: Boolean) {
        ensureStyle().merge(ButtonStyle(showIcon = value))
        // ButtonStyle can only hide icon, so we need to handle showing it separately
        val icon = if (value) defaultIcon else null
        button.setCompoundDrawablesRelative(icon, null, null, null)
    }

    override fun setTextSize(button: Button, value: String?) {
        ensureStyle().merge(ButtonStyle(textSize = value)).applyTo(button)
    }

    override fun setEnabled(button: Button, value: Boolean) {
        ensureStyle().merge(ButtonStyle(enabled = value)).applyTo(button)
    }

    override fun setBorderRadius(button: Button, value: String?) {
        ensureStyle().merge(ButtonStyle(borderRadius = value)).applyTo(button)
    }

    override fun setTextWeight(button: Button, value: String?) {
        ensureStyle().merge(ButtonStyle(textWeight = value)).applyTo(button)
    }
}
