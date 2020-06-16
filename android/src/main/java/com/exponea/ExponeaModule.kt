package com.exponea

import com.exponea.sdk.Exponea
import com.exponea.sdk.models.CustomerIds
import com.exponea.sdk.models.FlushMode
import com.exponea.sdk.models.FlushPeriod
import com.exponea.sdk.models.PropertiesList
import com.exponea.sdk.util.Logger
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import java.util.concurrent.TimeUnit

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

    @ReactMethod
    fun checkPushSetup(promise: Promise) {
        // TODO not available until Android SDK is updated in EXRN-32
        // Exponea.checkPushSetup = true
        promise.resolve(null)
    }

    @ReactMethod
    fun getFlushMode(promise: Promise) {
        promise.resolve(Exponea.flushMode.name)
    }

    @ReactMethod
    fun setFlushMode(flushMode: String, promise: Promise) {
        try {
            Exponea.flushMode = FlushMode.valueOf(flushMode)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    @ReactMethod
    fun getFlushPeriod(promise: Promise) {
        promise.resolve(Exponea.flushPeriod.amount.toDouble())
    }

    @ReactMethod
    fun setFlushPeriod(period: Double, promise: Promise) {
        try {
            Exponea.flushPeriod = FlushPeriod(period.toLong(), TimeUnit.SECONDS)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    @ReactMethod
    fun getLogLevel(promise: Promise) {
        promise.resolve(Exponea.loggerLevel.name)
    }

    @ReactMethod
    fun setLogLevel(level: String, promise: Promise) {
        try {
            Exponea.loggerLevel = Logger.Level.valueOf(level)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    @ReactMethod
    fun identifyCustomer(
        customerIdsMap: ReadableMap,
        propertiesMap: ReadableMap,
        promise: Promise
    ) = requireInitialized(promise) {
        val customerIds = CustomerIds()
        customerIdsMap.toHashMap().forEach { if (it.value is String) customerIds.withId(it.key, it.value as String) }
        val properties = PropertiesList(
            propertiesMap.toHashMapRecursively().filterValues { it != null } as HashMap<String, Any>
        )
        Exponea.identifyCustomer(customerIds, properties)
        promise.resolve(null)
    }

    @ReactMethod
    fun flushData(promise: Promise) = requireInitialized(promise) {
        Exponea.flushData { promise.resolve(null) }
    }

    @ReactMethod
    fun trackEvent(
        eventName: String,
        params: ReadableMap,
        timestamp: ReadableMap,
        promise: Promise
    ) = requireInitialized(promise) {
        try {
            val propertiesList = PropertiesList(
                params.toHashMapRecursively().filterValues { it != null } as HashMap<String, Any>
            )
            var unwrappedTimestamp: Double? = null
            if (timestamp.hasKey("timestamp") && !timestamp.isNull("timestamp")) {
                unwrappedTimestamp = timestamp.getDouble("timestamp")
            }
            Exponea.trackEvent(propertiesList, unwrappedTimestamp, eventName)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    @ReactMethod
    fun trackSessionStart(timestamp: ReadableMap, promise: Promise) = requireInitialized(promise) {
        if (timestamp.hasKey("timestamp") && !timestamp.isNull("timestamp")) {
            Exponea.trackSessionStart(timestamp.getDouble("timestamp"))
        } else {
            Exponea.trackSessionStart()
        }
        promise.resolve(null)
    }

    @ReactMethod
    fun trackSessionEnd(timestamp: ReadableMap, promise: Promise) = requireInitialized(promise) {
        if (timestamp.hasKey("timestamp") && !timestamp.isNull("timestamp")) {
            Exponea.trackSessionEnd(timestamp.getDouble("timestamp"))
        } else {
            Exponea.trackSessionEnd()
        }
        promise.resolve(null)
    }
}
