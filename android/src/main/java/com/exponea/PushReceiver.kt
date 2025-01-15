package com.exponea

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.exponea.sdk.ExponeaExtras.Companion.ACTION_CLICKED
import com.exponea.sdk.ExponeaExtras.Companion.ACTION_DEEPLINK_CLICKED
import com.exponea.sdk.ExponeaExtras.Companion.ACTION_URL_CLICKED
import com.exponea.sdk.ExponeaExtras.Companion.EXTRA_ACTION_INFO
import com.exponea.sdk.ExponeaExtras.Companion.EXTRA_CUSTOM_DATA
import com.exponea.sdk.models.NotificationAction
import com.exponea.sdk.util.ExponeaGson
import java.lang.RuntimeException

class PushReceiver : BroadcastReceiver() {
    /*
    We respond to all push notification actions and pass the push notification information to ExponeaModule.
    For default "open app" action, Exponea SDK will start the application.
    For "deeplink" action, Exponea SDK will generate intent and it's up to the developer to implement Intent handler.
    For "web" action, Exponea SDK will generate intent that will be handled by the browser.
     */
    override fun onReceive(context: Context, intent: Intent) {
        val action = when (intent.action) {
            ACTION_CLICKED -> PushAction.app
            ACTION_DEEPLINK_CLICKED -> PushAction.deeplink
            ACTION_URL_CLICKED -> PushAction.web
            else -> throw RuntimeException("Unknown push notification action ${intent.action}")
        }
        val url = (intent.getSerializableExtra(EXTRA_ACTION_INFO) as? NotificationAction)?.url
        @Suppress("UNCHECKED_CAST")
        val pushData = intent.getSerializableExtra(EXTRA_CUSTOM_DATA) as Map<String, String>
        val additionalData = ExponeaGson.instance.fromJson(pushData["attributes"], Map::class.java)
        ExponeaModule.openPush(OpenedPush(action, url, additionalData))
    }
}
