/*
 * Expo example helper: re-sends the current Firebase push token to the SDK (Android).
 *
 * What it shows: reading the current FCM token and passing it to
 * ExponeaModule.handleNewToken, the same entry point the generated
 * MessageService calls when Firebase issues a new token.
 *
 * Do integrators need it? No. Token tracking is automatic once the SDK config
 * plugin is enabled and google-services.json is configured. Use this pattern
 * only if you need to push the token to the SDK yourself, for example after
 * re-initializing the SDK.
 */
package exponea.example.push

import android.content.Context
import com.exponea.ExponeaModule
import com.google.firebase.messaging.FirebaseMessaging

class TokenTracker {
    fun trackToken(context: Context?) {
        FirebaseMessaging.getInstance().token.addOnSuccessListener {
            ExponeaModule.handleNewToken(context?.applicationContext ?: return@addOnSuccessListener, it)
        }
    }
}
