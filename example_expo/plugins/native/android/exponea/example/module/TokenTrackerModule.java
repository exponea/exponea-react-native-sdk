/*
 * Expo example helper: React Native bridge to TokenTracker (Android).
 *
 * What it is: the native module behind NativeModules.TokenTracker, used by the
 * "Track push token" button on the Tracking screen.
 *
 * Do integrators need it? No. The SDK config plugin already tracks push tokens
 * automatically through the generated MessageService. This only lets the
 * example re-send the current token on demand while testing.
 */
package exponea.example.module;

import androidx.annotation.NonNull;
import exponea.example.push.TokenTracker;
import com.facebook.react.bridge.BaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;

public class TokenTrackerModule extends BaseJavaModule {

    private final ReactApplicationContext reactContext;

    public TokenTrackerModule(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "TokenTracker";
    }

    @ReactMethod
    public void trackToken() {
        new TokenTracker().trackToken(reactContext);
    }
}
