package com.exponea.example.module;

import androidx.annotation.NonNull;
import com.exponea.example.manager.CustomerTokenStorage;
import com.facebook.react.bridge.BaseJavaModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class CustomerTokenStorageModule extends BaseJavaModule {

    @NonNull
    @Override
    public String getName() {
        return "CustomerTokenStorage";
    }

    @ReactMethod
    public void configure(ReadableMap configMap, Promise promise) {
        if (configMap == null) {
            promise.resolve(null);
            return;
        }
        final String host = configMap.getString("host");
        final String projectToken = configMap.getString("projectToken");
        final String publicKey = configMap.getString("publicKey");
        final ReadableMap idsMap = configMap.getMap("customerIds");
        final Map<String, String> customerIds;
        if (idsMap == null) {
            customerIds = null;
        } else {
            customerIds = new HashMap<>();
            final Iterator<Map.Entry<String, Object>> iterator = idsMap.getEntryIterator();
            Map.Entry<String, Object> item;
            while (iterator.hasNext()) {
                item = iterator.next();
                customerIds.put(item.getKey(), String.valueOf(item.getValue()));
            }
        }
        Integer expiration = null;
        if (configMap.hasKey("expiration") && !configMap.isNull("expiration")) {
            expiration = configMap.getInt("expiration");
        }
        CustomerTokenStorage.INSTANCE_HOLDER.INSTANCE.configure(
                host, projectToken, publicKey, customerIds, expiration
        );
    }
}
