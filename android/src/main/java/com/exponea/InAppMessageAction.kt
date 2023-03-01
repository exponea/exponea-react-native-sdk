package com.exponea

import com.exponea.sdk.models.InAppMessage
import com.exponea.sdk.models.InAppMessageButton

data class InAppMessageAction(
    var message: InAppMessage,
    var button: InAppMessageButton?,
    var interaction: Boolean
)
