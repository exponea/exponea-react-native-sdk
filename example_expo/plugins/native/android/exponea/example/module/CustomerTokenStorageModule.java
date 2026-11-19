/*
 * Expo example helper: React Native bridge to CustomerTokenStorage (Android).
 *
 * What it is: the native module behind NativeModules.CustomerTokenStorage. Its
 * configure() receives the token settings from example_expo/src/App.tsx and
 * IdentifyCustomerModal.tsx and passes them to CustomerTokenStorage.
 *
 * Do integrators need it? No. It only exists so the example can configure its
 * demo token source from JavaScript. Your own auth provider can read its
 * settings from wherever your app keeps them.
 */
package exponea.example.module;

import androidx.annotation.NonNull;
import exponea.example.manager.CustomerTokenStorage;
import com.facebook.react.bridge.BaseJavaModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReactApplicationContext;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class CustomerTokenStorageModule extends BaseJavaModule {

    private final ReactApplicationContext reactContext;

    public CustomerTokenStorageModule(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

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
                reactContext, host, projectToken, publicKey, customerIds, expiration
        );
        promise.resolve(null);
    }
}
