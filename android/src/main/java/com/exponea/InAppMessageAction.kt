package com.exponea

import com.exponea.sdk.models.InAppMessage
import com.exponea.sdk.models.InAppMessageButton

data class InAppMessageAction(
    var message: InAppMessage? = null,
    var button: InAppMessageButton? = null,
    var interaction: Boolean? = null,
    var errorMessage: String? = null,
    var type: InAppMessageActionType
)

enum class InAppMessageActionType {
    SHOW, ACTION, CLOSE, ERROR
}
