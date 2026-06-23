package com.exponea

import android.app.NotificationManager
import android.graphics.Color
import androidx.test.core.app.ApplicationProvider
import com.exponea.sdk.models.EventType
import com.exponea.sdk.models.ExponeaConfiguration
import com.exponea.sdk.models.ProjectConfig
import com.exponea.sdk.models.StreamConfig
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.ReadableMap
import io.mockk.every
import io.mockk.mockkStatic
import java.io.File
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(manifest = Config.NONE)
internal class ConfigurationParserTest {

    companion object {
      private const val MOCK_PROJECT_TOKEN = "mock-project-token"
      private const val TOKEN_MOCK_AUTHORIZATION_TOKEN = "Token mock-authorization-token"
      private const val HTTP_MOCK_BASE_URL = "http://mock-base-url.xxx"
    }

    @Test
    fun `should parse minimal configuration`() {
        val data = TestJsonParser.parse(File("../src/test_data/configurationMinimal.json").readText())
        val result = ConfigurationParser(data as ReadableMap).parse()
        val projectConfig = result.integrationConfig as ProjectConfig
        assertEquals(MOCK_PROJECT_TOKEN, projectConfig.projectToken)
        assertEquals(TOKEN_MOCK_AUTHORIZATION_TOKEN, projectConfig.authorization)
    }

    @Test
    fun `should parse complete configuration`() {
        val data = TestJsonParser.parse(File("../src/test_data/configurationComplete.json").readText())
        val result = ConfigurationParser(data as ReadableMap).parse()
        val projectConfig = result.integrationConfig as ProjectConfig
        assertEquals(MOCK_PROJECT_TOKEN, projectConfig.projectToken)
        assertEquals(TOKEN_MOCK_AUTHORIZATION_TOKEN, projectConfig.authorization)
        assertEquals(HTTP_MOCK_BASE_URL, projectConfig.baseUrl)
        val bannerProjects = result.integrationRouteMap[EventType.BANNER]
        assertEquals(1, bannerProjects?.size)
        assertEquals("other-project-token", bannerProjects?.get(0)?.projectToken)
        assertEquals("Token other-auth-token", bannerProjects?.get(0)?.authorization)
        // default base url
        assertEquals("https://api.exponea.com", bannerProjects?.get(0)?.baseUrl)
        assertEquals(
            hashMapOf(
                "string" to "value",
                "boolean" to false,
                "number" to 3.14159,
                "array" to arrayListOf("value1", "value2"),
                "object" to hashMapOf("key" to "value")
            ),
            result.defaultProperties
        )
        assertEquals(10, result.maxTries)
        assertEquals(60.0, result.sessionTimeout, 0.001)
        assertEquals(true, result.automaticSessionTracking)
        assertEquals(ExponeaConfiguration.TokenFrequency.DAILY, result.tokenTrackFrequency)
        assertEquals(false, result.requirePushAuthorization)
        assertEquals(true, result.automaticPushNotification)
        assertEquals(12345, result.pushIcon)
        assertEquals(123, result.pushAccentColor)
        assertEquals("mock-push-channel-name", result.pushChannelName)
        assertEquals("mock-push-channel-description", result.pushChannelDescription)
        assertEquals("mock-push-channel-id", result.pushChannelId)
        assertEquals(NotificationManager.IMPORTANCE_HIGH, result.pushNotificationImportance)
        assertEquals(ExponeaConfiguration.HttpLoggingLevel.BODY, result.httpLoggingLevel)
        assertEquals(false, result.allowDefaultCustomerProperties)
        assertEquals(true, result.regenerateDeviceIdOnAnonymize)
    }

    @Test
    fun `should provide meaningful error when no integration is configured`() {
        val exception = assertThrows(ExponeaModule.ExponeaDataException::class.java) {
            ConfigurationParser(JavaOnlyMap.of()).parse()
        }
        assertEquals(
            "Required property 'integrationConfig' missing in configuration object",
            exception.message
        )
    }

    @Test
    fun `should provide meaningful error when integrationConfig is empty`() {
        val exception = assertThrows(ExponeaModule.ExponeaDataException::class.java) {
            ConfigurationParser(
                JavaOnlyMap.of("integrationConfig", JavaOnlyMap.of()) as ReadableMap
            ).parse()
        }
        assertEquals(
            "'integrationConfig' requires either 'streamId' for 'StreamConfig', " +
            "or 'projectToken' and 'authorizationToken' for 'ProjectConfig'",
            exception.message
        )
    }

    @Test
    fun `should provide meaningful error on missing required properties`() {
        val exception = assertThrows(ExponeaModule.ExponeaDataException::class.java) {
            ConfigurationParser(
                JavaOnlyMap.of("integrationConfig", JavaOnlyMap.of("projectToken", 123)) as ReadableMap
            ).parse()
        }
        assertEquals(
            "Required property 'authorizationToken' missing in configuration object",
            exception.message
        )
    }

    @Test
    fun `should provide meaningful error on incorrect type`() {
        val exception = assertThrows(ExponeaModule.ExponeaDataException::class.java) {
            ConfigurationParser(
                JavaOnlyMap.of(
                    "integrationConfig", JavaOnlyMap.of("projectToken", 123, "authorizationToken", "token")
                ) as ReadableMap
            ).parse()
        }
        assertEquals(
            "Incorrect type for key 'projectToken'. Expected String got Double",
            exception.message
        )
    }

