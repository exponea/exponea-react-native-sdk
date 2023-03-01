package com.exponea

import android.content.Context
import com.exponea.sdk.models.InAppMessage
import com.exponea.sdk.models.InAppMessageButton
import com.exponea.sdk.models.InAppMessageCallback
import com.exponea.sdk.util.Logger

class ReactNativeInAppActionListener(private val config: Map<String, Any?>) : InAppMessageCallback {
    override val overrideDefaultBehavior: Boolean
        get() = config.getNullSafely("overrideDefaultBehavior") ?: false
    override var trackActions: Boolean
        get() = config.getNullSafely("trackActions") ?: true
        set(@Suppress("UNUSED_PARAMETER") value) {
            Logger.e(this, "Track Actions flag can be change only via constructor of InAppMessage callback")
        }

    override fun inAppMessageAction(message: InAppMessage, button: InAppMessageButton?, interaction: Boolean, context: Context) {
        ExponeaModule.currentInstance?.onInAppAction(InAppMessageAction(
            message = message,
            button = button,
            interaction = interaction
        ))
    }

}
