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
