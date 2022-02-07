package com.exponea.example;

import android.app.NotificationManager;
import android.content.Context;
import androidx.annotation.NonNull;
import com.exponea.ExponeaModule;
import com.huawei.hms.push.HmsMessageService;
import com.huawei.hms.push.RemoteMessage;

public class MessageService extends HmsMessageService {

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        ExponeaModule.Companion.handleRemoteMessage(
                getApplicationContext(),
                remoteMessage.getDataOfMap(),
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE));
    }

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        ExponeaModule.Companion.handleNewHmsToken(
                getApplicationContext(),
                token);
    }
}
