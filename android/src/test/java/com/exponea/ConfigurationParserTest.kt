package com.exponea

import android.app.NotificationManager
import com.exponea.sdk.models.EventType
import com.exponea.sdk.models.ExponeaConfiguration
import com.exponea.sdk.models.ExponeaProject
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.ReadableMap
import java.io.File
import org.junit.Assert.assertEquals
import org.junit.Assert.fail
import org.junit.Test

internal class ConfigurationParserTest {
    @Test
    fun `should parse minimal configuration`() {
        val data = TestJsonParser.parse(File("../src/test_data/configurationMinimal.json").readText())
        assertEquals(
            ExponeaConfiguration(
                projectToken = "mock-project-token",
                authorization = "Token mock-authorization-token"
            ),
            ConfigurationParser(data as ReadableMap).parse()
        )
    }

    @Test
    fun `should parse complete configuration`() {
        val data = TestJsonParser.parse(File("../src/test_data/configurationComplete.json").readText())
        assertEquals(
            ExponeaConfiguration(
                projectToken = "mock-project-token",
                authorization = "Token mock-authorization-token",
                baseURL = "http://mock-base-url.xxx",
                projectRouteMap = hashMapOf(
                    EventType.BANNER to arrayListOf(ExponeaProject(
                        "http://mock-base-url.xxx",
                        "other-project-token",
                        "Token other-auth-token"
                    ))
                ),
                defaultProperties = hashMapOf(
                    "string" to "value",
                    "boolean" to false,
                    "number" to 3.14159,
                    "array" to arrayListOf("value1", "value2"),
                    "object" to hashMapOf("key" to "value")
                ),
                maxTries = 10,
                sessionTimeout = 20.0,
                automaticSessionTracking = true,
                tokenTrackFrequency = ExponeaConfiguration.TokenFrequency.DAILY,
                automaticPushNotification = true,
                pushIcon = 12345,
                pushAccentColor = 123,
                pushChannelName = "mock-push-channel-name",
                pushChannelDescription = "mock-push-channel-description",
                pushChannelId = "mock-push-channel-id",
                pushNotificationImportance = NotificationManager.IMPORTANCE_HIGH,
                httpLoggingLevel = ExponeaConfiguration.HttpLoggingLevel.BODY
            ),
            ConfigurationParser(data as ReadableMap).parse()
        )
    }

    @Test
    fun `should provide meaningful error on missing required properties`() {
        try {
            ConfigurationParser(JavaOnlyMap.of("projectToken", 123)).parse()
            fail("Should throw exception")
        } catch (e: Exception) {
            assertEquals("Required property 'authorizationToken' missing in configuration object", e.message)
        }
    }

    @Test
    fun `should provide meaningful error on incorrect type`() {
        try {
            ConfigurationParser(JavaOnlyMap.of("projectToken", 123, "authorizationToken", "token")).parse()
            fail("Should throw exception")
        } catch (e: Exception) {
            assertEquals("Incorrect type for key 'projectToken'. Expected String got Double", e.message)
        }
    }
}
