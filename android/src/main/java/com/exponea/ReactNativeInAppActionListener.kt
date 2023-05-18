package com.exponea

import android.content.Context
import com.exponea.sdk.models.InAppMessage
import com.exponea.sdk.models.InAppMessageButton
import com.exponea.sdk.models.InAppMessageCallback
import com.exponea.sdk.util.Logger

class ReactNativeInAppActionListener(
    override val overrideDefaultBehavior: Boolean,
    override var trackActions: Boolean,
    private val reactModuleCallback: (InAppMessageAction) -> Unit
) : InAppMessageCallback {
    override fun inAppMessageAction(
        message: InAppMessage,
        button: InAppMessageButton?,
        interaction: Boolean,
        context: Context
    ) {
        Logger.e(this, "InApp action received = proxy")
        reactModuleCallback.invoke(InAppMessageAction(
            message = message,
            button = button,
            interaction = interaction
        ))
    }
}
