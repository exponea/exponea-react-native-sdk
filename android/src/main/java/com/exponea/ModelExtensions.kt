package com.exponea

import com.exponea.ExponeaModule.ExponeaDataException
import com.exponea.sdk.models.CampaignData
import com.exponea.sdk.models.CustomerRecommendation
import com.exponea.sdk.models.CustomerRecommendationDeserializer
import com.exponea.sdk.models.DateFilter
import com.exponea.sdk.models.InAppMessage
import com.exponea.sdk.models.InAppMessageButton
import com.exponea.sdk.models.InAppMessagePayload
import com.exponea.sdk.models.InAppMessagePayloadButton
import com.exponea.sdk.models.MessageItem
import com.exponea.sdk.models.MessageItemAction
import com.exponea.sdk.models.MessageItemAction.Type
import com.exponea.sdk.models.NotificationAction
import com.exponea.sdk.models.NotificationData
import com.exponea.sdk.models.PurchasedItem
import com.exponea.sdk.models.eventfilter.EventFilter
import com.exponea.sdk.models.eventfilter.EventFilterAttribute
import com.exponea.sdk.models.eventfilter.EventFilterConstraint
import com.exponea.sdk.models.eventfilter.EventFilterOperator
import com.exponea.sdk.models.eventfilter.EventFilterOperatorDeserializer
import com.exponea.sdk.models.eventfilter.EventFilterOperatorSerializer
import com.exponea.sdk.models.eventfilter.EventPropertyFilter
import com.exponea.sdk.models.eventfilter.PropertyAttribute
import com.exponea.sdk.models.eventfilter.TimestampAttribute
import com.google.gson.GsonBuilder
import com.google.gson.JsonPrimitive
import com.google.gson.JsonSerializer
import com.google.gson.reflect.TypeToken

internal fun Map<String, Any?>.toMessageItem(): MessageItem? {
    val id = this.getNullSafely("id", String::class)
    val rawType = this.getNullSafely("type", String::class)
    if (id.isNullOrEmpty() || rawType.isNullOrEmpty()) {
        return null
    }
    val read = this.getNullSafely("is_read", Boolean::class)
    val receivedTime = this.getNullSafely("create_time", Double::class)
    val rawContent = this.getNullSafely<HashMap<String, Any>>("content")
    return MessageItem(
        id = id,
        rawType = rawType,
        read = read,
        receivedTime = receivedTime,
        rawContent = rawContent
    )
}

internal fun Map<String, Any?>.toMessageItemAction(): MessageItemAction? {
    val source = this
    val sourceType = Type.find(source.getNullSafely("type")) ?: return null
    return MessageItemAction().apply {
        type = sourceType
        title = source.getNullSafely("title")
        url = source.getNullSafely("url")
    }
}

internal fun Map<String, Any?>.toInAppMessageAction(): InAppMessageAction? {
    val source = this
    val message = source.getNullSafelyMap<Any>("message")
        ?.toInAppMessage()
        ?: return null
    return InAppMessageAction(
        message = message,
        button = source.getNullSafelyMap<Any>("button")?.toInAppMessageButton(),
        interaction = source.getRequired("interaction")
    )
}

internal fun Map<String, Any?>.toInAppMessageButton(): InAppMessageButton {
    val source = this
    return InAppMessageButton(
        text = source.getNullSafely("text"),
        url = source.getNullSafely("url")
    )
}

internal fun Map<String, Any?>.toInAppMessage(): InAppMessage? {
    val source = this
    val dateFilter = source.getNullSafelyMap<Any>("date_filter")?.toDateFilter() ?: return null
    return InAppMessage(
        id = source.getRequired("id"),
        name = source.getRequired("name"),
        rawMessageType = source.getNullSafely("message_type"),
        rawFrequency = source.getRequired("frequency"),
        payload = source.getNullSafelyMap<Any>("payload")?.toInAppMessagePayload(),
        variantId = source.getRequired("variant_id"),
        variantName = source.getRequired("variant_name"),
        trigger = source.getNullSafelyMap<Any>("trigger")?.toEventFilter(),
        dateFilter = dateFilter,
        priority = source.getNullSafely("load_priority"),
        delay = source.getNullSafely("load_delay"),
        timeout = source.getNullSafely("close_timeout"),
        payloadHtml = source.getNullSafely("payload_html"),
        isHtml = source.getNullSafely("is_html"),
        rawHasTrackingConsent = source.getNullSafely("has_tracking_consent"),
        consentCategoryTracking = source.getNullSafely("consent_category_tracking")
    )
}

internal fun Map<String, Any?>.toDateFilter(): DateFilter {
    val source = this
    return DateFilter(
        enabled = source.getRequired("enabled"),
        fromDate = source.getNullSafely("from_date"),
        toDate = source.getNullSafely("to_date")
    )
}

internal fun Map<String, Any?>.toEventFilter(): EventFilter {
    val source = this
    EventFilter
    return EventFilter(
        eventType = source.getRequired("event_type"),
        filter = source
            .getNullSafelyArray<Map<String, Any?>>("filter")
            ?.mapNotNull { it.toEventPropertyFilter() }
            ?: emptyList()
    )
}

internal fun Map<String, Any?>.toEventPropertyFilter(): EventPropertyFilter? {
    val source = this
    val attribute = source.getNullSafelyMap<Any>("attribute")?.toEventFilterAttribute() ?: return null
    val constraint = source.getNullSafelyMap<Any>("constraint")?.toEventFilterConstraint() ?: return null
    return EventPropertyFilter(
        attribute = attribute,
        constraint = constraint
    )
}

