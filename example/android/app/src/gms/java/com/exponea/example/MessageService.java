package com.exponea.example;

import android.app.NotificationManager;
import android.content.Context;
import androidx.annotation.NonNull;
import com.exponea.ExponeaModule;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MessageService extends FirebaseMessagingService {

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        ExponeaModule.Companion.handleRemoteMessage(
                getApplicationContext(),
                remoteMessage.getData(),
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE));
    }

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        ExponeaModule.Companion.handleNewToken(
                getApplicationContext(),
                token);
    }
}
