package exponea.example

import android.app.NotificationManager
import android.content.Context
import com.exponea.ExponeaModule
import com.huawei.hms.push.HmsMessageService
import com.huawei.hms.push.RemoteMessage

class MessageService : HmsMessageService() {

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        ExponeaModule.handleRemoteMessage(
            applicationContext,
            message.dataOfMap,
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        )
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        ExponeaModule.handleNewHmsToken(applicationContext, token)
    }
}
