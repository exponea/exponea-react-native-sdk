/*
 * Expo example helper: registers the example app's own native modules with React Native.
 *
 * What it is: a ReactPackage that exposes CustomerTokenStorage and TokenTracker
 * to the example JavaScript code (NativeModules.CustomerTokenStorage and
 * NativeModules.TokenTracker). It also hands the application context to
 * CustomerTokenStorage, because the MainApplication that Expo generates has no
 * app-wide singleton the classic example could use.
 *
 * Why it is here: Expo prebuild regenerates android/, so
 * example_expo/plugins/withExampleNativeHelpers.js copies this folder into the
 * generated project and adds `add(exponea.example.ExampleAppPackage())` to
 * MainApplication.
 *
 * Do integrators need it? No. The Bloomreach SDK registers its own native module
 * through autolinking. You only need a package like this for native modules of
 * your own.
 */
package exponea.example;

import androidx.annotation.NonNull;
import exponea.example.manager.CustomerTokenStorage;
import exponea.example.module.CustomerTokenStorageModule;
import exponea.example.module.TokenTrackerModule;
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
        // Load any persisted customer token configuration before JavaScript runs.
        CustomerTokenStorage.INSTANCE_HOLDER.INSTANCE.initialize(reactApplicationContext);
        return Arrays.asList(
                new CustomerTokenStorageModule(reactApplicationContext),
                new TokenTrackerModule(reactApplicationContext)
        );
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull final ReactApplicationContext reactApplicationContext) {
        return Collections.emptyList();
    }
}
