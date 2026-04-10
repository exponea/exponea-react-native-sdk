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
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.lang.RuntimeException

/**
 * PushReceiver handles push notification actions and emits events to JavaScript.
 * This BroadcastReceiver is triggered by Exponea SDK when push notifications are interacted with.
 *
 * For TurboModule architecture, we use:
 * - Companion object to hold ReactApplicationContext reference
 * - Direct event emission via DeviceEventManagerModule
 * - Pending event queue for events received before JS listener is ready
 */
class PushReceiver : BroadcastReceiver() {

    companion object {
        private var reactContext: ReactApplicationContext? = null
        private var pendingOpenedPush: OpenedPush? = null

        /**
         * Called from ExponeaModule when JS listener is set/removed.
         * Sets up the ReactContext for event emission.
         */
        fun setReactContext(context: ReactApplicationContext?) {
            reactContext = context
            // Send any pending events
            pendingOpenedPush?.let { sendPushOpenedEvent(it) }
            pendingOpenedPush = null
        }

        /**
         * Emits pushOpened event to JavaScript, or queues it if listener not ready.
         */
        private fun sendPushOpenedEvent(openedPush: OpenedPush) {
            reactContext?.let { context ->
                try {
                    val map = openedPush.toWritableMap()
                    context
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("pushOpened", map)
                } catch (e: Exception) {
                    e.printStackTrace()
                    // Queue if emission fails
                    pendingOpenedPush = openedPush
                }
            } ?: run {
                // Queue if context not ready
                pendingOpenedPush = openedPush
            }
        }
    }

    /**
     * Called by Android system when push notification action is triggered.
     * Extracts push data and emits event to JavaScript.
     *
     * Action types:
     * - ACTION_CLICKED: Default "open app" action
     * - ACTION_DEEPLINK_CLICKED: Deep link action (developer implements Intent handler)
     * - ACTION_URL_CLICKED: Web URL action (handled by browser)
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
        val pushData = intent.getSerializableExtra(EXTRA_CUSTOM_DATA) as? Map<String, String>
        val additionalData = pushData?.let { data ->
            try {
                ExponeaGson.instance.fromJson(data["attributes"], Map::class.java)
            } catch (e: Exception) {
                null
            }
        }

        val openedPush = OpenedPush(action, url, additionalData)
        sendPushOpenedEvent(openedPush)
    }
}
