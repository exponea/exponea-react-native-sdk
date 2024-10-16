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
    override fun inAppMessageClickAction(message: InAppMessage, button: InAppMessageButton, context: Context) {
        Logger.d(this, "InApp click action received = proxy")
        reactModuleCallback.invoke(InAppMessageAction(
            message = message,
            button = button,
            type = InAppMessageActionType.ACTION
        ))
    }

    override fun inAppMessageCloseAction(
        message: InAppMessage,
        button: InAppMessageButton?,
        interaction: Boolean,
        context: Context
    ) {
        Logger.d(this, "InApp close action received = proxy")
        reactModuleCallback.invoke(InAppMessageAction(
            message = message,
            button = button,
            interaction = interaction,
            type = InAppMessageActionType.CLOSE
        ))
    }

    override fun inAppMessageError(message: InAppMessage?, errorMessage: String, context: Context) {
        Logger.d(this, "InApp error received = proxy")
        reactModuleCallback.invoke(InAppMessageAction(
            message = message,
            errorMessage = errorMessage,
            type = InAppMessageActionType.ERROR
        ))
    }

    override fun inAppMessageShown(message: InAppMessage, context: Context) {
        Logger.d(this, "InApp shown report received = proxy")
        reactModuleCallback.invoke(InAppMessageAction(
            message = message,
            type = InAppMessageActionType.SHOW
        ))
    }
}
