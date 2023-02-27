package com.exponea.example.manager;

import androidx.annotation.NonNull;
import java.io.IOException;
import java.util.Objects;
import okhttp3.Call;
import okhttp3.Interceptor;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Protocol;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;

public class NetworkManager {
    private final MediaType mediaTypeJson = MediaType.parse("application/json");
    private final OkHttpClient networkClient;

    public NetworkManager() {
        final Interceptor networkInterceptor = getNetworkInterceptor();
        networkClient = new OkHttpClient.Builder()
                .addInterceptor(networkInterceptor)
                .build();
    }
    private Interceptor getNetworkInterceptor()  {
        return it -> {
            final Request request = it.request();
            try {
                return it.proceed(request);
            } catch (Exception e) {
                // Sometimes the request can fail due to SSL problems crashing the app. When that
                // happens, we return a dummy failed request
                final String message = "Error: request canceled by " + e.getLocalizedMessage();
                return new Response.Builder()
                        .code(400)
                        .protocol(Protocol.HTTP_2)
                        .message(message)
                        .request(it.request())
                        .body(ResponseBody.create(MediaType.parse("text/plain"), message))
                        .build();
            }
        };
    }
    private Call request(String method, String url, String authorization, String body) {
        final Request.Builder requestBuilder = new Request.Builder().url(url);
        requestBuilder.addHeader("Content-Type", "application/json");
        if (authorization != null) {
            requestBuilder.addHeader("Authorization", authorization);
        }
        if (body != null) {
            if (Objects.equals(method, "GET")) {
                requestBuilder.get();
            } else if (Objects.equals(method, "POST")) {
                requestBuilder.post(RequestBody.create(mediaTypeJson, body));
            } else {
                throw new RuntimeException("Http method " + method + " not supported.");
            }
        }
        return networkClient.newCall(requestBuilder.build());
    }
    public Call post(String url, String authorization, String body) {
        return request("POST", url, authorization, body);
    }

    public Call get(String url, String authorization) {
        return request("GET", url, authorization, null);
    }
}
