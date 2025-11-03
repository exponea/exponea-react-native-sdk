package com.exponea

import android.app.NotificationManager
import android.content.Context
import android.graphics.Color
import androidx.core.content.res.ResourcesCompat
import com.exponea.sdk.models.EventType
import com.exponea.sdk.models.ExponeaConfiguration
import com.exponea.sdk.models.ExponeaProject
import com.facebook.react.bridge.ReadableMap
import java.lang.NumberFormatException

internal class ConfigurationParser(private val readableMap: ReadableMap) {
    private val configuration = ExponeaConfiguration()

    companion object {
        fun requireProjectAndAuthorization(map: Map<String, Any?>) {
            if (!map.containsKey("projectToken")) {
                throw ExponeaModule.ExponeaDataException(
                    "Required property 'projectToken' missing in configuration object"
                )
            }
            if (!map.containsKey("authorizationToken")) {
                throw ExponeaModule.ExponeaDataException(
                    "Required property 'authorizationToken' missing in configuration object"
                )
            }
        }

        fun parseExponeaProject(map: Map<String, Any?>, defaultBaseUrl: String): ExponeaProject {
            return ExponeaProject(
                if (map.containsKey("baseUrl")) map.getSafely("baseUrl", String::class) else defaultBaseUrl,
                map.getSafely("projectToken", String::class),
                "Token ${ map.getSafely("authorizationToken", String::class) }"
            )
        }

        fun parseProjectMapping(map: Map<String, Any?>, defaultBaseUrl: String): Map<EventType, List<ExponeaProject>> {
            val mapping: HashMap<EventType, List<ExponeaProject>> = hashMapOf()
            map.forEach { eventTypeConfiguration ->
                val eventType: EventType
                try {
                    eventType = EventType.valueOf(eventTypeConfiguration.key)
                } catch (e: Exception) {
                    throw ExponeaModule.ExponeaDataException(
                        "Invalid event type ${eventTypeConfiguration.key} found in project configuration",
                        e
                    )
                }
                try {
                    @Suppress("UNCHECKED_CAST")
                    val projectList = eventTypeConfiguration.value as List<Map<String, Any?>>
                    mapping[eventType] = projectList.map {
                        parseExponeaProject(it, defaultBaseUrl)
                    }
                } catch (e: Exception) {
                    throw ExponeaModule.ExponeaDataException(
                        "Invalid project definition for event type ${eventTypeConfiguration.key}",
                        e
                    )
                }
            }
            return mapping
        }
    }

    fun parse(context: Context? = null): ExponeaConfiguration {
        val map = readableMap.toHashMapRecursively()
        requireProjectAndAuthorization(map)
        map.forEach { entry ->
            when (entry.key) {
                "projectToken" ->
                    configuration.projectToken = map.getSafely("projectToken", String::class)
                "authorizationToken" ->
                    configuration.authorization = "Token ${ map.getSafely("authorizationToken", String::class) }"
                "baseUrl" ->
                    configuration.baseURL = map.getSafely("baseUrl", String::class)
                "projectMapping" -> {
                    @Suppress("UNCHECKED_CAST")
                    val mapping = entry.value as? Map<String, Any?>
                        ?: throw ExponeaModule.ExponeaDataException(
                            "Unable to parse project mapping, expected map of event types to list of Exponea projects"
                        )
                    configuration.projectRouteMap = parseProjectMapping(mapping, configuration.baseURL)
                }
                "defaultProperties" -> {
                    @Suppress("UNCHECKED_CAST")
                    val properties = entry.value as? HashMap<String, Any>
                        ?: throw ExponeaModule.ExponeaDataException(
                            "Unable to parse default properties, expected map of properties"
                        )
                    configuration.defaultProperties = properties
                }
                "flushMaxRetries" ->
                    configuration.maxTries = map.getSafely("flushMaxRetries", Double::class).toInt()
                "sessionTimeout" ->
                    configuration.sessionTimeout = map.getSafely("sessionTimeout", Double::class)
                "automaticSessionTracking" ->
                    configuration.automaticSessionTracking = map.getSafely(
                        "automaticSessionTracking",
                        Boolean::class
                    )
                "pushTokenTrackingFrequency" -> {
                    try {
                        val stringValue = map.getSafely("pushTokenTrackingFrequency", String::class)
                        configuration.tokenTrackFrequency = ExponeaConfiguration.TokenFrequency.valueOf(stringValue)
                    } catch (e: Exception) {
                        throw ExponeaModule.ExponeaDataException(
                            "Incorrect value '${entry.value}' for key ${entry.key}.",
                            e
                        )
                    }
                }
                "allowDefaultCustomerProperties" -> {
                    configuration.allowDefaultCustomerProperties = map.getSafely(
                            "allowDefaultCustomerProperties",
                            Boolean::class
                    )
                }
                "advancedAuthEnabled" -> {
                    configuration.advancedAuthEnabled = map.getSafely(
                        "advancedAuthEnabled", Boolean::class
                    )
                }
                "android" -> {
                    @Suppress("UNCHECKED_CAST")
                    val androidConfig = entry.value as? Map<String, Any?> ?: throw ExponeaModule.ExponeaDataException(
                        "Unable to parse android config, expected map of properties"
                    )
                    parseAndroidConfig(androidConfig, context)
                }
                "inAppContentBlockPlaceholdersAutoLoad" -> {
                    val placeholderIds = map.getNullSafelyArray(
                        "inAppContentBlockPlaceholdersAutoLoad",
                        emptyList<String>()
                    ) ?: emptyList()
                    configuration.inAppContentBlockPlaceholdersAutoLoad = placeholderIds
                }
                "manualSessionAutoClose" -> {
                    configuration.manualSessionAutoClose = map.getSafely(
                        "manualSessionAutoClose", Boolean::class
                    )
                }
                "applicationId" -> {
                    configuration.applicationId = map.getSafely("applicationId", String::class)
                }
            }
        }
        return configuration
    }

