package exponea.example

import android.app.NotificationManager
import android.content.Context
import com.exponea.ExponeaModule
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MessageService : FirebaseMessagingService() {

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        ExponeaModule.handleRemoteMessage(
            applicationContext,
            message.data,
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        )
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        ExponeaModule.handleNewToken(applicationContext, token)
    }
}
