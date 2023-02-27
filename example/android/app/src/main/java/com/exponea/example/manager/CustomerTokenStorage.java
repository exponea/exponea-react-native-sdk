package com.exponea.example.manager;

import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import com.exponea.example.MainApplication;
import com.exponea.sdk.util.Logger;
import com.google.gson.Gson;
import com.google.gson.annotations.SerializedName;
import com.google.gson.reflect.TypeToken;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import okhttp3.ResponseBody;

public class CustomerTokenStorage {
    private static final String CUSTOMER_TOKEN_CONF = "CustomerTokenConf";
    private NetworkManager networkManager = new NetworkManager();
    private Gson gson = new Gson();
    private SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(MainApplication.APP_INSTANCE);

    private String host = null;
    private String projectToken = null;
    private String publicKey = null;
    private Map<String, String> customerIds = null;
    private Integer expiration = null;

    private String tokenCache = null;
    private long lastTokenRequestTime = 0;

    public static final class INSTANCE_HOLDER {
        public static final CustomerTokenStorage INSTANCE = new CustomerTokenStorage();
    }

    public CustomerTokenStorage() {
        loadConfiguration();
        final String confJson = gson.toJson(confAsMap());
        Logger.INSTANCE.d(this, "[CTS] Conf loaded $confJson");
    }

    private void loadConfiguration() {
        final String confAsJson = prefs.getString(CUSTOMER_TOKEN_CONF, "");
        if (confAsJson == null || confAsJson.isEmpty()) {
            return;
        }
        final Map<String, String> confAsMap = gson.fromJson(
                confAsJson,
                new TypeToken<Map<String, String>>() {}.getType()
        );
        this.host = confAsMap.get("host");
        this.projectToken = confAsMap.get("projectToken");
        this.publicKey = confAsMap.get("publicKey");
        final String customerIdsString = confAsMap.get("customerIds");
        if (customerIdsString != null && !customerIdsString.isEmpty()) {
            this.customerIds = gson.fromJson(
                    customerIdsString,
                    new TypeToken<Map<String, String>>() {}.getType()
            );
        }
        final String expirationString = confAsMap.get("expiration");
        if (expirationString != null) {
            this.expiration = Integer.parseInt(expirationString);
        }
    }

    private Map<String, String> confAsMap()  {
        final Map<String, String> map = new HashMap<>();
        map.put("host", this.host);
        map.put("projectToken", this.projectToken);
        map.put("publicKey", this.publicKey);
        map.put("customerIds", this.customerIds == null ? null : gson.toJson(this.customerIds));
        map.put("expiration", this.expiration == null ? null : String.valueOf(this.expiration));
        return map;
    }

    private void storeConfig() {
        final Map<String, String> confMap = confAsMap();
        final String confAsJson = gson.toJson(confMap);
        prefs.edit()
                .putString(CUSTOMER_TOKEN_CONF, confAsJson)
                .apply();
    }

    private String loadJwtToken() throws IOException {
        if (host == null || projectToken == null ||
                publicKey == null || customerIds == null ||
                customerIds.size() == 0
        ) {
            Logger.INSTANCE.d(this, "[CTS] Not configured yet");
            return null;
        }
        final Map<String, Object> reqBody = new HashMap<>();
        reqBody.put("project_id", projectToken);
        reqBody.put("kid", publicKey);
        reqBody.put("sub", customerIds);
        if (expiration != null) {
            reqBody.put("exp", expiration);
        }
        final String jsonRequest = gson.toJson(reqBody);
        final okhttp3.Response response = networkManager.post(
                this.host + "/webxp/exampleapp/customertokens",
                null,
                jsonRequest
        ).execute();
        Logger.INSTANCE.d(this, "[CTS] Requested for token with " + jsonRequest);
        if (!response.isSuccessful()) {
            if (response.code() == 404) {
                // that is fine, only some BE has this endpoint
                Logger.INSTANCE.d(this, "[CTS] Token request returns 404");
                return null;
            }
            Logger.INSTANCE.e(this, "[CTS] Token request returns " + response.code());
            return null;
        }
        final ResponseBody respBody = response.body();
        final String jsonResponse = respBody == null ? null : respBody.string();
        Response responseData;
        try {
            responseData = gson.fromJson(jsonResponse, Response.class);
        } catch (Exception e) {
            Logger.INSTANCE.e(this, "[CTS] Token cannot be parsed from " + jsonResponse);
            return null;
        }
        if (responseData.token == null) {
            Logger.INSTANCE.e(this, "[CTS] Token received NULL");
        }
        Logger.INSTANCE.d(this, "[CTS] Token received " + responseData.token);
        return responseData.token;
    }

    private static class Response {
        @SerializedName("customer_token")
        public String token;

        @SerializedName("expire_time")
        public Integer expiration;
    }

    public void configure(
            String host,
            String projectToken,
            String publicKey,
            Map<String, String> customerIds,
            Integer expiration
    ) {
        this.host = host == null ? this.host : host;
        this.projectToken = projectToken == null ? this.projectToken : projectToken;
        this.publicKey = publicKey == null ? this.publicKey : publicKey;
        this.customerIds = customerIds == null ? this.customerIds : customerIds;
        this.expiration = expiration == null ? this.expiration : expiration;
        storeConfig();
        // reset token
        tokenCache = null;
        lastTokenRequestTime = 0;
    }

    public String retrieveJwtToken() {
        final long now = System.currentTimeMillis();
        if (TimeUnit.MILLISECONDS.toMinutes(Math.abs(now - lastTokenRequestTime)) < 5) {
            // allows request for token once per 5 minutes, doesn't care if cache is NULL
            Logger.INSTANCE.d(this, "[CTS] Token retrieved within 5min, using cache " + tokenCache);
            return tokenCache;
        }
        lastTokenRequestTime = now;
        if (tokenCache != null) {
            // return cached value
            Logger.INSTANCE.d(this, "[CTS] Token cache returned " + tokenCache);
            return tokenCache;
        }
        synchronized(this) {
            // recheck nullity just in case
            if (tokenCache == null) {
                try {
                    tokenCache = loadJwtToken();
                } catch (IOException e) {
                    tokenCache = null;
                }
            }
        }
        return tokenCache;
    }

}
