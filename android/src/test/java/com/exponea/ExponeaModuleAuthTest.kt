package com.exponea

import androidx.test.core.app.ApplicationProvider
import com.exponea.sdk.Exponea
import com.exponea.sdk.models.SdkAuthCallback
import com.exponea.sdk.models.SdkAuthError
import com.exponea.sdk.models.SdkAuthErrorCode
import com.facebook.react.bridge.BridgeReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.mockk.Runs
import io.mockk.every
import io.mockk.just
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.slot
import io.mockk.spyk
import io.mockk.unmockkAll
import io.mockk.verify
import kotlin.test.assertTrue
import org.json.JSONObject
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
internal class ExponeaModuleAuthTest {
    private lateinit var module: ExponeaModule
    private lateinit var eventEmitter: DeviceEventManagerModule.RCTDeviceEventEmitter

    @Before
    fun before() {
        mockkObject(Exponea)
        // Spy the context so we can intercept the JS event emitter used by sendEvent().
        val context = spyk(BridgeReactContext(ApplicationProvider.getApplicationContext()))
        eventEmitter = mockk(relaxed = true)
        every {
            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        } returns eventEmitter
        module = ExponeaModule(context)
    }

    @After
    fun after() {
        unmockkAll()
    }

    @Test
    fun `onSdkAuthErrorCallbackSet registers a callback on the native SDK`() {
        val callbackSlot = slot<SdkAuthCallback>()
        every { Exponea.sdkAuthCallback = capture(callbackSlot) } just Runs

        module.onSdkAuthErrorCallbackSet()

        assertTrue(callbackSlot.isCaptured)
    }

    @Test
    fun `auth failure is emitted to JS as sdkAuthError event with normalized payload`() {
        val callbackSlot = slot<SdkAuthCallback>()
        every { Exponea.sdkAuthCallback = capture(callbackSlot) } just Runs
        module.onSdkAuthErrorCallbackSet()

        callbackSlot.captured.onAuthFailure(
            SdkAuthError(
                SdkAuthErrorCode.TOKEN_EXPIRED,
                mapOf("registered" to "test@example.com")
            )
        )

        val nameSlot = slot<String>()
        val paramsSlot = slot<Any>()
        verify { eventEmitter.emit(capture(nameSlot), capture(paramsSlot)) }
        assertEquals("sdkAuthError", nameSlot.captured)
        val payload = JSONObject(paramsSlot.captured as String)
        assertEquals("TOKEN_EXPIRED", payload.getString("errorCode"))
        assertEquals(
            "test@example.com",
            payload.getJSONObject("customerIds").getString("registered")
        )
    }

    @Test
    fun `auth failure with no customer ids emits an empty customerIds object`() {
        val callbackSlot = slot<SdkAuthCallback>()
        every { Exponea.sdkAuthCallback = capture(callbackSlot) } just Runs
        module.onSdkAuthErrorCallbackSet()

        callbackSlot.captured.onAuthFailure(
            SdkAuthError(SdkAuthErrorCode.TOKEN_NOT_PROVIDED, emptyMap())
        )

        val paramsSlot = slot<Any>()
        verify { eventEmitter.emit("sdkAuthError", capture(paramsSlot)) }
        val payload = JSONObject(paramsSlot.captured as String)
        assertEquals("TOKEN_NOT_PROVIDED", payload.getString("errorCode"))
        assertEquals(0, payload.getJSONObject("customerIds").length())
    }

    @Test
    fun `onSdkAuthErrorCallbackRemove clears the native callback`() {
        every { Exponea.sdkAuthCallback = any() } just Runs

        module.onSdkAuthErrorCallbackRemove()

        verify { Exponea.sdkAuthCallback = null }
    }
}
