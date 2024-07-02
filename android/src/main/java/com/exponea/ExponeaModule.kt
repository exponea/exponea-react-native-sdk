package com.exponea

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import com.exponea.sdk.Exponea
import com.exponea.sdk.models.CustomerIds
import com.exponea.sdk.models.CustomerRecommendationOptions
import com.exponea.sdk.models.EventType
import com.exponea.sdk.models.ExponeaConfiguration
import com.exponea.sdk.models.ExponeaProject
import com.exponea.sdk.models.FlushMode
import com.exponea.sdk.models.FlushPeriod
import com.exponea.sdk.models.PropertiesList
import com.exponea.sdk.models.Segment
import com.exponea.sdk.style.appinbox.StyledAppInboxProvider
import com.exponea.sdk.util.Logger
import com.exponea.style.AppInboxStyleParser
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.gson.Gson
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.TimeUnit

class ExponeaModule(val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    class ExponeaNotInitializedException :
        Exception("Exponea SDK is not configured. Call Exponea.configure() before calling functions of the SDK")
    class ExponeaDataException : Exception {
        constructor(message: String) : super(message)
        constructor(message: String, cause: Throwable) : super(message, cause)
    }
    class ExponeaFetchException(message: String) : Exception(message)
    class ExponeaInvalidUsageException : Exception {
        constructor(message: String) : super(message)
        constructor(message: String, cause: Throwable) : super(message, cause)
    }

    companion object {
        var currentInstance: ExponeaModule? = null
        // We have to hold OpenedPush until ExponeaModule is initialized AND pushOpenedListener set in JS
        private var pendingOpenedPush: OpenedPush? = null
        // We have to hold received action data until inAppActionCallbackSet set in JS
        private var pendingInAppAction: InAppMessageAction? = null

        fun openPush(push: OpenedPush) {
            if (currentInstance != null) {
                currentInstance?.openPush(push)
            } else {
                pendingOpenedPush = push
            }
        }

        fun handleCampaignIntent(intent: Intent?, context: Context) {
            Exponea.handleCampaignIntent(intent, context)
        }

        fun handleRemoteMessage(
            applicationContext: Context,
            messageData: Map<String, String>?,
            manager: NotificationManager
        ) {
            Exponea.handleRemoteMessage(applicationContext, messageData, manager)
        }

        fun handleNewToken(context: Context, token: String) {
            Exponea.handleNewToken(context, token)
        }
        fun handleNewHmsToken(context: Context, token: String) {
            Exponea.handleNewHmsToken(context, token)
        }
        private fun catchAndReject(promise: Promise, block: () -> Unit) {
            try {
                block()
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
        private fun requireInitialized(promise: Promise, block: ((Promise) -> Unit)) {
            if (!Exponea.isInitialized) {
                promise.reject(ExponeaNotInitializedException())
            } else {
                block.invoke(promise)
            }
        }
    }

    init {
        currentInstance = this
        installInAppCallback()
    }

    private fun installInAppCallback() {
        resetInAppCallbackToDefault()
    }

    private var configuration: ExponeaConfiguration = ExponeaConfiguration()
    private var pushOpenedListenerSet = false
    private var pushReceivedListenerSet = false
    // We have to hold received push data until pushReceivedListener set in JS
    private var pendingReceivedPushData: Map<String, Any>? = null

    internal val segmentationDataCallbacks = CopyOnWriteArrayList<ReactNativeSegmentationDataCallback>()

    override fun getName(): String {
        return "Exponea"
    }

    @ReactMethod
    fun configure(configMap: ReadableMap, promise: Promise) = catchAndReject(promise) {
        val configuration = ConfigurationParser(configMap).parse(reactContext)
        Exponea.init(reactContext.currentActivity ?: reactContext, configuration)
        this.configuration = configuration
        Exponea.notificationDataCallback = { pushNotificationReceived(it) }
        promise.resolve(null)
    }

    @ReactMethod
    fun isConfigured(promise: Promise) = catchAndReject(promise) {
        promise.resolve(Exponea.isInitialized)
    }

    @ReactMethod
    fun getCustomerCookie(promise: Promise) = requireInitialized(promise) {
        catchAndReject(promise) {
            promise.resolve(Exponea.customerCookie)
        }
    }

    @ReactMethod
    fun checkPushSetup(promise: Promise) = catchAndReject(promise) {
        Exponea.checkPushSetup = true
        promise.resolve(null)
    }

    @ReactMethod
    fun getFlushMode(promise: Promise) = catchAndReject(promise) {
        promise.resolve(Exponea.flushMode.name)
    }

    @ReactMethod
    fun setFlushMode(flushMode: String, promise: Promise) = catchAndReject(promise) {
        Exponea.flushMode = FlushMode.valueOf(flushMode)
        promise.resolve(null)
    }

    @ReactMethod
    fun getFlushPeriod(promise: Promise) = catchAndReject(promise) {
        promise.resolve(Exponea.flushPeriod.amount.toDouble())
    }

    @ReactMethod
    fun setFlushPeriod(period: Double, promise: Promise) = catchAndReject(promise) {
        Exponea.flushPeriod = FlushPeriod(period.toLong(), TimeUnit.SECONDS)
        promise.resolve(null)
    }

    @ReactMethod
    fun getLogLevel(promise: Promise) = catchAndReject(promise) {
        promise.resolve(Exponea.loggerLevel.name)
    }

    @ReactMethod
    fun setLogLevel(level: String, promise: Promise) = catchAndReject(promise) {
        Exponea.loggerLevel = Logger.Level.valueOf(level)
        promise.resolve(null)
    }

    @ReactMethod
    fun getDefaultProperties(promise: Promise) = catchAndReject(promise) {
        promise.resolve(Gson().toJson(Exponea.defaultProperties))
    }

    @ReactMethod
    fun setDefaultProperties(defaultProperties: ReadableMap, promise: Promise) = catchAndReject(promise) {
        Exponea.defaultProperties = defaultProperties.toHashMap()
        promise.resolve(null)
    }

    @ReactMethod
    fun identifyCustomer(
        customerIdsMap: ReadableMap,
        propertiesMap: ReadableMap,
        promise: Promise
    ) = requireInitialized(promise) {
        catchAndReject(promise) {
            val customerIds = CustomerIds()
            customerIdsMap.toHashMap().forEach {
                if (it.value is String) customerIds.withId(it.key, it.value as String)
            }
            @Suppress("UNCHECKED_CAST")
            val properties = PropertiesList(
                propertiesMap.toHashMapRecursively().filterValues { it != null } as HashMap<String, Any>
            )
            Exponea.identifyCustomer(customerIds, properties)
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun flushData(promise: Promise) = requireInitialized(promise) {
        catchAndReject(promise) {
            Exponea.flushData { promise.resolve(null) }
        }
    }

    @ReactMethod
    fun trackEvent(
        eventName: String,
        params: ReadableMap,
        timestamp: ReadableMap,
        promise: Promise
    ) = requireInitialized(promise) {
        catchAndReject(promise) {
            @Suppress("UNCHECKED_CAST")
            val propertiesList = PropertiesList(
                params.toHashMapRecursively().filterValues { it != null } as HashMap<String, Any>
            )
            var unwrappedTimestamp: Double? = null
            if (timestamp.hasKey("timestamp") && !timestamp.isNull("timestamp")) {
                unwrappedTimestamp = timestamp.getDouble("timestamp")
            }
            Exponea.trackEvent(propertiesList, unwrappedTimestamp, eventName)
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun trackSessionStart(timestamp: ReadableMap, promise: Promise) = requireInitialized(promise) {
        catchAndReject(promise) {
            if (timestamp.hasKey("timestamp") && !timestamp.isNull("timestamp")) {
                Exponea.trackSessionStart(timestamp.getDouble("timestamp"))
            } else {
                Exponea.trackSessionStart()
            }
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun trackSessionEnd(timestamp: ReadableMap, promise: Promise) = requireInitialized(promise) {
        catchAndReject(promise) {
            if (timestamp.hasKey("timestamp") && !timestamp.isNull("timestamp")) {
                Exponea.trackSessionEnd(timestamp.getDouble("timestamp"))
            } else {
                Exponea.trackSessionEnd()
            }
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun fetchConsents(promise: Promise) = requireInitialized(promise) {
        catchAndReject(promise) {
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
    }

    @ReactMethod
    fun fetchRecommendations(optionsReadableMap: ReadableMap, promise: Promise) = requireInitialized(promise) {
        catchAndReject(promise) {
            val optionsMap = optionsReadableMap.toHashMapRecursively()
            @Suppress("UNCHECKED_CAST")
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
        }
    }

    @ReactMethod
    fun anonymize(
        projectReadableMap: ReadableMap,
        mappingReadableMap: ReadableMap,
        promise: Promise
    ) = requireInitialized(promise) {
        catchAndReject(promise) {
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
        }
    }

    @ReactMethod
    fun onPushOpenedListenerSet(promise: Promise) = catchAndReject(promise) {
        pushOpenedListenerSet = true
        openPush(pendingOpenedPush ?: return@catchAndReject)
        pendingOpenedPush = null
        promise.resolve(null)
    }

    @ReactMethod
    fun onPushOpenedListenerRemove(promise: Promise) = catchAndReject(promise) {
        pushOpenedListenerSet = false
        promise.resolve(null)
    }

    fun openPush(push: OpenedPush) {
        if (pushOpenedListenerSet) {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("pushOpened", Gson().toJson(push))
        } else {
            pendingOpenedPush = push
        }
    }

    fun pushNotificationReceived(data: Map<String, Any>) {
        if (pushReceivedListenerSet) {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("pushReceived", Gson().toJson(data))
        } else {
            pendingReceivedPushData = data
        }
    }

    @ReactMethod
    fun onPushReceivedListenerSet(promise: Promise) = catchAndReject(promise) {
        pushReceivedListenerSet = true
        pushNotificationReceived(pendingReceivedPushData ?: return@catchAndReject)
        pendingReceivedPushData = null
        promise.resolve(null)
    }

    @ReactMethod
    fun onPushReceivedListenerRemove(promise: Promise) = catchAndReject(promise) {
        pushReceivedListenerSet = false
        promise.resolve(null)
    }

    @ReactMethod
    fun onInAppMessageCallbackSet(
        overrideDefaultBehavior: Boolean,
        trackActions: Boolean,
        promise: Promise
    ) = catchAndReject(promise) {
        Exponea.inAppMessageActionCallback = ReactNativeInAppActionListener(
            overrideDefaultBehavior, trackActions
        ) { inAppMessageAction ->
            sendInAppAction(inAppMessageAction)
        }
        pendingInAppAction?.let {
            sendInAppAction(it)
            pendingInAppAction = null
        }
        promise.resolve(null)
    }

    @ReactMethod
    fun onInAppMessageCallbackRemove(promise: Promise) = catchAndReject(promise) {
        resetInAppCallbackToDefault()
        promise.resolve(null)
    }

    private fun resetInAppCallbackToDefault() {
        Exponea.inAppMessageActionCallback = ReactNativeInAppActionListener(
            overrideDefaultBehavior = false, trackActions = true
        ) { inAppMessageAction ->
            pendingInAppAction = inAppMessageAction
        }
    }

    // RN 0.65.0 and above require these listener methods on the Native Module when call the NativeEventEmitter.
    // Otherwise it shows warning. Source: https://github.com/software-mansion/react-native-reanimated/issues/2297

    @ReactMethod
    fun addListener(eventName: String?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun fetchAppInbox(promise: Promise) = requireInitialized(promise) {
        catchAndReject(promise) {
            Exponea.fetchAppInbox { response ->
                if (response == null) {
                    promise.reject(ExponeaFetchException("AppInbox load failed. See logs"))
                    @Suppress("LABEL_NAME_CLASH")
                    return@fetchAppInbox
                }
                val result = response.map { it.toMap() }
                // React native android bridge doesn't support arrays yet, we have to serialize the response
                promise.resolve(Gson().toJson(result))
            }
        }
    }

    @ReactMethod
    fun fetchAppInboxItem(messageId: String, promise: Promise) = requireInitialized(promise) {
        catchAndReject(promise) {
            Exponea.fetchAppInboxItem(messageId = messageId) { messageItem ->
                if (messageItem == null) {
                    promise.reject(ExponeaFetchException("AppInbox message not found. See logs"))
                    @Suppress("LABEL_NAME_CLASH")
                    return@fetchAppInboxItem
                }
                // React native android bridge doesn't support arrays yet, we have to serialize the response
                promise.resolve(Gson().toJson(messageItem.toMap()))
            }
        }
    }

    @ReactMethod
    fun markAppInboxAsRead(messageData: ReadableMap, promise: Promise) = requireInitialized(promise) {
        catchAndReject(promise) {
            val message = messageData.toHashMapRecursively().toMessageItem()
            if (message == null) {
                promise.reject(ExponeaDataException("AppInbox message data are invalid. See logs"))
                return@catchAndReject
            }
            Exponea.fetchAppInboxItem(messageId = message.id) { nativeMessage ->
                // we need to fetch native MessageItem; method needs syncToken and customerIds to be fetched
                if (nativeMessage == null) {
                    promise.reject(ExponeaDataException("AppInbox message data are invalid. See logs"))
                    return@fetchAppInboxItem
                }
                Exponea.markAppInboxAsRead(nativeMessage) { markedAsRead ->
                    promise.resolve(markedAsRead)
                }
            }
        }
    }

    @ReactMethod
    fun trackAppInboxClick(
        actionData: ReadableMap,
        messageData: ReadableMap,
        promise: Promise
    ) = requireInitialized(promise) {
        catchAndReject(promise) {
            val action = actionData.toHashMapRecursively().toMessageItemAction()
            if (action == null) {
                promise.reject(ExponeaDataException("AppInbox action data are invalid. See logs"))
                return@catchAndReject
            }
            val message = messageData.toHashMapRecursively().toMessageItem()
            if (message == null) {
                promise.reject(ExponeaDataException("AppInbox message data are invalid. See logs"))
                return@catchAndReject
            }
            Exponea.fetchAppInboxItem(messageId = message.id) { nativeMessage ->
                // we need to fetch native MessageItem; method needs syncToken and customerIds to be fetched
                if (nativeMessage == null) {
                    promise.reject(ExponeaDataException("AppInbox message data are invalid. See logs"))
                    return@fetchAppInboxItem
                }
                Exponea.trackAppInboxClick(action, nativeMessage)
                promise.resolve(null)
            }
        }
    }

    @ReactMethod
    fun trackAppInboxOpened(messageData: ReadableMap, promise: Promise) = requireInitialized(promise) {
        catchAndReject(promise) {
            val message = messageData.toHashMapRecursively().toMessageItem()
            if (message == null) {
                promise.reject(ExponeaDataException("AppInbox message data are invalid. See logs"))
                return@catchAndReject
            }
            Exponea.fetchAppInboxItem(messageId = message.id) { nativeMessage ->
                // we need to fetch native MessageItem; method needs syncToken and customerIds to be fetched
                if (nativeMessage == null) {
                    promise.reject(ExponeaDataException("AppInbox message data are invalid. See logs"))
                    return@fetchAppInboxItem
                }
                Exponea.trackAppInboxOpened(nativeMessage)
                promise.resolve(null)
            }
        }
    }

    @ReactMethod
    fun trackAppInboxClickWithoutTrackingConsent(
        actionData: ReadableMap,
        messageData: ReadableMap,
        promise: Promise
    ) = requireInitialized(promise) {
        catchAndReject(promise) {
            val action = actionData.toHashMapRecursively().toMessageItemAction()
            if (action == null) {
                promise.reject(ExponeaDataException("AppInbox action data are invalid. See logs"))
                return@catchAndReject
            }
            val message = messageData.toHashMapRecursively().toMessageItem()
            if (message == null) {
                promise.reject(ExponeaDataException("AppInbox message data are invalid. See logs"))
                return@catchAndReject
            }
            Exponea.fetchAppInboxItem(messageId = message.id) { nativeMessage ->
                // we need to fetch native MessageItem; method needs syncToken and customerIds to be fetched
                if (nativeMessage == null) {
                    promise.reject(ExponeaDataException("AppInbox message data are invalid. See logs"))
                    return@fetchAppInboxItem
                }
                Exponea.trackAppInboxClickWithoutTrackingConsent(action, nativeMessage)
                promise.resolve(null)
            }
        }
    }

    @ReactMethod
    fun trackAppInboxOpenedWithoutTrackingConsent(
        messageData: ReadableMap,
        promise: Promise
    ) = requireInitialized(promise) {
        catchAndReject(promise) {
            val message = messageData.toHashMapRecursively().toMessageItem()
            if (message == null) {
                promise.reject(ExponeaDataException("AppInbox message data are invalid. See logs"))
                return@catchAndReject
            }
            Exponea.fetchAppInboxItem(messageId = message.id) { nativeMessage ->
                // we need to fetch native MessageItem; method needs syncToken and customerIds to be fetched
                if (nativeMessage == null) {
                    promise.reject(ExponeaDataException("AppInbox message data are invalid. See logs"))
                    return@fetchAppInboxItem
                }
                Exponea.trackAppInboxOpenedWithoutTrackingConsent(nativeMessage)
                promise.resolve(null)
            }
        }
    }

    @ReactMethod
    fun setAppInboxProvider(configMap: ReadableMap, promise: Promise) = catchAndReject(promise) {
        val style = AppInboxStyleParser(configMap.toHashMap()).parse()
        Exponea.appInboxProvider = StyledAppInboxProvider(style)
        promise.resolve(null)
    }

    @ReactMethod
    fun setAutomaticSessionTracking(enabled: Boolean, promise: Promise) = catchAndReject(promise) {
        Exponea.isAutomaticSessionTracking = enabled
        promise.resolve(null)
    }

    @ReactMethod
    fun setSessionTimeout(timeout: Double, promise: Promise) = catchAndReject(promise) {
        Exponea.sessionTimeout = timeout
        promise.resolve(null)
    }

    @ReactMethod
    fun setAutoPushNotification(enabled: Boolean, promise: Promise) = catchAndReject(promise) {
        Exponea.isAutoPushNotification = enabled
        promise.resolve(null)
    }

    @ReactMethod
    fun setCampaignTTL(seconds: Double, promise: Promise) = catchAndReject(promise) {
        Exponea.campaignTTL = seconds
        promise.resolve(null)
    }

    internal fun sendInAppAction(data: InAppMessageAction) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("inAppAction", Gson().toJson(data))
    }

    @ReactMethod
    fun trackPushToken(token: String, promise: Promise) = catchAndReject(promise) {
        Exponea.trackPushToken(token)
        promise.resolve(null)
    }

    @ReactMethod
    fun trackHmsPushToken(token: String, promise: Promise) = catchAndReject(promise) {
        Exponea.trackHmsPushToken(token)
        promise.resolve(null)
    }

    @ReactMethod
    fun trackDeliveredPush(params: ReadableMap, promise: Promise) = catchAndReject(promise) {
        val notification = params.toHashMapRecursively().toNotificationData()
        val receivedSeconds = params
            .toHashMapRecursively().getNullSafely("receivedSeconds") ?: currentTimeSeconds()
        Exponea.trackDeliveredPush(notification, receivedSeconds)
        promise.resolve(null)
    }

    @ReactMethod
    fun trackDeliveredPushWithoutTrackingConsent(params: ReadableMap, promise: Promise) = catchAndReject(promise) {
        val notification = params.toHashMapRecursively().toNotificationData()
        val receivedSeconds = params
            .toHashMapRecursively().getNullSafely("receivedSeconds") ?: currentTimeSeconds()
        Exponea.trackDeliveredPushWithoutTrackingConsent(notification, receivedSeconds)
        promise.resolve(null)
    }

    @ReactMethod
    fun trackClickedPush(params: ReadableMap, promise: Promise) = catchAndReject(promise) {
        val notification = params.toHashMapRecursively().toNotificationData()
        val notificationAction = params.toHashMapRecursively().toNotificationAction()
        val receivedSeconds = params
            .toHashMapRecursively().getNullSafely("receivedSeconds") ?: currentTimeSeconds()
        Exponea.trackClickedPush(notification, notificationAction, receivedSeconds)
        promise.resolve(null)
    }

    @ReactMethod
    fun trackClickedPushWithoutTrackingConsent(params: ReadableMap, promise: Promise) = catchAndReject(promise) {
        val notification = params.toHashMapRecursively().toNotificationData()
        val notificationAction = params.toHashMapRecursively().toNotificationAction()
        val receivedSeconds = params
            .toHashMapRecursively().getNullSafely("receivedSeconds") ?: currentTimeSeconds()
        Exponea.trackClickedPushWithoutTrackingConsent(notification, notificationAction, receivedSeconds)
        promise.resolve(null)
    }

    @ReactMethod
    fun trackPaymentEvent(params: ReadableMap, promise: Promise) = catchAndReject(promise) {
        val receivedSeconds = params
            .toHashMapRecursively().getNullSafely("receivedSeconds") ?: currentTimeSeconds()
        val paymentItem = params
            .toHashMapRecursively().toPurchasedItem()
        Exponea.trackPaymentEvent(receivedSeconds, paymentItem)
        promise.resolve(null)
    }

    @ReactMethod
    fun isExponeaPushNotification(params: ReadableMap, promise: Promise) = catchAndReject(promise) {
        @Suppress("UNCHECKED_CAST")
        val notificationData = params
            .toHashMapRecursively()
            .mapValues { it.value as? String }
            .filterValues { it != null } as Map<String, String>
        promise.resolve(Exponea.isExponeaPushNotification(notificationData))
    }

    @ReactMethod
    fun trackInAppMessageClick(params: ReadableMap, promise: Promise) = catchAndReject(promise) {
        val data = params.toHashMapRecursively().toInAppMessageAction()
        if (data == null) {
            promise.reject(ExponeaDataException("InApp message data are invalid. See logs"))
            return@catchAndReject
        }
        Exponea.trackInAppMessageClick(data.message, data.button?.text, data.button?.url)
        promise.resolve(null)
    }

    @ReactMethod
    fun trackInAppMessageClickWithoutTrackingConsent(params: ReadableMap, promise: Promise) = catchAndReject(promise) {
        val data = params.toHashMapRecursively().toInAppMessageAction()
        if (data == null) {
            promise.reject(ExponeaDataException("InApp message data are invalid. See logs"))
            return@catchAndReject
        }
        Exponea.trackInAppMessageClickWithoutTrackingConsent(data.message, data.button?.text, data.button?.url)
        promise.resolve(null)
    }

    @ReactMethod
    fun trackInAppMessageClose(params: ReadableMap, promise: Promise) = catchAndReject(promise) {
        val data = params.toHashMapRecursively().toInAppMessage()
        if (data == null) {
            promise.reject(ExponeaDataException("InApp message data are invalid. See logs"))
            return@catchAndReject
        }
        Exponea.trackInAppMessageClose(data)
        promise.resolve(null)
    }

    @ReactMethod
    fun trackInAppMessageCloseWithoutTrackingConsent(params: ReadableMap, promise: Promise) = catchAndReject(promise) {
        val data = params.toHashMapRecursively().toInAppMessage()
        if (data == null) {
            promise.reject(ExponeaDataException("InApp message data are invalid. See logs"))
            return@catchAndReject
        }
        Exponea.trackInAppMessageCloseWithoutTrackingConsent(data)
        promise.resolve(null)
    }

    @ReactMethod
    fun requestPushAuthorization(promise: Promise) = catchAndReject(promise) {
        Exponea.requestPushAuthorization(reactContext) { permissionGranted ->
            promise.resolve(permissionGranted)
        }
    }

    @ReactMethod
    fun trackInAppContentBlockClick(params: ReadableMap, promise: Promise) = catchAndReject(promise) {
        val data = params.toHashMapRecursively()
        val placeholderId: String = data.getRequired("placeholderId")
        val inAppContentBlock = (data.getRequired("inAppContentBlock") as Map<String, Any>).toInAppContentBlock()
        val inAppContentBlockAction = (data.getRequired("inAppContentBlockAction") as Map<String, Any>)
            .toInAppContentBlockAction()
        if (inAppContentBlock == null || inAppContentBlockAction == null) {
            promise.reject(ExponeaDataException("InApp content block data are invalid. See logs"))
            return@catchAndReject
        }
        Exponea.trackInAppContentBlockClick(placeholderId, inAppContentBlockAction, inAppContentBlock)
        promise.resolve(null)
    }

    @ReactMethod
    fun trackInAppContentBlockClickWithoutTrackingConsent(
        params: ReadableMap,
        promise: Promise
    ) = catchAndReject(promise) {
        val data = params.toHashMapRecursively()
        val placeholderId: String = data.getRequired("placeholderId")
        val inAppContentBlock = (data.getRequired("inAppContentBlock") as Map<String, Any>).toInAppContentBlock()
        val inAppContentBlockAction = (data.getRequired("inAppContentBlockAction") as Map<String, Any>)
            .toInAppContentBlockAction()
        if (inAppContentBlock == null || inAppContentBlockAction == null) {
            promise.reject(ExponeaDataException("InApp content block data are invalid. See logs"))
            return@catchAndReject
        }
        Exponea.trackInAppContentBlockClickWithoutTrackingConsent(
            placeholderId,
            inAppContentBlockAction,
            inAppContentBlock
        )
        promise.resolve(null)
    }

    @ReactMethod
    fun trackInAppContentBlockClose(params: ReadableMap, promise: Promise) = catchAndReject(promise) {
        val data = params.toHashMapRecursively()
        val placeholderId: String = data.getRequired("placeholderId")
        val inAppContentBlock = (data.getRequired("inAppContentBlock") as Map<String, Any>).toInAppContentBlock()
        if (inAppContentBlock == null) {
            promise.reject(ExponeaDataException("InApp content block data are invalid. See logs"))
            return@catchAndReject
        }
        Exponea.trackInAppContentBlockClose(placeholderId, inAppContentBlock)
        promise.resolve(null)
    }

    @ReactMethod
    fun trackInAppContentBlockCloseWithoutTrackingConsent(
        params: ReadableMap,
        promise: Promise
    ) = catchAndReject(promise) {
        val data = params.toHashMapRecursively()
        val placeholderId: String = data.getRequired("placeholderId")
        val inAppContentBlock = (data.getRequired("inAppContentBlock") as Map<String, Any>).toInAppContentBlock()
        if (inAppContentBlock == null) {
            promise.reject(ExponeaDataException("InApp content block data are invalid. See logs"))
            return@catchAndReject
        }
        Exponea.trackInAppContentBlockCloseWithoutTrackingConsent(placeholderId, inAppContentBlock)
        promise.resolve(null)
    }

    @ReactMethod
    fun trackInAppContentBlockShown(params: ReadableMap, promise: Promise) = catchAndReject(promise) {
        val data = params.toHashMapRecursively()
        val placeholderId: String = data.getRequired("placeholderId")
        val inAppContentBlock = (data.getRequired("inAppContentBlock") as Map<String, Any>).toInAppContentBlock()
        if (inAppContentBlock == null) {
            promise.reject(ExponeaDataException("InApp content block data are invalid. See logs"))
            return@catchAndReject
        }
        Exponea.trackInAppContentBlockShown(placeholderId, inAppContentBlock)
        promise.resolve(null)
    }

    @ReactMethod
    fun trackInAppContentBlockShownWithoutTrackingConsent(
        params: ReadableMap,
        promise: Promise
    ) = catchAndReject(promise) {
        val data = params.toHashMapRecursively()
        val placeholderId: String = data.getRequired("placeholderId")
        val inAppContentBlock = (data.getRequired("inAppContentBlock") as Map<String, Any>).toInAppContentBlock()
        if (inAppContentBlock == null) {
            promise.reject(ExponeaDataException("InApp content block data are invalid. See logs"))
            return@catchAndReject
        }
        Exponea.trackInAppContentBlockShownWithoutTrackingConsent(placeholderId, inAppContentBlock)
        promise.resolve(null)
    }

    @ReactMethod
    fun trackInAppContentBlockError(params: ReadableMap, promise: Promise) = catchAndReject(promise) {
        val data = params.toHashMapRecursively()
        val placeholderId: String = data.getRequired("placeholderId")
        val inAppContentBlock = (data.getRequired("inAppContentBlock") as Map<String, Any>).toInAppContentBlock()
        val errorMessage: String = data.getRequired("errorMessage")
        if (inAppContentBlock == null) {
            promise.reject(ExponeaDataException("InApp content block data are invalid. See logs"))
            return@catchAndReject
        }
        Exponea.trackInAppContentBlockError(placeholderId, inAppContentBlock, errorMessage)
        promise.resolve(null)
    }

    @ReactMethod
    fun trackInAppContentBlockErrorWithoutTrackingConsent(
        params: ReadableMap,
        promise: Promise
    ) = catchAndReject(promise) {
        val data = params.toHashMapRecursively()
        val placeholderId: String = data.getRequired("placeholderId")
        val inAppContentBlock = (data.getRequired("inAppContentBlock") as Map<String, Any>).toInAppContentBlock()
        val errorMessage: String = data.getRequired("errorMessage")
        if (inAppContentBlock == null) {
            promise.reject(ExponeaDataException("InApp content block data are invalid. See logs"))
            return@catchAndReject
        }
        Exponea.trackInAppContentBlockErrorWithoutTrackingConsent(placeholderId, inAppContentBlock, errorMessage)
        promise.resolve(null)
    }

    @ReactMethod
    fun registerSegmentationDataCallback(
        exposingCategory: String,
        includeFirstLoad: Boolean,
        promise: Promise
    ) = catchAndReject(promise) {
        val segmentationDataCallback = ReactNativeSegmentationDataCallback(
            exposingCategory,
            includeFirstLoad
        ) { callbackInstance, segments ->
            sendNewSegmentsData(callbackInstance, segments)
        }
        Exponea.registerSegmentationDataCallback(segmentationDataCallback)
        segmentationDataCallbacks.add(segmentationDataCallback)
        promise.resolve(segmentationDataCallback.instanceId)
    }

    @ReactMethod
    fun unregisterSegmentationDataCallback(
        callbackInstanceId: String,
        promise: Promise
    ) = catchAndReject(promise) {
        val segmentationCallbackToRemove = segmentationDataCallbacks.find { it.instanceId == callbackInstanceId }
        if (segmentationCallbackToRemove == null) {
            promise.reject(ExponeaInvalidUsageException(
                "Segmentation callback $callbackInstanceId has not been found"
            ))
            return@catchAndReject
        }
        Exponea.unregisterSegmentationDataCallback(segmentationCallbackToRemove)
        segmentationDataCallbacks.remove(segmentationCallbackToRemove)
        promise.resolve(null)
    }

    @ReactMethod
    fun getSegments(
        exposingCategory: String,
        promise: Promise
    ) = catchAndReject(promise) {
        Exponea.getSegments(exposingCategory) {
            promise.resolve(Gson().toJson(it))
        }
    }

    private fun sendNewSegmentsData(callbackInstance: ReactNativeSegmentationDataCallback, segments: List<Segment>) {
        val dataMap = mapOf(
            "callbackId" to callbackInstance.instanceId,
            "data" to segments
        )
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(callbackInstance.eventEmitterKey, Gson().toJson(dataMap))
    }
}
