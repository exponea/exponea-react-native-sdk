package com.exponea

import android.app.NotificationManager
import android.content.Context
import android.graphics.Color
import androidx.core.content.res.ResourcesCompat
import com.exponea.sdk.models.EventType
import com.exponea.sdk.models.ExponeaConfiguration
import com.exponea.sdk.models.ProjectConfig
import com.exponea.sdk.models.StreamConfig
import com.facebook.react.bridge.ReadableMap
import java.lang.NumberFormatException

internal class ConfigurationParser(private val readableMap: ReadableMap) {
    private val configuration = ExponeaConfiguration()

    companion object {

        fun parseProjectConfig(map: Map<String, Any?>): ProjectConfig {
            val projectToken = map.getSafely("projectToken", String::class)
            val authorization = "Token ${ map.getSafely("authorizationToken", String::class) }"
            val baseUrl = map["baseUrl"] as? String
            return if (baseUrl != null) {
                ProjectConfig(baseUrl = baseUrl, projectToken = projectToken, authorization = authorization)
            } else {
                ProjectConfig(projectToken = projectToken, authorization = authorization)
            }
        }

        fun parseIntegrationRouteMap(map: Map<String, Any?>): Map<EventType, List<ProjectConfig>> {
            val mapping = mutableMapOf<EventType, List<ProjectConfig>>()
            map.forEach { eventTypeConfiguration ->
                val eventType: EventType
                try {
                    eventType = EventType.valueOf(eventTypeConfiguration.key)
                } catch (e: Exception) {
                    throw ExponeaModule.ExponeaDataException(
                        "Invalid event type '${eventTypeConfiguration.key}' found in project configuration",
                        e
                    )
                }
                try {
                    @Suppress("UNCHECKED_CAST")
                    val projectList = eventTypeConfiguration.value as List<Map<String, Any?>>
                    mapping[eventType] = projectList.map {
                        parseProjectConfig(it)
                    }
                } catch (e: Exception) {
                    throw ExponeaModule.ExponeaDataException(
                        "Invalid project definition for event type '${eventTypeConfiguration.key}'",
                        e
                    )
                }
            }
            return mapping
        }
    }