    @Test
    fun `should figure out color from RGBA channels correctly`() {
        val data = JavaOnlyMap.of(
            "integrationConfig", JavaOnlyMap.of(
                "projectToken", MOCK_PROJECT_TOKEN,
                "authorizationToken", "mock-authorization-token",
                "baseUrl", HTTP_MOCK_BASE_URL
            ),
            "android", JavaOnlyMap.of("pushAccentColorRGBA", "100, 100, 90, 150"))

        mockkStatic("android.graphics.Color")
        every { Color.argb(150, 100, 100, 90) } returns 123

        val result = ConfigurationParser(data as ReadableMap).parse()
        val projectConfig = result.integrationConfig as ProjectConfig
        assertEquals(MOCK_PROJECT_TOKEN, projectConfig.projectToken)
        assertEquals(TOKEN_MOCK_AUTHORIZATION_TOKEN, projectConfig.authorization)
        assertEquals(HTTP_MOCK_BASE_URL, projectConfig.baseUrl)
        assertEquals(123, result.pushAccentColor)
    }

    @Test
    fun `should provide error on wrong color format`() {
        val data = JavaOnlyMap.of(
            "integrationConfig", JavaOnlyMap.of(
                "projectToken", MOCK_PROJECT_TOKEN,
                "authorizationToken", "mock-authorization-token",
                "baseUrl", HTTP_MOCK_BASE_URL
            ),
            "android", JavaOnlyMap.of("pushAccentColorRGBA", "100, text, 90, 150, &"))
        mockkStatic("android.graphics.Color")
        val exception = assertThrows(ExponeaModule.ExponeaDataException::class.java) {
            ConfigurationParser(data as ReadableMap).parse()
        }
        assertEquals(
            "Incorrect value '100, text, 90, 150, &' for key 'pushAccentColorRGBA'.",
            exception.message
        )
    }

    @Test
    fun `should not fail when color not found in resources`() {
        val data = JavaOnlyMap.of(
            "integrationConfig", JavaOnlyMap.of(
                "projectToken", MOCK_PROJECT_TOKEN,
                "authorizationToken", "mock-authorization-token",
                "baseUrl", HTTP_MOCK_BASE_URL
            ),
            "android", JavaOnlyMap.of("pushAccentColorName", "my_color"))
        val config = ConfigurationParser(data as ReadableMap).parse(ApplicationProvider.getApplicationContext())
        assertNull(config.pushAccentColor)
    }

    @Test
    fun `should not fail when icon not found in resources`() {
        val data = JavaOnlyMap.of(
            "integrationConfig", JavaOnlyMap.of(
                "projectToken", MOCK_PROJECT_TOKEN,
                "authorizationToken", "mock-authorization-token",
                "baseUrl", HTTP_MOCK_BASE_URL
            ),
            "android", JavaOnlyMap.of("pushIconResourceName", "my_icon"))
        val config = ConfigurationParser(data as ReadableMap).parse(ApplicationProvider.getApplicationContext())
        assertNull(config.pushIcon)
    }

    @Test
    fun `should parse requirePushAuthorization from root level`() {
        val data = JavaOnlyMap.of(
            "integrationConfig", JavaOnlyMap.of(
                "projectToken", MOCK_PROJECT_TOKEN,
                "authorizationToken", "mock-authorization-token"
            ),
            "requirePushAuthorization", false
        )
        val config = ConfigurationParser(data as ReadableMap).parse()
        assertEquals(false, config.requirePushAuthorization)
    }

    @Test
    fun `should parse minimal stream configuration`() {
        val data = TestJsonParser.parse(File("../src/test_data/configurationStreamMinimal.json").readText())
        val result = ConfigurationParser(data as ReadableMap).parse()
        val streamConfig = result.integrationConfig as? StreamConfig
        assertEquals("mock-stream-id", streamConfig?.streamId)
        assertEquals("https://api.exponea.com", streamConfig?.baseUrl)
    }

    @Test
    fun `should parse stream configuration with custom baseUrl`() {
        val data = JavaOnlyMap.of(
            "integrationConfig", JavaOnlyMap.of("streamId", "mock-stream-id", "baseUrl", "https://custom.url")
        )
        val result = ConfigurationParser(data as ReadableMap).parse()
        val streamConfig = result.integrationConfig as? StreamConfig
        assertEquals("mock-stream-id", streamConfig?.streamId)
        assertEquals("https://custom.url", streamConfig?.baseUrl)
    }

    @Test
    fun `should parse requirePushAuthorization from android block and override root`() {
        val data = JavaOnlyMap.of(
            "integrationConfig", JavaOnlyMap.of(
                "projectToken", MOCK_PROJECT_TOKEN,
                "authorizationToken", "mock-authorization-token"
            ),
            "requirePushAuthorization", true,
            "android", JavaOnlyMap.of("requirePushAuthorization", false)
        )
        val config = ConfigurationParser(data as ReadableMap).parse()
        assertEquals(false, config.requirePushAuthorization)
    }
}
