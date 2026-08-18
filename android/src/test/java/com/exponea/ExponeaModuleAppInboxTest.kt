package com.exponea

import androidx.test.core.app.ApplicationProvider
import com.exponea.sdk.Exponea
import com.exponea.sdk.models.MessageItem
import com.exponea.sdk.models.MessageItemAction
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BridgeReactContext
import com.facebook.react.bridge.JavaOnlyArray
import com.facebook.react.bridge.JavaOnlyMap
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

/**
 * Unit tests for App Inbox behaviour on Android:
 *  - `markAppInboxAsRead` resolves the canonical native item by id before marking and surfaces
 *    a proper resolve/reject outcome instead of a synchronous BOOL based on a JS-reconstructed item.
 *  - `Map<String, Any?>.toMessageItemAction()` falls back to the `"action"` key so cross-platform
 *    payloads (iOS / Android) resolve to a valid action type.
 */
@RunWith(RobolectricTestRunner::class)
internal class ExponeaModuleAppInboxTest {

    private lateinit var module: ExponeaModule

    @Before
    fun before() {
        mockkObject(Exponea)
        mockkStatic(Arguments::class)
        every { Arguments.createArray() } answers { JavaOnlyArray() }
        every { Arguments.createMap() } answers { JavaOnlyMap() }
        every { Exponea.isInitialized } returns true
        module = ExponeaModule(BridgeReactContext(ApplicationProvider.getApplicationContext()))
    }

    @After
    fun after() {
        unmockkAll()
    }

    // region markAppInboxAsRead

    @Test
    fun `markAppInboxAsRead resolves with false when message payload has no id`() {
        val invalidMessage = JavaOnlyMap.of("type", "push")
        module.markAppInboxAsRead(
            invalidMessage,
            MockResolvingPromise {
                assertEquals(false, it.result)
            }
        )
    }

    @Test
    fun `markAppInboxAsRead resolves with false when message payload has no type`() {
        val invalidMessage = JavaOnlyMap.of("id", "mock-id")
        module.markAppInboxAsRead(
            invalidMessage,
            MockResolvingPromise {
                assertEquals(false, it.result)
            }
        )
    }

    @Test
    fun `markAppInboxAsRead resolves with true when native mark succeeds`() {
        val message = JavaOnlyMap.of("id", "mock-id", "type", "push")
        val nativeMessage = MessageItem(
            id = "mock-id",
            rawType = "push",
            rawContent = mapOf()
        )
        every { Exponea.fetchAppInboxItem(any(), any()) } answers {
            secondArg<(MessageItem?) -> Unit>().invoke(nativeMessage)
        }
        every { Exponea.markAppInboxAsRead(any(), any()) } answers {
            secondArg<(Boolean) -> Unit>().invoke(true)
        }
        module.markAppInboxAsRead(
            message,
            MockResolvingPromise {
                assertEquals(true, it.result)
            }
        )
    }

    @Test
    fun `markAppInboxAsRead resolves with false when native item not found`() {
        val message = JavaOnlyMap.of("id", "mock-id", "type", "push")
        every { Exponea.fetchAppInboxItem(any(), any()) } answers {
            secondArg<(MessageItem?) -> Unit>().invoke(null)
        }
        module.markAppInboxAsRead(
            message,
            MockResolvingPromise {
                assertEquals(false, it.result)
            }
        )
    }

    @Test
    fun `markAppInboxAsRead resolves with false when native mark fails`() {
        val message = JavaOnlyMap.of("id", "mock-id", "type", "push")
        val nativeMessage = MessageItem(
            id = "mock-id",
            rawType = "push",
            rawContent = mapOf()
        )
        every { Exponea.fetchAppInboxItem(any(), any()) } answers {
            secondArg<(MessageItem?) -> Unit>().invoke(nativeMessage)
        }
        every { Exponea.markAppInboxAsRead(any(), any()) } answers {
            secondArg<(Boolean) -> Unit>().invoke(false)
        }
        module.markAppInboxAsRead(
            message,
            MockResolvingPromise {
                assertEquals(false, it.result)
            }
        )
    }

    // endregion

    // region toMessageItemAction

    @Test
    fun `toMessageItemAction resolves type from legacy 'type' key`() {
        val payload = mapOf<String, Any?>("type" to "browser", "title" to "Open", "url" to "https://example.com")
        val action = payload.toMessageItemAction()
        assertEquals(MessageItemAction.Type.BROWSER, action?.type)
        assertEquals("Open", action?.title)
        assertEquals("https://example.com", action?.url)
    }

    @Test
    fun `toMessageItemAction falls back to 'action' key when 'type' is missing`() {
        val payload = mapOf<String, Any?>("action" to "deeplink", "url" to "myapp://path")
        val action = payload.toMessageItemAction()
        assertEquals(MessageItemAction.Type.DEEPLINK, action?.type)
        assertEquals("myapp://path", action?.url)
    }

    @Test
    fun `toMessageItemAction prefers 'type' over 'action' when both are present`() {
        val payload = mapOf<String, Any?>("type" to "browser", "action" to "deeplink")
        val action = payload.toMessageItemAction()
        assertEquals(MessageItemAction.Type.BROWSER, action?.type)
    }

    @Test
    fun `toMessageItemAction returns null when neither key is present`() {
        val payload = mapOf<String, Any?>("title" to "Open")
        val action = payload.toMessageItemAction()
        assertNull(action)
    }

    @Test
    fun `toMessageItemAction returns null on unrecognised type value`() {
        val payload = mapOf<String, Any?>("type" to "not-a-real-type")
        val action = payload.toMessageItemAction()
        assertNull(action)
    }

    @Test
    fun `toMessageItemAction resolves all known action types from 'action' key`() {
        val knownActions = mapOf(
            "app" to MessageItemAction.Type.APP,
            "browser" to MessageItemAction.Type.BROWSER,
            "deeplink" to MessageItemAction.Type.DEEPLINK,
            "no_action" to MessageItemAction.Type.NO_ACTION
        )
        knownActions.forEach { (key, expected) ->
            val payload = mapOf<String, Any?>("action" to key)
            assertTrue(
                "Expected '$key' to resolve to $expected via 'action' fallback",
                payload.toMessageItemAction()?.type == expected
            )
        }
    }

    // endregion
}