    private fun parseAndroidConfig(map: Map<String, Any?>, context: Context?) {
        map.forEach { entry ->
            when (entry.key) {
                "automaticPushNotifications" ->
                    configuration.automaticPushNotification =
                        map.getSafely("automaticPushNotifications", Boolean::class)
                "pushIconResourceName" -> {
                    val resourceName = map.getSafely("pushIconResourceName", String::class)
                    var id: Int? = context?.resources?.getIdentifier(
                        resourceName,
                        "drawable",
                        context.packageName
                    )
                    if (id == null || id == 0) {
                        // try to find resource in mipmap if not present in drawable folder
                        id = context?.resources?.getIdentifier(resourceName, "mipmap", context.packageName)
                    }
                    if (id != null && id > 0) {
                        configuration.pushIcon = id
                    }
                }
                "pushIcon" ->
                    configuration.pushIcon = map.getSafely("pushIcon", Double::class).toInt()
                "pushAccentColor" ->
                    configuration.pushAccentColor = map.getSafely("pushAccentColor", Double::class).toInt()
                "pushAccentColorRGBA" -> {
                    try {
                        val channels = parseRGBA(map.getSafely("pushAccentColorRGBA", String::class))
                        if (channels.size == 4) {
                            configuration.pushAccentColor = Color.argb(
                                channels[3],
                                channels[0],
                                channels[1],
                                channels[2]
                            )
                        } else throw ExponeaModule.ExponeaDataException(
                            "Incorrect value '${entry.value}' for key ${entry.key}."
                        )
                    } catch (ex: NumberFormatException) {
                        throw ExponeaModule.ExponeaDataException(
                            "Incorrect value '${entry.value}' for key ${entry.key}."
                        )
                    }
                }
                "pushAccentColorName" -> {
                    val colorName = map.getSafely("pushAccentColorName", String::class)
                    val resources = context?.resources
                    val id: Int? = resources?.getIdentifier(colorName, "color", context.packageName)
                    if (id != null && id > 0) {
                        configuration.pushAccentColor = ResourcesCompat.getColor(resources, id, null)
                    }
                }
                "pushChannelName" ->
                    configuration.pushChannelName = map.getSafely("pushChannelName", String::class)
                "pushChannelDescription" ->
                    configuration.pushChannelDescription = map.getSafely("pushChannelDescription", String::class)
                "pushChannelId" ->
                    configuration.pushChannelId = map.getSafely("pushChannelId", String::class)
                "pushNotificationImportance" -> {
                    when (map.getSafely("pushNotificationImportance", String::class)) {
                        "MIN" -> configuration.pushNotificationImportance = NotificationManager.IMPORTANCE_MIN
                        "LOW" -> configuration.pushNotificationImportance = NotificationManager.IMPORTANCE_LOW
                        "DEFAULT" -> configuration.pushNotificationImportance = NotificationManager.IMPORTANCE_DEFAULT
                        "HIGH" -> configuration.pushNotificationImportance = NotificationManager.IMPORTANCE_HIGH
                        else -> throw ExponeaModule.ExponeaDataException(
                            "Incorrect value '${entry.value}' for key ${entry.key}."
                        )
                    }
                }
                "httpLoggingLevel" -> {
                    try {
                        val stringValue = map.getSafely("httpLoggingLevel", String::class)
                        configuration.httpLoggingLevel = ExponeaConfiguration.HttpLoggingLevel.valueOf(stringValue)
                    } catch (e: Exception) {
                        throw ExponeaModule.ExponeaDataException(
                            "Incorrect value '${entry.value}' for key ${entry.key}.",
                            e
                        )
                    }
                }
            }
        }
    }

    private fun parseRGBA(rgba: String): List<Int> {
        return rgba.split(",")
            .map {
                val channel = it.trim()
                channel.toInt()
            }
    }
}
