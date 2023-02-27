package com.exponea.example.services;

import androidx.annotation.Nullable;
import com.exponea.RNAuthorizationProvider;
import com.exponea.example.manager.CustomerTokenStorage;

public class ExampleAuthProvider implements RNAuthorizationProvider {
    @Nullable
    @Override
    public String getAuthorizationToken() {
        // Receive and return JWT token here.
        return CustomerTokenStorage.INSTANCE_HOLDER.INSTANCE.retrieveJwtToken();
        // NULL as returned value will be handled by SDK as 'no value' and leads to Error
    }
}
