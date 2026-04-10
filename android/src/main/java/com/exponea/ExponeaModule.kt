package com.exponea

import android.app.NotificationManager
import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.exponea.sdk.Exponea
import com.exponea.ConfigurationParser
import com.exponea.sdk.models.CustomerIds
import com.exponea.sdk.style.appinbox.StyledAppInboxProvider
import com.exponea.style.AppInboxStyleParser
import com.exponea.sdk.models.CustomerRecommendationOptions
import com.exponea.sdk.models.EventType
import com.exponea.sdk.models.ExponeaProject
import com.exponea.sdk.models.FlushMode
import com.exponea.sdk.models.FlushPeriod
import com.exponea.sdk.models.PropertiesList
import com.exponea.sdk.models.PurchasedItem
import com.exponea.sdk.util.ExponeaGson
import com.exponea.sdk.util.Logger
import java.util.concurrent.TimeUnit

@ReactModule(name = ExponeaModule.NAME)
class ExponeaModule(private val reactContext: ReactApplicationContext) :
  NativeExponeaSpec(reactContext) {

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

  // Storage for segmentation data callbacks
  internal val segmentationDataCallbacks = java.util.concurrent.CopyOnWriteArrayList<ReactNativeSegmentationDataCallback>()
  private val segmentationCallbacksByCategory =
      java.util.concurrent.ConcurrentHashMap<String, ReactNativeSegmentationDataCallback>()

  private var pushReceivedListenerSet = false
  // Hold received push data until pushReceivedListener is set in JS
  private var pendingReceivedPushData: Map<String, Any>? = null

  override fun getName(): String {
    return NAME
  }

  override fun isConfigured(): Boolean {
      return Exponea.isInitialized
  }

  override fun configure(configMap: ReadableMap, promise: Promise) {
    try {
      val configuration = ConfigurationParser(configMap).parse(reactContext)
      Exponea.init(reactContext.currentActivity ?: reactContext, configuration)
      Exponea.notificationDataCallback = { pushNotificationReceived(it) }

      // Verify configuration succeeded
      if (Exponea.isInitialized) {
        promise.resolve(null)
      } else {
        promise.reject(
          "CONFIGURE_FAILED",
          "Exponea SDK failed to initialize. Check native logs for details."
        )
      }
    } catch (e: Exception) {
      promise.reject("CONFIGURE_ERROR", e.message ?: "Unknown configuration error", e)
    }
  }

  // Helper functions
  private inline fun requireInitialized(promise: Promise, crossinline block: () -> Unit) {
      if (!Exponea.isInitialized) {
          promise.reject(ExponeaNotInitializedException())
          return
      }
      block()
  }

  private inline fun catchAndReject(promise: Promise, crossinline block: () -> Unit) {
      try {
          block()
      } catch (e: Exception) {
          promise.reject(e)
      }
  }

  // ==================== Phase 1: Simple Methods (IMPLEMENTED) ====================
  override fun trackPushToken(token: String, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          Exponea.trackPushToken(token)
          promise.resolve(null)
      }
  }

  override fun trackHmsPushToken(token: String, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          Exponea.trackHmsPushToken(token)
          promise.resolve(null)
      }
  }

  override fun stopIntegration(promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          // Unregister bridge-side segmentation callbacks before stopping
          for (callback in segmentationDataCallbacks) {
              Exponea.unregisterSegmentationDataCallback(callback)
          }
          segmentationDataCallbacks.clear()
          segmentationCallbacksByCategory.clear()

          Exponea.stopIntegration()
          promise.resolve(null)
      }
  }

  override fun clearLocalCustomerData(appGroup: String?, promise: Promise) {
      catchAndReject(promise) {
          // Special case: clearLocalCustomerData should ONLY work when SDK is NOT initialized
          if (Exponea.isInitialized) {
              promise.reject(
                  ExponeaInvalidUsageException("The functionality is unavailable due to running Integration")
              )
              return@catchAndReject
          }
          // Android doesn't use appGroup parameter (iOS only)
          Exponea.clearLocalCustomerData()
          promise.resolve(null)
      }
  }

  override fun getSegments(exposingCategory: String, force: Boolean?, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          Exponea.getSegments(exposingCategory, force ?: false) { segments ->
              // Segments are List<Map<String, String>>
              val segmentsArray = segments.map { segmentMap ->
                  segmentMap.toWritableMap()
              }.toWritableArray()
              promise.resolve(segmentsArray)
          }
      }
  }

  // ==================== Phase 3: Configuration Methods (IMPLEMENTED - Return Errors) ====================

  override fun setAutomaticSessionTracking(enabled: Boolean, promise: Promise) {
      catchAndReject(promise) {
          Exponea.isAutomaticSessionTracking = enabled
          promise.resolve(null)
      }
  }

  override fun setSessionTimeout(timeout: Double, promise: Promise) {
      catchAndReject(promise) {
          Exponea.sessionTimeout = timeout
          promise.resolve(null)
      }
  }

  override fun setAutoPushNotification(enabled: Boolean, promise: Promise) {
      catchAndReject(promise) {
          Exponea.isAutoPushNotification = enabled
          promise.resolve(null)
      }
  }

  override fun setCampaignTTL(seconds: Double, promise: Promise) {
      catchAndReject(promise) {
          Exponea.campaignTTL = seconds
          promise.resolve(null)
      }
  }

  // ==================== NOT YET IMPLEMENTED (Stubs) ====================

  override fun getCustomerCookie(promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          promise.resolve(Exponea.customerCookie)
      }
  }

  override fun checkPushSetup(promise: Promise) = catchAndReject(promise) {
      Exponea.checkPushSetup = true
      promise.resolve(null)
  }

  override fun getFlushMode(promise: Promise) = catchAndReject(promise) {
      promise.resolve(Exponea.flushMode.name)
  }

  override fun setFlushMode(flushingMode: String, promise: Promise) = catchAndReject(promise) {
      Exponea.flushMode = FlushMode.valueOf(flushingMode)
      promise.resolve(null)
  }

  override fun getFlushPeriod(promise: Promise) = catchAndReject(promise) {
      promise.resolve(Exponea.flushPeriod.amount.toDouble())
  }

  override fun setFlushPeriod(period: Double, promise: Promise) = catchAndReject(promise) {
      Exponea.flushPeriod = FlushPeriod(period.toLong(), TimeUnit.SECONDS)
      promise.resolve(null)
  }

  override fun getLogLevel(promise: Promise) = catchAndReject(promise) {
      val level = if (Exponea.loggerLevel == Logger.Level.DEBUG) "DBG" else Exponea.loggerLevel.name
      promise.resolve(level)
  }

  override fun setLogLevel(loggerLevel: String, promise: Promise) = catchAndReject(promise) {
      val normalised = if (loggerLevel == "DBG") "DEBUG" else loggerLevel
      Exponea.loggerLevel = Logger.Level.valueOf(normalised)
      promise.resolve(null)
  }

  override fun getDefaultProperties(promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          // Return JSON string (empty object "{}" if no properties set)
          val properties = Exponea.defaultProperties ?: hashMapOf()
          promise.resolve(ExponeaGson.instance.toJson(properties))
      }
  }

  override fun setDefaultProperties(properties: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val defProps = HashMap<String, Any>()
          properties.toHashMap().forEach { (key, value) ->
              value?.let { defProps[key] = it }
          }
          Exponea.defaultProperties = defProps
          promise.resolve(null)
      }
  }

  override fun anonymize(exponeaProject: ReadableMap?, projectMapping: ReadableMap?, promise: Promise) {
      catchAndReject(promise) {
          var project: ExponeaProject? = null
          // Only parse if map is not null and not empty
          if (exponeaProject != null && exponeaProject.toHashMapRecursively().isNotEmpty()) {
              project = ConfigurationParser.parseExponeaProject(
                  exponeaProject.toHashMapRecursively(),
                  "https://api.exponea.com" // Default baseURL
              )
          }
          var mapping: Map<EventType, List<ExponeaProject>>? = null
          // Only parse if map is not null and not empty
          if (projectMapping != null && projectMapping.toHashMapRecursively().isNotEmpty()) {
              mapping = ConfigurationParser.parseProjectMapping(
                  projectMapping.toHashMapRecursively(),
                  "https://api.exponea.com" // Default baseURL
              )
          }
          if (project != null && mapping != null) {
              Exponea.anonymize(project, mapping)
          } else if (project != null) {
              Exponea.anonymize(project)
          } else if (mapping != null) {
              Exponea.anonymize(projectRouteMap = mapping)
          } else {
              Exponea.anonymize()
          }
          promise.resolve(null)
      }
  }

  override fun identifyCustomer(customerIds: ReadableMap, properties: ReadableMap, promise: Promise) {
      catchAndReject(promise) {
          val ids = CustomerIds()
          customerIds.toHashMap().forEach {
              if (it.value is String) ids.withId(it.key, it.value as String)
          }
          @Suppress("UNCHECKED_CAST")
          val props = PropertiesList(
              properties.toHashMapRecursively().filterValues { it != null } as HashMap<String, Any>
          )
          // Native SDK queues this call if not initialized
          Exponea.identifyCustomer(ids, props)
          promise.resolve(null)
      }
  }

  override fun flushData(promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          Exponea.flushData { promise.resolve(null) }
      }
  }

  override fun trackEvent(eventName: String, properties: ReadableMap, timestamp: Double?, promise: Promise) {
      catchAndReject(promise) {
          @Suppress("UNCHECKED_CAST")
          val propertiesList = PropertiesList(
              properties.toHashMapRecursively().filterValues { it != null } as HashMap<String, Any>
          )
          // Native SDK queues this call if not initialized
          Exponea.trackEvent(propertiesList, timestamp, eventName)
          promise.resolve(null)
      }
  }

  override fun trackSessionStart(timestamp: Double?, promise: Promise) {
      catchAndReject(promise) {
          // Native SDK queues this call if not initialized
          if (timestamp != null) {
              Exponea.trackSessionStart(timestamp)
          } else {
              Exponea.trackSessionStart()
          }
          promise.resolve(null)
      }
  }

  override fun trackSessionEnd(timestamp: Double?, promise: Promise) {
      catchAndReject(promise) {
          // Native SDK queues this call if not initialized
          if (timestamp != null) {
              Exponea.trackSessionEnd(timestamp)
          } else {
              Exponea.trackSessionEnd()
          }
          promise.resolve(null)
      }
  }

  override fun fetchConsents(promise: Promise) {
      catchAndReject(promise) {
          // Native SDK can fetch consents without initialization
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
                  promise.resolve(result.toWritableArray())
              },
              { promise.reject(ExponeaFetchException(it.results.message)) }
          )
      }
  }

  override fun fetchRecommendations(options: ReadableMap, promise: Promise) {
      catchAndReject(promise) {
          // Native SDK can fetch recommendations without initialization
          val optionsMap = options.toHashMapRecursively()
          @Suppress("UNCHECKED_CAST")
          val recommendationOptions = CustomerRecommendationOptions(
              optionsMap.getSafely("id", String::class),
              optionsMap.getSafely("fillWithRandom", Boolean::class),
              if (optionsMap.containsKey("size")) optionsMap.getSafely("size", Double::class).toInt() else 10,
              optionsMap["items"] as? Map<String, String>,
              if (optionsMap.containsKey("noTrack")) optionsMap.getSafely("noTrack", Boolean::class) else null,
              optionsMap["catalogAttributesWhitelist"] as? List<String>
          )
          Exponea.fetchRecommendation(
              recommendationOptions,
              { response ->
                  val result = arrayListOf<Map<String, Any>>()
                  response.results.forEach { recommendation ->
                      val recommendationMap = hashMapOf<String, Any>()
                      recommendationMap["engineName"] = recommendation.engineName
                      recommendationMap["itemId"] = recommendation.itemId
                      recommendationMap["recommendationId"] = recommendation.recommendationId
                      recommendationMap["recommendationVariantId"] =
                          recommendation.recommendationVariantId ?: ""
                      recommendationMap["data"] = recommendation.data.mapValues { (_, v) ->
                          if (v.isJsonPrimitive) {
                              val p = v.asJsonPrimitive
                              when {
                                  p.isString -> p.asString
                                  p.isNumber -> p.asDouble
                                  p.isBoolean -> p.asBoolean
                                  else -> v.toString()
                              }
                          } else {
                              v.toString()
                          }
                      }
                      result.add(recommendationMap)
                  }
                  promise.resolve(result.toWritableArray())
              },
              { promise.reject(ExponeaFetchException(it.results.message)) }
          )
      }
  }

  override fun requestIosPushAuthorization(promise: Promise) = catchAndReject(promise) {
      promise.reject("NotImplemented", "requestIosPushAuthorization not yet implemented")
  }

  override fun requestPushAuthorization(promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          Exponea.requestPushAuthorization(reactContext) { permissionGranted ->
              promise.resolve(permissionGranted)
          }
      }
  }

  override fun setAppInboxProvider(withStyle: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          // Convert ReadableMap to Map for parser
          val styleMap = withStyle.toHashMapRecursively()

          // Parse style using SDK's parser
          val appInboxStyle = AppInboxStyleParser(styleMap).parse();

          // Create and set styled provider
          Exponea.appInboxProvider = StyledAppInboxProvider(appInboxStyle)

          promise.resolve(null)
      }
  }

  override fun trackAppInboxOpened(message: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val messageData = message.toHashMapRecursively().toMessageItem()
          if (messageData == null) {
              promise.reject("ExponeaDataException", "AppInbox message data are invalid. See logs", null)
              return@catchAndReject
          }
          Exponea.fetchAppInboxItem(messageId = messageData.id) { nativeMessage ->
              if (nativeMessage == null) {
                  promise.reject("ExponeaDataException", "AppInbox message not found. See logs", null)
                  return@fetchAppInboxItem
              }
              Exponea.trackAppInboxOpened(nativeMessage)
              promise.resolve(null)
          }
      }
  }

  override fun trackAppInboxOpenedWithoutTrackingConsent(message: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val messageData = message.toHashMapRecursively().toMessageItem()
          if (messageData == null) {
              promise.reject("ExponeaDataException", "AppInbox message data are invalid. See logs", null)
              return@catchAndReject
          }
          Exponea.fetchAppInboxItem(messageId = messageData.id) { nativeMessage ->
              if (nativeMessage == null) {
                  promise.reject("ExponeaDataException", "AppInbox message not found. See logs", null)
                  return@fetchAppInboxItem
              }
              Exponea.trackAppInboxOpenedWithoutTrackingConsent(nativeMessage)
              promise.resolve(null)
          }
      }
  }

  override fun trackAppInboxClick(action: ReadableMap, message: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val actionData = action.toHashMapRecursively().toMessageItemAction()
          if (actionData == null) {
              promise.reject("ExponeaDataException", "AppInbox action data are invalid. See logs", null)
              return@catchAndReject
          }
          val messageData = message.toHashMapRecursively().toMessageItem()
          if (messageData == null) {
              promise.reject("ExponeaDataException", "AppInbox message data are invalid. See logs", null)
              return@catchAndReject
          }
          Exponea.fetchAppInboxItem(messageId = messageData.id) { nativeMessage ->
              if (nativeMessage == null) {
                  promise.reject("ExponeaDataException", "AppInbox message not found. See logs", null)
                  return@fetchAppInboxItem
              }
              Exponea.trackAppInboxClick(actionData, nativeMessage)
              promise.resolve(null)
          }
      }
  }

  override fun trackAppInboxClickWithoutTrackingConsent(action: ReadableMap, message: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val actionData = action.toHashMapRecursively().toMessageItemAction()
          if (actionData == null) {
              promise.reject("ExponeaDataException", "AppInbox action data are invalid. See logs", null)
              return@catchAndReject
          }
          val messageData = message.toHashMapRecursively().toMessageItem()
          if (messageData == null) {
              promise.reject("ExponeaDataException", "AppInbox message data are invalid. See logs", null)
              return@catchAndReject
          }
          Exponea.fetchAppInboxItem(messageId = messageData.id) { nativeMessage ->
              if (nativeMessage == null) {
                  promise.reject("ExponeaDataException", "AppInbox message not found. See logs", null)
                  return@fetchAppInboxItem
              }
              Exponea.trackAppInboxClickWithoutTrackingConsent(actionData, nativeMessage)
              promise.resolve(null)
          }
      }
  }

  override fun markAppInboxAsRead(message: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val messageItem = message.toMessageItem()
          Exponea.markAppInboxAsRead(messageItem) { success ->
              promise.resolve(success)
          }
      }
  }

  override fun fetchAppInbox(promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          Exponea.fetchAppInbox { messages ->
              if (messages != null) {
                  val messagesArray = messages.map { messageItem ->
                      messageItem.toMap().toWritableMap()
                  }.toWritableArray()
                  promise.resolve(messagesArray)
              } else {
                  promise.reject("AppInboxError", "Failed to fetch App Inbox messages")
              }
          }
      }
  }

  override fun fetchAppInboxItem(messageId: String, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          Exponea.fetchAppInboxItem(messageId) { messageItem ->
              if (messageItem != null) {
                  val messageMap = messageItem.toMap().toWritableMap()
                  promise.resolve(messageMap)
              } else {
                  promise.reject("AppInboxError", "Message with ID $messageId not found")
              }
          }
      }
  }

  override fun trackDeliveredPush(params: ReadableMap, promise: Promise) {
      catchAndReject(promise) {
          val notificationData = params.toNotificationData()
          val receivedSeconds = params.toHashMapRecursively().getNullSafely("receivedSeconds") ?: currentTimeSeconds()
          // Native SDK queues this call if not initialized
          Exponea.trackDeliveredPush(notificationData, receivedSeconds)
          promise.resolve(null)
      }
  }

  override fun trackDeliveredPushWithoutTrackingConsent(params: ReadableMap, promise: Promise) {
      catchAndReject(promise) {
          val notificationData = params.toNotificationData()
          val receivedSeconds = params.toHashMapRecursively().getNullSafely("receivedSeconds") ?: currentTimeSeconds()
          // Native SDK queues this call if not initialized
          Exponea.trackDeliveredPushWithoutTrackingConsent(notificationData, receivedSeconds)
          promise.resolve(null)
      }
  }

  override fun trackClickedPush(params: ReadableMap, promise: Promise) {
      catchAndReject(promise) {
          val notificationData = params.toNotificationData()
          val notificationAction = params.toHashMapRecursively().toNotificationAction()
          val receivedSeconds = params.toHashMapRecursively().getNullSafely("receivedSeconds") ?: currentTimeSeconds()
          // Native SDK queues this call if not initialized
          Exponea.trackClickedPush(notificationData, notificationAction, receivedSeconds)
          promise.resolve(null)
      }
  }

  override fun trackClickedPushWithoutTrackingConsent(params: ReadableMap, promise: Promise) {
      catchAndReject(promise) {
          val notificationData = params.toNotificationData()
          val notificationAction = params.toHashMapRecursively().toNotificationAction()
          val receivedSeconds = params.toHashMapRecursively().getNullSafely("receivedSeconds") ?: currentTimeSeconds()
          // Native SDK queues this call if not initialized
          Exponea.trackClickedPushWithoutTrackingConsent(notificationData, notificationAction, receivedSeconds)
          promise.resolve(null)
      }
  }

  override fun trackPaymentEvent(params: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val paramsMap = params.toHashMapRecursively()
          val receivedSeconds = paramsMap.getNullSafely("receivedSeconds") ?: currentTimeSeconds()
          val paymentItem = paramsMap.toPurchasedItem()
          Exponea.trackPaymentEvent(receivedSeconds, paymentItem)
          promise.resolve(null)
      }
  }

  override fun isExponeaPushNotification(params: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          @Suppress("UNCHECKED_CAST")
          val notificationData = params
              .toHashMapRecursively()
              .mapValues { it.value as? String }
              .filterValues { it != null } as Map<String, String>
          promise.resolve(Exponea.isExponeaPushNotification(notificationData))
      }
  }

  override fun trackInAppMessageClick(message: ReadableMap, buttonText: String?, buttonUrl: String?, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val inAppMessage = message.toInAppMessage()
          if (inAppMessage == null) {
              promise.reject("ExponeaDataException", "InApp message data are invalid. See logs", null)
              return@catchAndReject
          }
          Exponea.trackInAppMessageClick(inAppMessage, buttonText, buttonUrl)
          promise.resolve(null)
      }
  }

  override fun trackInAppMessageClickWithoutTrackingConsent(message: ReadableMap, buttonText: String?, buttonUrl: String?, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val inAppMessage = message.toInAppMessage()
          if (inAppMessage == null) {
              promise.reject("ExponeaDataException", "InApp message data are invalid. See logs", null)
              return@catchAndReject
          }
          Exponea.trackInAppMessageClickWithoutTrackingConsent(inAppMessage, buttonText, buttonUrl)
          promise.resolve(null)
      }
  }

  override fun trackInAppMessageClose(message: ReadableMap, buttonText: String?, interaction: Boolean, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val inAppMessage = message.toInAppMessage()
          if (inAppMessage == null) {
              promise.reject("ExponeaDataException", "InApp message data are invalid. See logs", null)
              return@catchAndReject
          }
          Exponea.trackInAppMessageClose(inAppMessage, buttonText, interaction)
          promise.resolve(null)
      }
  }

  override fun trackInAppMessageCloseWithoutTrackingConsent(message: ReadableMap, buttonText: String?, interaction: Boolean, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val inAppMessage = message.toInAppMessage()
          if (inAppMessage == null) {
              promise.reject("ExponeaDataException", "InApp message data are invalid. See logs", null)
              return@catchAndReject
          }
          Exponea.trackInAppMessageCloseWithoutTrackingConsent(inAppMessage, buttonText, interaction)
          promise.resolve(null)
      }
  }

  override fun trackInAppContentBlockClick(params: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val paramsMap = params.toMapStringString()
          val placeholderId = paramsMap["placeholderId"] ?: throw ExponeaDataException("Missing placeholderId")
          val contentBlock = paramsMap["contentBlock"]?.toInAppContentBlock() ?: throw ExponeaDataException("Missing or invalid contentBlock")
          val action = paramsMap["action"]?.toInAppContentBlockAction() ?: throw ExponeaDataException("Missing or invalid action")
          Exponea.trackInAppContentBlockClick(placeholderId, action, contentBlock)
          promise.resolve(null)
      }
  }

  override fun trackInAppContentBlockClickWithoutTrackingConsent(params: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val paramsMap = params.toMapStringString()
          val placeholderId = paramsMap["placeholderId"] ?: throw ExponeaDataException("Missing placeholderId")
          val contentBlock = paramsMap["contentBlock"]?.toInAppContentBlock() ?: throw ExponeaDataException("Missing or invalid contentBlock")
          val action = paramsMap["action"]?.toInAppContentBlockAction() ?: throw ExponeaDataException("Missing or invalid action")
          Exponea.trackInAppContentBlockClickWithoutTrackingConsent(placeholderId, action, contentBlock)
          promise.resolve(null)
      }
  }

  override fun trackInAppContentBlockClose(params: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val paramsMap = params.toMapStringString()
          val placeholderId = paramsMap["placeholderId"] ?: throw ExponeaDataException("Missing placeholderId")
          val contentBlock = paramsMap["contentBlock"]?.toInAppContentBlock() ?: throw ExponeaDataException("Missing or invalid contentBlock")
          Exponea.trackInAppContentBlockClose(placeholderId, contentBlock)
          promise.resolve(null)
      }
  }

  override fun trackInAppContentBlockCloseWithoutTrackingConsent(params: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val paramsMap = params.toMapStringString()
          val placeholderId = paramsMap["placeholderId"] ?: throw ExponeaDataException("Missing placeholderId")
          val contentBlock = paramsMap["contentBlock"]?.toInAppContentBlock() ?: throw ExponeaDataException("Missing or invalid contentBlock")
          Exponea.trackInAppContentBlockCloseWithoutTrackingConsent(placeholderId, contentBlock)
          promise.resolve(null)
      }
  }

  override fun trackInAppContentBlockShown(params: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val paramsMap = params.toMapStringString()
          val placeholderId = paramsMap["placeholderId"] ?: throw ExponeaDataException("Missing placeholderId")
          val contentBlock = paramsMap["contentBlock"]?.toInAppContentBlock() ?: throw ExponeaDataException("Missing or invalid contentBlock")
          Exponea.trackInAppContentBlockShown(placeholderId, contentBlock)
          promise.resolve(null)
      }
  }

  override fun trackInAppContentBlockShownWithoutTrackingConsent(params: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val paramsMap = params.toMapStringString()
          val placeholderId = paramsMap["placeholderId"] ?: throw ExponeaDataException("Missing placeholderId")
          val contentBlock = paramsMap["contentBlock"]?.toInAppContentBlock() ?: throw ExponeaDataException("Missing or invalid contentBlock")
          Exponea.trackInAppContentBlockShownWithoutTrackingConsent(placeholderId, contentBlock)
          promise.resolve(null)
      }
  }

  override fun trackInAppContentBlockError(params: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val paramsMap = params.toMapStringString()
          val placeholderId = paramsMap["placeholderId"] ?: throw ExponeaDataException("Missing placeholderId")
          val contentBlockJson = paramsMap["contentBlock"]
          val errorMessage = paramsMap["errorMessage"] ?: throw ExponeaDataException("Missing errorMessage")

          // SDK requires non-null contentBlock, so we can only track if we have it
          if (contentBlockJson != null) {
              val contentBlock = contentBlockJson.toInAppContentBlock()
              if (contentBlock != null) {
                  Exponea.trackInAppContentBlockError(placeholderId, contentBlock, errorMessage)
              }
          }
          promise.resolve(null)
      }
  }

  override fun trackInAppContentBlockErrorWithoutTrackingConsent(params: ReadableMap, promise: Promise) = requireInitialized(promise) {
      catchAndReject(promise) {
          val paramsMap = params.toMapStringString()
          val placeholderId = paramsMap["placeholderId"] ?: throw ExponeaDataException("Missing placeholderId")
          val contentBlockJson = paramsMap["contentBlock"]
          val errorMessage = paramsMap["errorMessage"] ?: throw ExponeaDataException("Missing errorMessage")

          // SDK requires non-null contentBlock, so we can only track if we have it
          if (contentBlockJson != null) {
              val contentBlock = contentBlockJson.toInAppContentBlock()
              if (contentBlock != null) {
                  Exponea.trackInAppContentBlockErrorWithoutTrackingConsent(placeholderId, contentBlock, errorMessage)
              }
          }
          promise.resolve(null)
      }
  }

  // ============================================================================
  // Event Listener Management (Not in TurboModule spec - called from JS)
  // ============================================================================

  /**
   * Called from JavaScript when setPushOpenedListener is called.
   * Sets up push receiver to emit events.
   */
  override fun onPushOpenedListenerSet() {
    PushReceiver.setReactContext(reactApplicationContext)
  }

  /**
   * Called from JavaScript when removePushOpenedListener is called.
   * Cleans up push receiver context.
   */
  override fun onPushOpenedListenerRemove() {
    PushReceiver.setReactContext(null)
  }

  fun pushNotificationReceived(data: Map<String, Any>) {
    if (pushReceivedListenerSet) {
      sendEvent("pushReceived", ExponeaGson.instance.toJson(data))
    } else {
      pendingReceivedPushData = data
    }
  }

  override fun onPushReceivedListenerSet() {
    pushReceivedListenerSet = true
    val pending = pendingReceivedPushData ?: return
    pendingReceivedPushData = null
    pushNotificationReceived(pending)
  }

  override fun onPushReceivedListenerRemove() {
    pushReceivedListenerSet = false
  }

  /**
   * Called from JavaScript when setInAppMessageCallback is called.
   * Registers in-app message listener with Exponea SDK.
   * Can be called before SDK initialization - callback will be ready when SDK starts.
   */
  override fun onInAppMessageCallbackSet(overrideDefaultBehavior: Boolean, trackActions: Boolean) {
    Exponea.inAppMessageActionCallback = ReactNativeInAppActionListener(
      overrideDefaultBehavior = overrideDefaultBehavior,
      trackActions = trackActions,
      reactModuleCallback = { action ->
        // Serialize to JSON for React Native event emission
        sendEvent("inAppAction", ExponeaGson.instance.toJson(action.toMap()))
      }
    )
  }

  /**
   * Called from JavaScript when removeInAppMessageCallback is called.
   * Resets to default behavior (don't override, do track actions).
   * Can be called before SDK initialization.
   */
  override fun onInAppMessageCallbackRemove() {
    // Reset to default listener (don't override default behavior, track actions)
    Exponea.inAppMessageActionCallback = ReactNativeInAppActionListener(
      overrideDefaultBehavior = false,
      trackActions = true,
      reactModuleCallback = { action ->
        // Serialize to JSON for React Native event emission
        sendEvent("inAppAction", ExponeaGson.instance.toJson(action.toMap()))
      }
    )
  }

  // ============================================================================
  // Event Emission Helpers
  // ============================================================================

  /**
   * Sends events to JavaScript via NativeEventEmitter.
   */
  private fun sendEvent(eventName: String, params: Any?) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      ?.emit(eventName, params)
  }

  // ============================================================================
  // Segmentation Callback Management (New Architecture)
  // ============================================================================

  override fun onSegmentationCallbackSet(category: String, includeFirstLoad: Boolean) {
      val existing = segmentationCallbacksByCategory.remove(category)
      if (existing != null) {
          Exponea.unregisterSegmentationDataCallback(existing)
          segmentationDataCallbacks.remove(existing)
      }
      val segmentationDataCallback = ReactNativeSegmentationDataCallback(
          category,
          includeFirstLoad
      ) { _, segments ->
          sendNewSegmentsData(category, segments)
      }
      Exponea.registerSegmentationDataCallback(segmentationDataCallback)
      segmentationDataCallbacks.add(segmentationDataCallback)
      segmentationCallbacksByCategory[category] = segmentationDataCallback
  }

  override fun onSegmentationCallbackRemove(category: String) {
      val existing = segmentationCallbacksByCategory.remove(category) ?: return
      Exponea.unregisterSegmentationDataCallback(existing)
      segmentationDataCallbacks.remove(existing)
  }

  // ============================================================================
  // Segmentation Callback Management (Not in TurboModule spec - called from JS)
  // ============================================================================

  /**
   * Registers a segmentation data callback for a specific category.
   * Returns the callback instanceId to JavaScript for later unregistration.
   */
  fun registerSegmentationDataCallback(
      exposingCategory: String,
      includeFirstLoad: Boolean,
      promise: Promise
  ) = catchAndReject(promise) {
      val segmentationDataCallback = ReactNativeSegmentationDataCallback(
          exposingCategory,
          includeFirstLoad
      ) { callbackInstance, segments ->
          sendNewSegmentsDataLegacy(callbackInstance, segments)
      }
      Exponea.registerSegmentationDataCallback(segmentationDataCallback)
      segmentationDataCallbacks.add(segmentationDataCallback)
      promise.resolve(segmentationDataCallback.instanceId)
  }

  /**
   * Unregisters a segmentation data callback by its instanceId.
   */
  fun unregisterSegmentationDataCallback(
      callbackInstanceId: String,
      promise: Promise
  ) = catchAndReject(promise) {
      val segmentationCallbackToRemove = segmentationDataCallbacks.find { it.instanceId == callbackInstanceId }
      if (segmentationCallbackToRemove == null) {
          promise.reject(
              ExponeaInvalidUsageException(
                  "Segmentation callback $callbackInstanceId has not been found"
              )
          )
          return@catchAndReject
      }
      Exponea.unregisterSegmentationDataCallback(segmentationCallbackToRemove)
      segmentationDataCallbacks.remove(segmentationCallbackToRemove)
      promise.resolve(null)
  }

  /**
   * Helper method to emit segmentation data to JavaScript.
   */
  private fun sendNewSegmentsDataLegacy(callbackInstance: ReactNativeSegmentationDataCallback, segments: List<com.exponea.sdk.models.Segment>) {
      val dataMap = mapOf(
          "callbackId" to callbackInstance.instanceId,
          "data" to segments
      )
      reactApplicationContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          ?.emit(callbackInstance.eventEmitterKey, ExponeaGson.instance.toJson(dataMap))
  }

  private fun sendNewSegmentsData(category: String, segments: List<com.exponea.sdk.models.Segment>) {
      val dataMap = mapOf(
          "category" to category,
          "segments" to segments
      )
      sendEvent("newSegments", ExponeaGson.instance.toJson(dataMap))
  }

  companion object {
    const val NAME = "Exponea"

    @JvmStatic
    fun handleNewToken(context: Context, token: String) {
      Exponea.handleNewToken(context, token)
    }

    @JvmStatic
    fun handleNewHmsToken(context: Context, token: String) {
      Exponea.handleNewHmsToken(context, token)
    }

    @JvmStatic
    fun handleRemoteMessage(
      context: Context,
      remoteMessageData: Map<String, String>?,
      manager: NotificationManager,
      showNotification: Boolean = true
    ) {
      Exponea.handleRemoteMessage(context, remoteMessageData, manager, showNotification)
    }
  }
}
