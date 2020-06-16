package com.exponea

import com.exponea.sdk.Exponea
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class ExponeaModule(val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    class ExponeaNotInitializedException :
        Exception("Exponea SDK is not configured. Call Exponea.configure() before calling functions of the SDK")
    class ExponeaConfigurationException : Exception {
        constructor(message: String) : super(message)
        constructor(message: String, cause: Throwable) : super(message, cause)
    }

    private fun requireInitialized(promise: Promise, block: ((Promise) -> Unit)) {
        if (!Exponea.isInitialized) {
            promise.reject(ExponeaNotInitializedException())
        } else {
            block.invoke(promise)
        }
    }

    override fun getName(): String {
        return "Exponea"
    }

    @ReactMethod
    fun configure(configMap: ReadableMap, promise: Promise) {
        try {
            Exponea.init(reactContext.currentActivity ?: reactContext, ConfigurationParser(configMap).parse())
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    @ReactMethod
    fun isConfigured(promise: Promise) {
        promise.resolve(Exponea.isInitialized)
    }

    @ReactMethod
    fun getCustomerCookie(promise: Promise) = requireInitialized(promise) {
        promise.resolve(Exponea.customerCookie)
    }
}