    /**
     * Parses an [ExponeaConfiguration] from the bridge map.
     *
     * Expects the post-migration shape produced by the JS bridge layer:
     * - `integrationConfig` is required and contains either:
     *   - `streamId` (+ optional `baseUrl`) for [StreamConfig], or
     *   - `projectToken` + `authorizationToken` (+ optional `baseUrl`) for [ProjectConfig]
     * - `integrationRouteMap` (renamed from the deprecated `projectMapping`) maps event types to extra projects
     * - Legacy top-level `projectToken`/`authorizationToken`/`baseUrl`/`projectMapping` are not accepted here.
     */
    fun parse(context: Context? = null): ExponeaConfiguration {
        val map = readableMap.toHashMapRecursively()
        @Suppress("UNCHECKED_CAST")
        val integrationConfigMap = map["integrationConfig"] as? Map<String, Any>
            ?: throw ExponeaModule.ExponeaDataException(
                "Required property 'integrationConfig' missing in configuration object"
            )
        val hasStreamId = integrationConfigMap.containsKey("streamId")
        val hasProjectToken = integrationConfigMap.containsKey("projectToken")
        val baseUrl = integrationConfigMap["baseUrl"] as? String

        configuration.integrationConfig = when {
            hasStreamId -> {
                val streamId = integrationConfigMap.getSafely("streamId", String::class)
                if (baseUrl != null) StreamConfig(baseUrl, streamId) else StreamConfig(streamId = streamId)
            }
            hasProjectToken -> {
                if (!integrationConfigMap.containsKey("authorizationToken")) {
                    throw ExponeaModule.ExponeaDataException(
                        "Required property 'authorizationToken' missing in configuration object"
                    )
                }
                val projectToken = integrationConfigMap.getSafely("projectToken", String::class)
                val authorization = "Token ${integrationConfigMap.getSafely("authorizationToken", String::class)}"
                if (baseUrl != null) {
                    ProjectConfig(baseUrl, projectToken, authorization)
                } else {
                    ProjectConfig(projectToken = projectToken, authorization = authorization)
                }
            }
            else -> throw ExponeaModule.ExponeaDataException(
                "'integrationConfig' requires either 'streamId' for 'StreamConfig', " +
                "or 'projectToken' and 'authorizationToken' for 'ProjectConfig'"
            )
        }
        configuration.requirePushAuthorization = true
        map.forEach { entry ->
            when (entry.key) {
                "integrationRouteMap" -> {
                    @Suppress("UNCHECKED_CAST")
                    val mapping = entry.value as? Map<String, Any?>
                        ?: throw ExponeaModule.ExponeaDataException(
                            "Unable to parse 'integrationRouteMap', expected map of event types to list of project configurations"
                        )
                    configuration.integrationRouteMap = parseIntegrationRouteMap(mapping)
                }
                "defaultProperties" -> {
                    @Suppress("UNCHECKED_CAST")
                    val properties = entry.value as? HashMap<String, Any>
                        ?: throw ExponeaModule.ExponeaDataException(
                            "Unable to parse 'defaultProperties', expected map of properties"
                        )
                    configuration.defaultProperties = properties
                }
                "flushMaxRetries" ->
                    configuration.maxTries = entry.valueAs(Double::class).toInt()
                "sessionTimeout" ->
                    configuration.sessionTimeout = entry.valueAs(Double::class)
                "automaticSessionTracking" ->
                    configuration.automaticSessionTracking = entry.valueAs(Boolean::class)
                "pushTokenTrackingFrequency" -> {
                    try {
                        configuration.tokenTrackFrequency =
                            ExponeaConfiguration.TokenFrequency.valueOf(entry.valueAs(String::class))
                    } catch (e: Exception) {
                        throw ExponeaModule.ExponeaDataException(
                            "Incorrect value '${entry.value}' for key '${entry.key}'.",
                            e
                        )
                    }
                }
                "requirePushAuthorization" ->
                    configuration.requirePushAuthorization =
                        map.getNullSafely("requirePushAuthorization", Boolean::class, true) ?: true
                "allowDefaultCustomerProperties" ->
                    configuration.allowDefaultCustomerProperties = entry.valueAs(Boolean::class)
                "advancedAuthEnabled" ->
                    configuration.advancedAuthEnabled = entry.valueAs(Boolean::class)
                "android" -> {
                    @Suppress("UNCHECKED_CAST")
                    val androidConfig = entry.value as? Map<String, Any?> ?: throw ExponeaModule.ExponeaDataException(
                        "Unable to parse 'android', expected map of properties"
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
                "manualSessionAutoClose" ->
                    configuration.manualSessionAutoClose = entry.valueAs(Boolean::class)
                "applicationId" -> {
                    entry.valueAs(String::class).let {
                        if (it.isNotEmpty()) {
                            configuration.applicationId = it
                        }
                    }
                }
            }
        }
        return configuration
    }

    private fun parseAndroidConfig(map: Map<String, Any?>, context: Context?) {
        map.forEach { entry ->
            when (entry.key) {
                "requirePushAuthorization" ->
                    configuration.requirePushAuthorization =
                        map.getNullSafely("requirePushAuthorization", Boolean::class, true) ?: true
                "automaticPushNotifications" ->
                    configuration.automaticPushNotification = entry.valueAs(Boolean::class)
                "pushIconResourceName" -> {
                    val resourceName = entry.valueAs(String::class)
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
                    configuration.pushIcon = entry.valueAs(Double::class).toInt()
                "pushAccentColor" ->
                    configuration.pushAccentColor = entry.valueAs(Double::class).toInt()
                "pushAccentColorRGBA" -> {
                    try {
                        val channels = parseRGBA(entry.valueAs(String::class))
                        if (channels.size == 4) {
                            configuration.pushAccentColor = Color.argb(
                                channels[3],
                                channels[0],
                                channels[1],
                                channels[2]
                            )
                        } else throw ExponeaModule.ExponeaDataException(
                            "Incorrect value '${entry.value}' for key '${entry.key}'."
                        )
                    } catch (_: NumberFormatException) {
                        throw ExponeaModule.ExponeaDataException(
                            "Incorrect value '${entry.value}' for key '${entry.key}'."
                        )
                    }
                }
                "pushAccentColorName" -> {
                    val colorName = entry.valueAs(String::class)
                    val resources = context?.resources
                    val id: Int? = resources?.getIdentifier(colorName, "color", context.packageName)
                    if (id != null && id > 0) {
                        configuration.pushAccentColor = ResourcesCompat.getColor(resources, id, null)
                    }
                }
                "pushChannelName" ->
                    configuration.pushChannelName = entry.valueAs(String::class)
                "pushChannelDescription" ->
                    configuration.pushChannelDescription = entry.valueAs(String::class)
                "pushChannelId" ->
                    configuration.pushChannelId = entry.valueAs(String::class)
                "pushNotificationImportance" -> {
                    when (entry.valueAs(String::class)) {
                        "MIN" -> configuration.pushNotificationImportance = NotificationManager.IMPORTANCE_MIN
                        "LOW" -> configuration.pushNotificationImportance = NotificationManager.IMPORTANCE_LOW
                        "DEFAULT" -> configuration.pushNotificationImportance = NotificationManager.IMPORTANCE_DEFAULT
                        "HIGH" -> configuration.pushNotificationImportance = NotificationManager.IMPORTANCE_HIGH
                        else -> throw ExponeaModule.ExponeaDataException(
                            "Incorrect value '${entry.value}' for key '${entry.key}'."
                        )
                    }
                }
                "httpLoggingLevel" -> {
                    try {
                        configuration.httpLoggingLevel =
                            ExponeaConfiguration.HttpLoggingLevel.valueOf(entry.valueAs(String::class))
                    } catch (e: Exception) {
                        throw ExponeaModule.ExponeaDataException(
                            "Incorrect value '${entry.value}' for key '${entry.key}'.",
                            e
                        )
                    }
                }
                "allowWebViewCookies" ->
                    configuration.allowWebViewCookies = entry.valueAs(Boolean::class)
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
