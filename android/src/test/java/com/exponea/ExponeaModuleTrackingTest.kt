package com.exponea

import androidx.test.core.app.ApplicationProvider
import com.exponea.sdk.Exponea
import com.exponea.sdk.models.CustomerIds
import com.exponea.sdk.models.InAppMessage
import com.exponea.sdk.models.NotificationAction
import com.exponea.sdk.models.NotificationData
import com.exponea.sdk.models.PropertiesList
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.slot
import io.mockk.unmockkAll
import io.mockk.verify
import java.io.File
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
internal class ExponeaModuleTrackingTest {
    lateinit var module: ExponeaModule

    @Before
    fun before() {
        mockkObject(Exponea)
        module = ExponeaModule(ReactApplicationContext(ApplicationProvider.getApplicationContext()))
    }

    @After
    fun after() {
        unmockkAll()
    }

    @Test
    fun `mock if init should working fine`() {
        every { Exponea.isInitialized } returns false
        assertFalse(Exponea.isInitialized)
        every { Exponea.isInitialized } returns true
        assertTrue(Exponea.isInitialized)
    }

    @Test
    fun `identify customer should reject when Exponea is not initialized`() {
        every { Exponea.isInitialized } returns false
        module.identifyCustomer(
            JavaOnlyMap.of("id", "value"),
            JavaOnlyMap.of("email", "a@b.c"),
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaNotInitializedException::class, it.errorThrowable!!::class)
            }
        )
    }

    @Test
    fun `identify customer should resolve and identify customer with correct data`() {
        every { Exponea.isInitialized } returns true
        val customerIdsSlot = slot<CustomerIds>()
        module.identifyCustomer(
            JavaOnlyMap.of("id", "value"),
            JavaOnlyMap.of("email", "a@b.c"),
            MockResolvingPromise {
                verify {
                    Exponea.identifyCustomer(
                        capture(customerIdsSlot),
                        PropertiesList(hashMapOf("email" to "a@b.c"))
                    )
                }
            }
        )
        assertTrue(customerIdsSlot.isCaptured)
        val customerIds = customerIdsSlot.captured
        assertEquals(CustomerIds().withId("id", "value"), customerIds)
    }

    @Test
    fun `flush data should reject when Exponea is not initialized`() {
        every { Exponea.isInitialized } returns false
        module.flushData(
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaNotInitializedException::class, it.errorThrowable!!::class)
            }
        )
    }

    @Test
    fun `flush data should resolve and flush data`() {
        every { Exponea.isInitialized } returns true
        module.flushData(
            MockResolvingPromise {
                verify { Exponea.flushData(any()) }
            }
        )
    }

    @Test
    fun `track event should reject when Exponea is not initialized`() {
        every { Exponea.isInitialized } returns false
        module.trackEvent(
            "event_name",
            JavaOnlyMap.of("string", "asd", "number", 123, "boolean", false),
            JavaOnlyMap.of(),
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaNotInitializedException::class, it.errorThrowable!!::class)
            }
        )
    }

    @Test
    fun `track event should track data without timestamp parameter`() {
        every { Exponea.isInitialized } returns true
        module.trackEvent(
            "event_name",
            JavaOnlyMap.of("string", "asd", "number", 123, "boolean", false),
            JavaOnlyMap.of(),
            MockResolvingPromise {
                verify {
                    Exponea.trackEvent(
                        PropertiesList(hashMapOf("string" to "asd", "number" to 123.0, "boolean" to false)),
                        null,
                        "event_name"
                    )
                }
            }
        )
    }

    @Test
    fun `track event should track data with empty timestamp parameter`() {
        every { Exponea.isInitialized } returns true
        module.trackEvent(
            "event_name",
            JavaOnlyMap.of("string", "asd", "number", 123, "boolean", false),
            JavaOnlyMap.of("timestamp", null),
            MockResolvingPromise {
                verify {
                    Exponea.trackEvent(
                        PropertiesList(hashMapOf("string" to "asd", "number" to 123.0, "boolean" to false)),
                        null,
                        "event_name"
                    )
                }
            }
        )
    }

    @Test
    fun `track event should track data with timestamp parameter`() {
        every { Exponea.isInitialized } returns true
        module.trackEvent(
            "event_name",
            JavaOnlyMap.of("string", "asd", "number", 123, "boolean", false),
            JavaOnlyMap.of("timestamp", 123),
            MockResolvingPromise {
                verify {
                    Exponea.trackEvent(
                        PropertiesList(hashMapOf("string" to "asd", "number" to 123.0, "boolean" to false)),
                        123.0,
                        "event_name"
                    )
                }
            }
        )
    }

    @Test
    fun `track session start should reject when Exponea is not initialized`() {
        every { Exponea.isInitialized } returns false
        module.trackSessionStart(
            JavaOnlyMap.of(),
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaNotInitializedException::class, it.errorThrowable!!::class)
            }
        )
    }

    @Test
    fun `track session start should resolve and track session start without timestamp parameter`() {
        every { Exponea.isInitialized } returns true
        module.trackSessionStart(
            JavaOnlyMap.of(),
            MockResolvingPromise {
                verify { Exponea.trackSessionStart(range(currentTimeSeconds() - 1, currentTimeSeconds() + 1)) }
            }
        )
    }

    @Test
    fun `track session start should resolve and track session start with empty timestamp parameter`() {
        every { Exponea.isInitialized } returns true
        module.trackSessionStart(
            JavaOnlyMap.of("timestamp", null),
            MockResolvingPromise {
                verify { Exponea.trackSessionStart(range(currentTimeSeconds() - 1, currentTimeSeconds() + 1)) }
            }
        )
    }

    @Test
    fun `track session start should resolve and track session start with timestamp parameter`() {
        every { Exponea.isInitialized } returns true
        module.trackSessionStart(
            JavaOnlyMap.of("timestamp", 123),
            MockResolvingPromise {
                verify { Exponea.trackSessionStart(123.0) }
            }
        )
    }

    @Test
    fun `track session end should reject when Exponea is not initialized`() {
        every { Exponea.isInitialized } returns false
        module.trackSessionEnd(
            JavaOnlyMap.of(),
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaNotInitializedException::class, it.errorThrowable!!::class)
            }
        )
    }

    @Test
    fun `track session end should resolve and track session end without timestamp parameter`() {
        every { Exponea.isInitialized } returns true
        module.trackSessionEnd(
            JavaOnlyMap.of(),
            MockResolvingPromise {
                verify { Exponea.trackSessionEnd(range(currentTimeSeconds() - 1, currentTimeSeconds() + 1)) }
            }
        )
    }

    @Test
    fun `track session end should resolve and track session end with empty timestamp parameter`() {
        every { Exponea.isInitialized } returns true
        module.trackSessionEnd(
            JavaOnlyMap.of("timestamp", null),
            MockResolvingPromise {
                verify { Exponea.trackSessionEnd(range(currentTimeSeconds() - 1, currentTimeSeconds() + 1)) }
            }
        )
    }

    @Test
    fun `track session end should resolve and track session end with timestamp parameter`() {
        every { Exponea.isInitialized } returns true
        module.trackSessionEnd(
            JavaOnlyMap.of("timestamp", 123),
            MockResolvingPromise {
                verify { Exponea.trackSessionEnd(123.0) }
            }
        )
    }

    @Test
    fun `tracks delivered production push notification`() {
        every { Exponea.isInitialized } returns true
        val notificationSlot = slot<NotificationData>()
        module.trackDeliveredPush(
            getPushNotificationAsMap(),
            MockResolvingPromise {
                verify {
                    Exponea.trackDeliveredPush(
                        capture(notificationSlot),
                        any()
                    )
                }
            }
        )
        assertTrue(notificationSlot.isCaptured)
        val data = notificationSlot.captured
        assertEquals(true, data.hasTrackingConsent)
        assertEquals("campaign", data.eventType)
        assertEquals(hashMapOf(
            "event_type" to "campaign",
            "campaign_id" to "5db9ab54b073dfb424ccfa6f",
            "campaign_name" to "Wassil's push",
            "action_id" to 2.0,
            "action_name" to "Unnamed mobile push",
            "action_type" to "mobile notification",
            "campaign_policy" to "",
            "platform" to "android",
            "language" to "",
            "subject" to "Notification title",
            "recipient" to "eMxrdLuMalE:APA91bFgzKPVtem5aA0ZL0PFm_FgksAtVCOhzIQywX7DZQx2dKiVUepgl_Yw2aIrGZ7gpblCHltL6PWfXLoRw_5aZvV9swkPtUNwYjMNoF2f7igXgNe5Ovgyi8q5fmoX9QVHtyt8C-0Z", // ktlint-disable max-line-length
            "sent_timestamp" to 1614585422.20,
            "type" to "push"
        ), data.attributes)
        val campaignData = data.campaignData
        assertEquals("Testing mobile push", campaignData.campaign)
        assertEquals("term", campaignData.term)
        assertEquals("mobile_push_notification", campaignData.medium)
        assertEquals("content campaign", campaignData.content)
        assertEquals(null, campaignData.payload)
        assertEquals("exponea", campaignData.source)
        assertEquals(mapOf(
            "campaign_id" to "5db9ab54b073dfb424ccfa6f",
            "campaign_name" to "Wassil's push",
            "action_id" to 2.0,
            "action_name" to "Unnamed mobile push",
            "action_type" to "mobile notification",
            "campaign_policy" to "",
            "platform" to "android",
            "language" to "",
            "subject" to "Notification title",
            "recipient" to "eMxrdLuMalE:APA91bFgzKPVtem5aA0ZL0PFm_FgksAtVCOhzIQywX7DZQx2dKiVUepgl_Yw2aIrGZ7gpblCHltL6PWfXLoRw_5aZvV9swkPtUNwYjMNoF2f7igXgNe5Ovgyi8q5fmoX9QVHtyt8C-0Z", // ktlint-disable max-line-length
            "sent_timestamp" to 1614585422.20,
            "type" to "push",
            "utm_source" to "exponea",
            "utm_medium" to "mobile_push_notification",
            "utm_campaign" to "Testing mobile push",
            "utm_content" to "content campaign",
            "utm_term" to "term"
        ), data.getTrackingData())
    }

    @Test
    fun `tracks clicked production push notification`() {
        every { Exponea.isInitialized } returns true
        val notificationSlot = slot<NotificationData>()
        val actionSlot = slot<NotificationAction>()
        module.trackClickedPush(
            getPushNotificationAsMap() + getPushNotificationActionAsMap(),
            MockResolvingPromise {
                verify {
                    Exponea.trackClickedPush(
                        capture(notificationSlot),
                        capture(actionSlot),
                        any()
                    )
                }
            }
        )
        assertTrue(notificationSlot.isCaptured)
        val data = notificationSlot.captured
        assertEquals(true, data.hasTrackingConsent)
        assertEquals("campaign", data.eventType)
        assertEquals(hashMapOf(
            "event_type" to "campaign",
            "campaign_id" to "5db9ab54b073dfb424ccfa6f",
            "campaign_name" to "Wassil's push",
            "action_id" to 2.0,
            "action_name" to "Unnamed mobile push",
            "action_type" to "mobile notification",
            "campaign_policy" to "",
            "platform" to "android",
            "language" to "",
            "subject" to "Notification title",
            "recipient" to "eMxrdLuMalE:APA91bFgzKPVtem5aA0ZL0PFm_FgksAtVCOhzIQywX7DZQx2dKiVUepgl_Yw2aIrGZ7gpblCHltL6PWfXLoRw_5aZvV9swkPtUNwYjMNoF2f7igXgNe5Ovgyi8q5fmoX9QVHtyt8C-0Z", // ktlint-disable max-line-length
            "sent_timestamp" to 1614585422.20,
            "type" to "push"
        ), data.attributes)
        val campaignData = data.campaignData
        assertEquals("Testing mobile push", campaignData.campaign)
        assertEquals("term", campaignData.term)
        assertEquals("mobile_push_notification", campaignData.medium)
        assertEquals("content campaign", campaignData.content)
        assertEquals(null, campaignData.payload)
        assertEquals("exponea", campaignData.source)
        assertEquals(mapOf(
            "campaign_id" to "5db9ab54b073dfb424ccfa6f",
            "campaign_name" to "Wassil's push",
            "action_id" to 2.0,
            "action_name" to "Unnamed mobile push",
            "action_type" to "mobile notification",
            "campaign_policy" to "",
            "platform" to "android",
            "language" to "",
            "subject" to "Notification title",
            "recipient" to "eMxrdLuMalE:APA91bFgzKPVtem5aA0ZL0PFm_FgksAtVCOhzIQywX7DZQx2dKiVUepgl_Yw2aIrGZ7gpblCHltL6PWfXLoRw_5aZvV9swkPtUNwYjMNoF2f7igXgNe5Ovgyi8q5fmoX9QVHtyt8C-0Z", // ktlint-disable max-line-length
            "sent_timestamp" to 1614585422.20,
            "type" to "push",
            "utm_source" to "exponea",
            "utm_medium" to "mobile_push_notification",
            "utm_campaign" to "Testing mobile push",
            "utm_content" to "content campaign",
            "utm_term" to "term"
        ), data.getTrackingData())
        assertTrue(actionSlot.isCaptured)
        val notificationAction = actionSlot.captured
        assertEquals("button", notificationAction.actionType)
        assertEquals("Clicked action", notificationAction.actionName)
        assertEquals("https://example.com", notificationAction.url)
    }

    @Test
    fun `should track complete In-app message action`() {
        every { Exponea.isInitialized } returns true
        val messageSlot = slot<InAppMessage>()
        val buttonText = slot<String>()
        val buttonLink = slot<String>()
        val data = TestJsonParser.parse(File("../src/test_data/in-app-click-minimal.json").readText())
        module.trackInAppMessageClick(
            params = data as ReadableMap,
            promise = MockResolvingPromise {
                verify {
                    Exponea.trackInAppMessageClick(
                        capture(messageSlot),
                        capture(buttonText),
                        capture(buttonLink)
                    )
                }
            }
        )
        assertTrue(messageSlot.isCaptured)
        assertFalse(messageSlot.isNull)
        assertEquals(messageSlot.captured, InAppMessageTestData.buildInAppMessage())
        assertFalse(buttonText.isNull)
        assertEquals(buttonText.captured, "Click me!")
        assertFalse(buttonLink.isNull)
        assertEquals(buttonLink.captured, "https://example.com")
    }

    @Test
    fun `should track complete In-app message action without consent`() {
        every { Exponea.isInitialized } returns true
        val messageSlot = slot<InAppMessage>()
        val buttonText = slot<String>()
        val buttonLink = slot<String>()
        val data = TestJsonParser.parse(File("../src/test_data/in-app-click-minimal.json").readText())
        module.trackInAppMessageClickWithoutTrackingConsent(
            params = data as ReadableMap,
            promise = MockResolvingPromise {
                verify {
                    Exponea.trackInAppMessageClickWithoutTrackingConsent(
                        capture(messageSlot),
                        capture(buttonText),
                        capture(buttonLink)
                    )
                }
            }
        )
        assertTrue(messageSlot.isCaptured)
        assertFalse(messageSlot.isNull)
        assertEquals(messageSlot.captured, InAppMessageTestData.buildInAppMessage())
        assertFalse(buttonText.isNull)
        assertEquals(buttonText.captured, "Click me!")
        assertFalse(buttonLink.isNull)
        assertEquals(buttonLink.captured, "https://example.com")
    }

    @Test
    fun `should track In-app message action with nulls`() {
        every { Exponea.isInitialized } returns true
        val messageSlot = slot<InAppMessage>()
        val buttonText = slot<String?>()
        val buttonLink = slot<String?>()
        val data = TestJsonParser.parse(File("../src/test_data/in-app-click-nulls.json").readText())
        module.trackInAppMessageClick(
            params = data as ReadableMap,
            promise = MockResolvingPromise {
                verify {
                    Exponea.trackInAppMessageClick(
                        capture(messageSlot),
                        captureNullable(buttonText),
                        captureNullable(buttonLink)
                    )
                }
            }
        )
        assertTrue(messageSlot.isCaptured)
        assertFalse(messageSlot.isNull)
        assertEquals(messageSlot.captured, InAppMessageTestData.buildInAppMessage())
        assertTrue(buttonText.isNull)
        assertTrue(buttonLink.isNull)
    }

    @Test
    fun `should track In-app message action with nulls without consent`() {
        every { Exponea.isInitialized } returns true
        val messageSlot = slot<InAppMessage>()
        val buttonText = slot<String?>()
        val buttonLink = slot<String?>()
        val data = TestJsonParser.parse(File("../src/test_data/in-app-click-nulls.json").readText())
        module.trackInAppMessageClickWithoutTrackingConsent(
            params = data as ReadableMap,
            promise = MockResolvingPromise {
                verify {
                    Exponea.trackInAppMessageClickWithoutTrackingConsent(
                        capture(messageSlot),
                        captureNullable(buttonText),
                        captureNullable(buttonLink)
                    )
                }
            }
        )
        assertTrue(messageSlot.isCaptured)
        assertFalse(messageSlot.isNull)
        assertEquals(messageSlot.captured, InAppMessageTestData.buildInAppMessage())
        assertTrue(buttonText.isNull)
        assertTrue(buttonLink.isNull)
    }

    @Test
    fun `should track complete In-app message close`() {
        every { Exponea.isInitialized } returns true
        val messageSlot = slot<InAppMessage>()
        val buttonText = slot<String>()
        val interaction = slot<Boolean>()
        val data = TestJsonParser.parse(File("../src/test_data/in-app-close-complete.json").readText())
        module.trackInAppMessageClose(
            params = data as ReadableMap,
            promise = MockResolvingPromise {
                verify {
                    Exponea.trackInAppMessageClose(
                        capture(messageSlot),
                        capture(buttonText),
                        capture(interaction)
                    )
                }
            }
        )
        assertTrue(messageSlot.isCaptured)
        assertFalse(messageSlot.isNull)
        assertEquals(messageSlot.captured, InAppMessageTestData.buildInAppMessage())
        assertFalse(buttonText.isNull)
        assertEquals(buttonText.captured, "Click me!")
        assertFalse(interaction.isNull)
        assertEquals(interaction.captured, true)
    }

    @Test
    fun `should track complete In-app message close without consent`() {
        every { Exponea.isInitialized } returns true
        val messageSlot = slot<InAppMessage>()
        val buttonText = slot<String>()
        val interaction = slot<Boolean>()
        val data = TestJsonParser.parse(File("../src/test_data/in-app-close-complete.json").readText())
        module.trackInAppMessageCloseWithoutTrackingConsent(
            params = data as ReadableMap,
            promise = MockResolvingPromise {
                verify {
                    Exponea.trackInAppMessageCloseWithoutTrackingConsent(
                        capture(messageSlot),
                        capture(buttonText),
                        capture(interaction)
                    )
                }
            }
        )
        assertTrue(messageSlot.isCaptured)
        assertFalse(messageSlot.isNull)
        assertEquals(messageSlot.captured, InAppMessageTestData.buildInAppMessage())
        assertFalse(buttonText.isNull)
        assertEquals(buttonText.captured, "Click me!")
        assertFalse(interaction.isNull)
        assertEquals(interaction.captured, true)
    }

    @Test
    fun `should track minimal In-app message close`() {
        every { Exponea.isInitialized } returns true
        val messageSlot = slot<InAppMessage>()
        val buttonText = slot<String?>()
        val interaction = slot<Boolean>()
        val data = TestJsonParser.parse(File("../src/test_data/in-app-close-minimal.json").readText())
        module.trackInAppMessageClose(
            params = data as ReadableMap,
            promise = MockResolvingPromise {
                verify {
                    Exponea.trackInAppMessageClose(
                        capture(messageSlot),
                        captureNullable(buttonText),
                        capture(interaction)
                    )
                }
            }
        )
        assertTrue(messageSlot.isCaptured)
        assertFalse(messageSlot.isNull)
        assertEquals(messageSlot.captured, InAppMessageTestData.buildInAppMessage())
        assertTrue(buttonText.isNull)
        assertFalse(interaction.isNull)
        assertEquals(interaction.captured, false)
    }

    @Test
    fun `should track minimal In-app message close without consent`() {
        every { Exponea.isInitialized } returns true
        val messageSlot = slot<InAppMessage>()
        val buttonText = slot<String?>()
        val interaction = slot<Boolean>()
        val data = TestJsonParser.parse(File("../src/test_data/in-app-close-minimal.json").readText())
        module.trackInAppMessageCloseWithoutTrackingConsent(
            params = data as ReadableMap,
            promise = MockResolvingPromise {
                verify {
                    Exponea.trackInAppMessageCloseWithoutTrackingConsent(
                        capture(messageSlot),
                        captureNullable(buttonText),
                        capture(interaction)
                    )
                }
            }
        )
        assertTrue(messageSlot.isCaptured)
        assertFalse(messageSlot.isNull)
        assertEquals(messageSlot.captured, InAppMessageTestData.buildInAppMessage())
        assertTrue(buttonText.isNull)
        assertFalse(interaction.isNull)
        assertEquals(interaction.captured, false)
    }

    private fun getPushNotificationActionAsMap(): ReadableMap {
        return mapOf(
            "actionType" to "button",
            "actionName" to "Clicked action",
            "url" to "https://example.com"
        ).toReadableMap()
    }

    private fun getPushNotificationAsMap(): ReadableMap {
        return mapOf(
            "notification_id" to "1",
            "action" to "app",
            "actions" to """[
                {"action":"app","title":"Action 1 title"},
                {"action":"deeplink","title":"Action 2 title","url":"http:\/\/deeplink?search=something"},
                {"action":"browser","title":"Action 3 title","url":"http:\/\/google.com?search=something"}
            ]""".trimIndent(),
            "url_params" to """
                {"utm_campaign":"Testing mobile push","utm_medium":"mobile_push_notification","utm_source":"exponea","utm_term":"term","utm_content":"content campaign"}
            """.trimIndent(),
            "title" to "Notification title",
            "attributes" to """{
                "campaign_name":"Wassil's push",
                "event_type":"campaign",
                "action_id":2,
                "action_type":"mobile notification",
                "campaign_policy":"",
                "subject":"Notification title",
                "action_name":"Unnamed mobile push",
                "recipient":"eMxrdLuMalE:APA91bFgzKPVtem5aA0ZL0PFm_FgksAtVCOhzIQywX7DZQx2dKiVUepgl_Yw2aIrGZ7gpblCHltL6PWfXLoRw_5aZvV9swkPtUNwYjMNoF2f7igXgNe5Ovgyi8q5fmoX9QVHtyt8C-0Z",
                "language":"",
                "campaign_id":"5db9ab54b073dfb424ccfa6f",
                "platform":"android",
                "sent_timestamp":1614585422.20,
                "type":"push"
            }""".trimIndent(),
            "message" to "Notification text"
        ).toReadableMap()
    }
}

private operator fun ReadableMap.plus(second: ReadableMap): ReadableMap {
    return (this.toHashMap() + second.toHashMap()).toReadableMap()
}

private fun <K : Any, V : Any> Map<K, V?>.toReadableMap(): ReadableMap {
    return JavaOnlyMap.of(*toVarargArray())
}

private fun <K : Any, V : Any> Map<K, V?>.toVarargArray(): Array<Any> {
    val result = mutableListOf<Any>()
    for ((key, value) in this) {
        if (value == null) {
            continue
        }
        result.add(key)
        result.add(value)
    }
    return result.toTypedArray()
}