internal fun Map<String, Any?>.toEventFilterAttribute(): EventFilterAttribute {
    val source = this
    val type: String = source.getRequired("type")
    return when (type) {
        "timestamp" -> TimestampAttribute()
        "property" -> PropertyAttribute(property = source.getRequired("property"))
        else -> {
            throw ExponeaDataException(
                "Required property 'type' not supported"
            )
        }
    }
}

internal fun Map<String, Any?>.toEventFilterConstraint(): EventFilterConstraint {
    return GSON.fromJson(GSON.toJson(this), EventFilterConstraint::class.java)
}

internal fun Map<String, Any?>.toInAppMessagePayload(): InAppMessagePayload {
    val source = this
    return InAppMessagePayload(
        imageUrl = source.getNullSafely("image_url"),
        title = source.getNullSafely("title"),
        titleTextColor = source.getNullSafely("title_text_color"),
        titleTextSize = source.getNullSafely("title_text_size"),
        bodyText = source.getNullSafely("body_text"),
        bodyTextColor = source.getNullSafely("body_text_color"),
        bodyTextSize = source.getNullSafely("body_text_size"),
        buttons = source
            .getNullSafelyArray<Map<String, Any?>>("buttons")?.map { it.toInAppMessagePayloadButton() },
        backgroundColor = source.getNullSafely("background_color"),
        closeButtonColor = source.getNullSafely("close_button_color"),
        rawTextPosition = source.getNullSafely("text_position"),
        isTextOverImage = source.getNullSafely("text_over_image"),
        rawMessagePosition = source.getNullSafely("message_position")
    )
}

internal fun Map<String, Any?>.toInAppMessagePayloadButton(): InAppMessagePayloadButton {
    val source = this
    return InAppMessagePayloadButton(
        rawButtonType = source.getNullSafely("button_type"),
        buttonText = source.getNullSafely("button_text"),
        buttonLink = source.getNullSafely("button_link"),
        buttonBackgroundColor = source.getNullSafely("button_background_color"),
        buttonTextColor = source.getNullSafely("button_text_color")
    )
}

internal fun Map<String, Any?>.toNotificationData(): NotificationData? {
    val source = this
    val attributes = source
        .getNullSafelyMap<Any>("attributes") as? HashMap<String, Any>
        ?: return null
    val campaignData = source.getNullSafelyMap<Any>("campaignData")?.toCampaignData()
        ?: return null
    return NotificationData(
        attributes = attributes,
        campaignData = campaignData,
        consentCategoryTracking = source.getNullSafely("consentCategoryTracking"),
        hasTrackingConsent = source.getRequired("hasTrackingConsent")
    )
}

internal fun Map<String, Any?>.toCampaignData(): CampaignData {
    val source = this
    return CampaignData(
        source = source.getNullSafely("source"),
        campaign = source.getNullSafely("campaign"),
        content = source.getNullSafely("content"),
        medium = source.getNullSafely("medium"),
        term = source.getNullSafely("term"),
        payload = source.getNullSafely("payload"),
        createdAt = source.getNullSafely("createdAt") ?: currentTimeSeconds(),
        completeUrl = source.getNullSafely("completeUrl")
    )
}

internal fun Map<String, Any?>.toNotificationAction(): NotificationAction? {
    val source = this
    val actionType: String = source.getNullSafely("actionType") ?: return null
    return NotificationAction(
        actionType = actionType,
        actionName = source.getNullSafely("actionName"),
        url = source.getNullSafely("url")
    )
}

internal fun Map<String, Any?>.toPurchasedItem(): PurchasedItem {
    val source = this
    return PurchasedItem(
        value = source.getRequired("brutto"),
        currency = source.getRequired("currency"),
        paymentSystem = source.getRequired("payment_system"),
        productId = source.getRequired("item_id"),
        productTitle = source.getRequired("product_title"),
        receipt = source.getNullSafely("receipt")
    )
}

internal val GSON = GsonBuilder()
    // NaN and Infinity are serialized as strings.
    // Gson cannot serialize them, it can be setup to do it,
    // but then Exponea servers fail to process the JSON afterwards.
    // This way devs know there is something going on and find the issue
    .registerTypeAdapter(object : TypeToken<Double>() {}.type, JsonSerializer<Double> { src, _, _ ->
        if (src.isInfinite() || src.isNaN()) {
            JsonPrimitive(src.toString())
        } else {
            JsonPrimitive(src)
        }
    })
    .registerTypeAdapter(object : TypeToken<Float>() {}.type, JsonSerializer<Float> { src, _, _ ->
        if (src.isInfinite() || src.isNaN()) {
            JsonPrimitive(src.toString())
        } else {
            JsonPrimitive(src)
        }
    })
    // customer recommendation
    .registerTypeAdapter(CustomerRecommendation::class.java, CustomerRecommendationDeserializer())
    // event filter
    .registerTypeHierarchyAdapter(EventFilterOperator::class.java, EventFilterOperatorSerializer())
    .registerTypeHierarchyAdapter(EventFilterOperator::class.java, EventFilterOperatorDeserializer())
    .registerTypeAdapterFactory(EventFilterAttribute.typeAdapterFactory)
    .registerTypeAdapterFactory(EventFilterConstraint.typeAdapterFactory)
    .create()
