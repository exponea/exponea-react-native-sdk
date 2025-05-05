package com.exponea

import com.exponea.sdk.models.CampaignData
import com.exponea.sdk.models.DateFilter
import com.exponea.sdk.models.InAppContentBlock
import com.exponea.sdk.models.InAppContentBlockAction
import com.exponea.sdk.models.InAppMessage
import com.exponea.sdk.models.InAppMessageButton
import com.exponea.sdk.models.MessageItem
import com.exponea.sdk.models.MessageItemAction
import com.exponea.sdk.models.MessageItemAction.Type
import com.exponea.sdk.models.NotificationAction
import com.exponea.sdk.models.NotificationData
import com.exponea.sdk.models.PurchasedItem
import com.exponea.sdk.util.ExponeaGson
import com.exponea.sdk.util.GdprTracking
import com.exponea.sdk.util.Logger

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
    val type = InAppMessageActionType.valueOf(source.getRequired("type"))
    return InAppMessageAction(
        message = message,
        button = source.getNullSafelyMap<Any>("button")?.toInAppMessageButton(),
        interaction = source.getNullSafely("interaction", Boolean::class),
        errorMessage = source.getNullSafely("errorMessage", String::class),
        type = type
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
    try {
        return ExponeaGson.instance.fromJson(ExponeaGson.instance.toJson(this), InAppMessage::class.java)
    } catch (e: Exception) {
        Logger.e(this, "Unable to parse InAppMessage", e)
        return null
    }
}

internal fun Map<String, Any?>.toInAppContentBlock(): InAppContentBlock? {
    val source = this
    val dateFilter = source.getNullSafelyMap<Any>("date_filter")?.toDateFilter() ?: return null
    return InAppContentBlock(
        id = source.getRequired("id"),
        name = source.getRequired("name"),
        dateFilter = dateFilter,
        rawFrequency = source.getNullSafely("frequency"),
        priority = source.getNullSafely("load_priority"),
        consentCategoryTracking = source.getNullSafely("consentCategoryTracking"),
        rawContentType = source.getNullSafely("rawContentType"),
        content = source.getNullSafelyMap("content"),
        placeholders = source.getRequired("placeholders")
    )
}

internal fun Map<String, Any?>.toInAppContentBlockAction(): InAppContentBlockAction {
    val source = this
    return InAppContentBlockAction(
        type = source.getRequired("type"),
        name = source.getNullSafely("name"),
        url = source.getNullSafely("url")
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

internal fun Map<String, String>.toNotificationData(): NotificationData {
    val source = this
    val attributes: HashMap<String, Any> = ExponeaGson.instance.fromJson(source["data"] ?: source["attributes"] ?: "{}")
    val campaignMap: Map<String, String> = ExponeaGson.instance.fromJson(source["url_params"] ?: "{}")
    val consentCategoryTracking: String? = source["consent_category_tracking"]
    val hasTrackingConsent: Boolean = GdprTracking.hasTrackingConsent(source["has_tracking_consent"])
    val campaignData = campaignMap.toCampaignData()
    return NotificationData(
        attributes,
        campaignData,
        consentCategoryTracking,
        hasTrackingConsent
    )
}

internal fun Map<String, String>.toCampaignData(): CampaignData {
    val source = this
    return CampaignData(
        source = source["utm_source"],
        campaign = source["utm_campaign"],
        content = source["utm_content"],
        medium = source["utm_medium"],
        term = source["utm_term"],
        payload = source["xnpe_cmp"],
        createdAt = currentTimeSeconds(),
        completeUrl = null
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
