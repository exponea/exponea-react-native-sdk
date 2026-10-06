package com.exponea

import androidx.test.core.app.ApplicationProvider
import com.exponea.sdk.Exponea
import com.exponea.sdk.models.LoggerCallback
import com.exponea.sdk.util.Logger
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
internal class ExponeaModuleLoggerTest {
    private lateinit var module: ExponeaModule
    private lateinit var eventEmitter: DeviceEventManagerModule.RCTDeviceEventEmitter

    @Before
    fun before() {
        mockkObject(Exponea)
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
    fun `logger callback emits Android DEBUG as public DBG`() {
        val callbackSlot = slot<LoggerCallback>()
        every { Exponea.registerLoggerCallback(capture(callbackSlot)) } just Runs

        module.registerLoggerCallback()
        assertTrue(callbackSlot.isCaptured)
        callbackSlot.captured.onLog(Logger.Level.DEBUG, "Debug details", null)

        val paramsSlot = slot<Any>()
        verify { eventEmitter.emit("logger", capture(paramsSlot)) }
        val payload = JSONObject(paramsSlot.captured as String)
        assertEquals("DBG", payload.getString("level"))
        assertEquals("Debug details", payload.getString("message"))
        assertTrue(!payload.has("throwable"))
    }

    @Test
    fun `logger callback serializes throwable stack trace`() {
        val callbackSlot = slot<LoggerCallback>()
        every { Exponea.registerLoggerCallback(capture(callbackSlot)) } just Runs
        module.registerLoggerCallback()

        val throwable = IllegalStateException("Request failed")
        callbackSlot.captured.onLog(Logger.Level.ERROR, "Request failed", throwable)

        val paramsSlot = slot<Any>()
        verify { eventEmitter.emit("logger", capture(paramsSlot)) }
        val payload = JSONObject(paramsSlot.captured as String)
        assertEquals("ERROR", payload.getString("level"))
        assertTrue(payload.getString("throwable").contains("IllegalStateException: Request failed"))
    }

    @Test
    fun `unregister uses the same native logger callback instance`() {
        val registered = slot<LoggerCallback>()
        val unregistered = slot<LoggerCallback>()
        every { Exponea.registerLoggerCallback(capture(registered)) } just Runs
        every { Exponea.unregisterLoggerCallback(capture(unregistered)) } just Runs

        module.registerLoggerCallback()
        module.unregisterLoggerCallback()

        assertTrue(registered.isCaptured)
        assertTrue(unregistered.isCaptured)
        assertTrue(registered.captured === unregistered.captured)
    }

    @Test
    fun `invalidate unregisters the native logger callback`() {
        val registered = slot<LoggerCallback>()
        val unregistered = slot<LoggerCallback>()
        every { Exponea.registerLoggerCallback(capture(registered)) } just Runs
        every { Exponea.unregisterLoggerCallback(capture(unregistered)) } just Runs

        module.registerLoggerCallback()
        module.invalidate()

        assertTrue(unregistered.isCaptured)
        assertTrue(registered.captured === unregistered.captured)
    }
}
