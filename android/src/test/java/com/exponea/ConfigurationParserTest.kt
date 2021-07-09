package com.exponea

import android.app.NotificationManager
import android.graphics.Color
import androidx.test.core.app.ApplicationProvider
import com.exponea.sdk.models.EventType
import com.exponea.sdk.models.ExponeaConfiguration
import com.exponea.sdk.models.ExponeaProject
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.ReadableMap
import io.mockk.every
import io.mockk.mockkStatic
import java.io.File
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.fail
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(manifest = Config.NONE)
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

    @Test
    fun `should figure out color from RGBA channels correctly`() {
        val data = JavaOnlyMap.of(
            "projectToken", "mock-project-token",
            "authorizationToken", "mock-authorization-token",
            "baseUrl", "http://mock-base-url.xxx",
            "android", JavaOnlyMap.of("pushAccentColorRGBA", "100, 100, 90, 150"))

        mockkStatic("android.graphics.Color")
        every { Color.argb(150, 100, 100, 90) } returns 123

        assertEquals(
            ExponeaConfiguration(
                projectToken = "mock-project-token",
                authorization = "Token mock-authorization-token",
                baseURL = "http://mock-base-url.xxx",
                pushAccentColor = 123
            ),
            ConfigurationParser(data as ReadableMap).parse()
        )
    }

    @Test
    fun `should provide error on wrong color format`() {
        val data = JavaOnlyMap.of(
            "projectToken", "mock-project-token",
            "authorizationToken", "mock-authorization-token",
            "baseUrl", "http://mock-base-url.xxx",
            "android", JavaOnlyMap.of("pushAccentColorRGBA", "100, text, 90, 150, &"))
        try {
            mockkStatic("android.graphics.Color")
            ConfigurationParser(data as ReadableMap).parse()
            fail("Should throw exception")
        } catch (e: Exception) {
            assertEquals("Incorrect value '100, text, 90, 150, &' for key pushAccentColorRGBA.", e.message)
        }
    }

    @Test
    fun `should not fail when color not found in resources`() {
        val data = JavaOnlyMap.of(
            "projectToken", "mock-project-token",
            "authorizationToken", "mock-authorization-token",
            "baseUrl", "http://mock-base-url.xxx",
            "android", JavaOnlyMap.of("pushAccentColorName", "my_color"))
        val config = ConfigurationParser(data as ReadableMap).parse(ApplicationProvider.getApplicationContext())
        assertNull(config.pushAccentColor)
    }

    @Test
    fun `should not fail when icon not found in resources`() {
        val data = JavaOnlyMap.of(
            "projectToken", "mock-project-token",
            "authorizationToken", "mock-authorization-token",
            "baseUrl", "http://mock-base-url.xxx",
            "android", JavaOnlyMap.of("pushIconResourceName", "my_icon"))
        val config = ConfigurationParser(data as ReadableMap).parse(ApplicationProvider.getApplicationContext())
        assertNull(config.pushIcon)
    }
}
