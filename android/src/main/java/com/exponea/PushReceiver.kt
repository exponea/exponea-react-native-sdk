package com.exponea

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.exponea.sdk.models.NotificationAction
import com.exponea.sdk.services.ExponeaPushReceiver
import com.google.gson.Gson
import java.lang.RuntimeException

class PushReceiver : BroadcastReceiver() {
    /*
    We respond to all push notification actions and pass the push notification information to ExponeaModule.
    For default "open app" action, we also start the application.
    For "deeplink" action, Exponea SDK will generate intent and it's up to the developer to implement Intent handler.
    For "web" action, Exponea SDK will generate intent that will be handled by the browser.
     */
    override fun onReceive(context: Context, intent: Intent) {
        val action = when (intent.action) {
            ExponeaPushReceiver.ACTION_CLICKED -> PushAction.app
            ExponeaPushReceiver.ACTION_DEEPLINK_CLICKED -> PushAction.deeplink
            ExponeaPushReceiver.ACTION_URL_CLICKED -> PushAction.web
            else -> throw RuntimeException("Unknown push notification action ${intent.action}")
        }
        val url = (intent.getSerializableExtra(ExponeaPushReceiver.EXTRA_ACTION_INFO) as? NotificationAction)?.url
        @Suppress("UNCHECKED_CAST")
        val pushData = intent.getSerializableExtra(ExponeaPushReceiver.EXTRA_CUSTOM_DATA) as Map<String, String>
        val additionalData = Gson().fromJson(pushData["attributes"], Map::class.java)
        ExponeaModule.openPush(OpenedPush(action, url, additionalData))

        if (intent.action == ExponeaPushReceiver.ACTION_CLICKED) {
            val actionIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            context.startActivity(actionIntent)
        }
    }
}
