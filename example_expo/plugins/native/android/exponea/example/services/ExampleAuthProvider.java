/*
 * Expo example helper: the SDK's customer token provider (Android).
 *
 * What it shows: how an app supplies customer tokens. The SDK calls
 * getAuthorizationToken() whenever it needs a token, and the example returns
 * one from CustomerTokenStorage. Returning null means no token is available.
 *
 * How the SDK finds it: through manifest meta-data named ExponeaAuthProvider
 * whose value is this class name. withExampleNativeHelpers.js adds that entry,
 * because the SDK's config plugin doesn't.
 *
 * Do integrators need it? Only if the project uses customer token
 * authorization. Then write your own provider implementing
 * RNAuthorizationProvider, and add a config plugin that copies it into the
 * generated project and registers the meta-data, like this example does. See
 * https://documentation.bloomreach.com/engagement/docs/react-native-sdk-authorization#customer-token-authorization
 */
package exponea.example.services;

import androidx.annotation.Nullable;
import com.exponea.RNAuthorizationProvider;
import exponea.example.manager.CustomerTokenStorage;

public class ExampleAuthProvider implements RNAuthorizationProvider {
    @Nullable
    @Override
    public String getAuthorizationToken() {
        // Receive and return JWT token here.
        return CustomerTokenStorage.INSTANCE_HOLDER.INSTANCE.retrieveJwtToken();
        // NULL as returned value will be handled by SDK as 'no value' and leads to Error
    }
}
