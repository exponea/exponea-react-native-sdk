package com.exponea.example;

import androidx.annotation.NonNull;
import com.exponea.example.module.CustomerTokenStorageModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class ExampleAppPackage implements com.facebook.react.ReactPackage {
    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull final ReactApplicationContext reactApplicationContext) {
        return Arrays.asList(
                new CustomerTokenStorageModule()
        );
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull final ReactApplicationContext reactApplicationContext) {
        return Collections.emptyList();
    }
}
