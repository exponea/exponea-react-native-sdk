package com.exponea

import com.exponea.sdk.Exponea
import com.exponea.sdk.models.CustomerIds
import com.exponea.sdk.models.CustomerRecommendationOptions
import com.exponea.sdk.models.EventType
import com.exponea.sdk.models.ExponeaConfiguration
import com.exponea.sdk.models.ExponeaProject
import com.exponea.sdk.models.FlushMode
import com.exponea.sdk.models.FlushPeriod
import com.exponea.sdk.models.PropertiesList
import com.exponea.sdk.util.Logger
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.google.gson.Gson
import java.util.concurrent.TimeUnit

class ExponeaModule(val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    class ExponeaNotInitializedException :
        Exception("Exponea SDK is not configured. Call Exponea.configure() before calling functions of the SDK")
    class ExponeaDataException : Exception {
        constructor(message: String) : super(message)
        constructor(message: String, cause: Throwable) : super(message, cause)
    }
    class ExponeaFetchException : Exception {
        constructor(message: String) : super(message)
    }

    companion object {
        var currentInstance: ExponeaModule? = null
        // We have to hold OpenedPush until ExponeaModule is initialized AND pushOpenedListener set in JS
        private var pendingOpenedPush: OpenedPush? = null

        fun openPush(push: OpenedPush) {
            if (currentInstance != null) {
                currentInstance?.openPush(push)
            } else {
                pendingOpenedPush = push
            }
        }
    }

    init {
        currentInstance = this
    }

    private var configuration: ExponeaConfiguration = ExponeaConfiguration()
    private var pushOpenedListenerSet = false
    private var pushReceivedListenerSet = false
    // We have to hold received push data until pushReceivedListener set in JS
    private var pendingReceivedPushData: Map<String, String>? = null

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
            val configuration = ConfigurationParser(configMap).parse()
            Exponea.init(reactContext.currentActivity ?: reactContext, configuration)
            this.configuration = configuration
            Exponea.notificationDataCallback = { pushNotificationReceived(it) }
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
        Exponea.checkPushSetup = true
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

    @ReactMethod
    fun fetchConsents(promise: Promise) = requireInitialized(promise) {
        Exponea.getConsents(
            { response ->
                val result = arrayListOf<Map<String, Any>>()
                response.results.forEach { consent ->
                    val consentMap = hashMapOf<String, Any>()
                    consentMap["id"] = consent.id
                    consentMap["legitimateInterest"] = consent.legitimateInterest

                    val sourcesMap = hashMapOf<String, Any>()
                    sourcesMap["createdFromCRM"] = consent.sources.createdFromCRM
                    sourcesMap["imported"] = consent.sources.imported
                    sourcesMap["privateAPI"] = consent.sources.privateAPI
                    sourcesMap["publicAPI"] = consent.sources.publicAPI
                    sourcesMap["trackedFromScenario"] = consent.sources.trackedFromScenario

                    consentMap["sources"] = sourcesMap
                    consentMap["translations"] = consent.translations

                    result.add(consentMap)
                }
                // React native android bridge doesn't support arrays yet, we have to serialize the response
                promise.resolve(Gson().toJson(result))
            },
            { promise.reject(ExponeaFetchException(it.results.message)) }
        )
    }

    @ReactMethod
    fun fetchRecommendations(optionsReadableMap: ReadableMap, promise: Promise) = requireInitialized(promise) {
        try {
            val optionsMap = optionsReadableMap.toHashMapRecursively()
            val options = CustomerRecommendationOptions(
                optionsMap.getSafely("id", String::class),
                optionsMap.getSafely("fillWithRandom", Boolean::class),
                if (optionsMap.containsKey("size")) optionsMap.getSafely("size", Double::class).toInt() else 10,
                optionsMap["items"] as? Map<String, String>,
                if (optionsMap.containsKey("noTrack")) optionsMap.getSafely("noTrack", Boolean::class) else null,
                optionsMap["catalogAttributesWhitelist"] as? List<String>
            )
            Exponea.fetchRecommendation(
                options,
                { response ->
                    val result = arrayListOf<Map<String, Any>>()
                    response.results.forEach { recommendation ->
                        val recommendationMap = hashMapOf<String, Any>()
                        recommendationMap["engineName"] = recommendation.engineName
                        recommendationMap["itemId"] = recommendation.itemId
                        recommendationMap["recommendationId"] = recommendation.recommendationId
                        recommendationMap["recommendationVariantId"] = recommendation.recommendationVariantId ?: ""
                        recommendationMap["data"] = recommendation.data
                        result.add(recommendationMap)
                    }
                    // React native android bridge doesn't support arrays yet, we have to serialize the response
                    promise.resolve(Gson().toJson(result))
                },
                { promise.reject(ExponeaFetchException(it.results.message)) }
            )
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    @ReactMethod
    fun anonymize(
        projectReadableMap: ReadableMap,
        mappingReadableMap: ReadableMap,
        promise: Promise
    ) = requireInitialized(promise) {
        try {
            var exponeaProject: ExponeaProject? = null
            if (projectReadableMap.hasKey("exponeaProject") && !projectReadableMap.isNull("exponeaProject")) {
                exponeaProject = ConfigurationParser.parseExponeaProject(
                    projectReadableMap.getMap("exponeaProject")!!.toHashMapRecursively(),
                    configuration.baseURL
                )
            }
            var projectMapping: Map<EventType, List<ExponeaProject>>? = null
            if (mappingReadableMap.hasKey("projectMapping") && !mappingReadableMap.isNull("projectMapping")) {
                projectMapping = ConfigurationParser.parseProjectMapping(
                    mappingReadableMap.getMap("projectMapping")!!.toHashMapRecursively(),
                    configuration.baseURL
                )
            }
            if (exponeaProject != null && projectMapping != null) {
                Exponea.anonymize(exponeaProject, projectMapping)
            } else if (exponeaProject != null) {
                Exponea.anonymize(exponeaProject)
            } else if (projectMapping != null) {
                Exponea.anonymize(projectRouteMap = projectMapping)
            } else {
                Exponea.anonymize()
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    @ReactMethod
    fun onPushOpenedListenerSet() {
        pushOpenedListenerSet = true
        openPush(pendingOpenedPush ?: return)
        pendingOpenedPush = null
    }

    @ReactMethod
    fun onPushOpenedListenerRemove() {
        pushOpenedListenerSet = false
    }

    fun openPush(push: OpenedPush) {
        if (pushOpenedListenerSet) {
            reactContext.getJSModule(RCTDeviceEventEmitter::class.java).emit("pushOpened", Gson().toJson(push))
        } else {
            pendingOpenedPush = push
        }
    }

    fun pushNotificationReceived(data: Map<String, String>) {
        if (pushReceivedListenerSet) {
            reactContext.getJSModule(RCTDeviceEventEmitter::class.java).emit("pushReceived", Gson().toJson(data))
        } else {
            pendingReceivedPushData = data
        }
    }

    @ReactMethod
    fun onPushReceivedListenerSet() {
        pushReceivedListenerSet = true
        pushNotificationReceived(pendingReceivedPushData ?: return)
        pendingReceivedPushData = null
    }

    @ReactMethod
    fun onPushReceivedListenerRemove() {
        pushReceivedListenerSet = false
    }
}
