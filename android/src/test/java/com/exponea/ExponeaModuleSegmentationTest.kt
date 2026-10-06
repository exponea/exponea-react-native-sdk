package com.exponea

import com.exponea.sdk.Exponea
import com.exponea.sdk.models.Segment
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.mockk.Runs
import io.mockk.every
import io.mockk.just
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.slot
import io.mockk.unmockkAll
import io.mockk.verify
import org.json.JSONObject
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

/**
 * Every JavaScript segmentation registration owns exactly one native callback identified by
 * the ID issued by JavaScript, so several registrations may share a category and the native
 * SDK evaluates `includeFirstLoad` for each of them independently. The native SDK drops all
 * callbacks when the integration stops, so the bridge releases its wrappers at that point.
 */
@RunWith(RobolectricTestRunner::class)
internal class ExponeaModuleSegmentationTest {
    private lateinit var module: ExponeaModule
    private lateinit var context: ReactApplicationContext
    private lateinit var eventEmitter: DeviceEventManagerModule.RCTDeviceEventEmitter

    @Before
    fun before() {
        context = mockk()
        eventEmitter = mockk(relaxed = true)
        every { context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java) } returns eventEmitter
        mockkObject(Exponea)
        every { Exponea.registerSegmentationDataCallback(any()) } just Runs
        every { Exponea.unregisterSegmentationDataCallback(any()) } just Runs
        module = ExponeaModule(context)
    }

    @After
    fun after() {
        unmockkAll()
    }

    private fun registered(callbackId: String): ReactNativeSegmentationDataCallback =
        module.segmentationCallbacksById.getValue(callbackId)

    @Test
    fun `should register one native callback per JS registration even for the same category`() {
        module.onSegmentationCallbackSet("cb-1", "discovery", true)
        module.onSegmentationCallbackSet("cb-2", "discovery", false)
        module.onSegmentationCallbackSet("cb-3", "content", false)

        assertEquals(setOf("cb-1", "cb-2", "cb-3"), module.segmentationCallbacksById.keys)
        assertEquals("discovery", registered("cb-1").exposingCategory)
        assertTrue(registered("cb-1").includeFirstLoad)
        assertEquals("discovery", registered("cb-2").exposingCategory)
        assertFalse(registered("cb-2").includeFirstLoad)
        assertEquals("content", registered("cb-3").exposingCategory)
        verify(exactly = 1) { Exponea.registerSegmentationDataCallback(registered("cb-1")) }
        verify(exactly = 1) { Exponea.registerSegmentationDataCallback(registered("cb-2")) }
        verify(exactly = 1) { Exponea.registerSegmentationDataCallback(registered("cb-3")) }
        verify(exactly = 0) { Exponea.unregisterSegmentationDataCallback(any()) }
    }

    @Test
    fun `should replace native callback when the same id is registered again`() {
        module.onSegmentationCallbackSet("cb-1", "discovery", true)
        val first = registered("cb-1")
        module.onSegmentationCallbackSet("cb-1", "discovery", false)
        val second = registered("cb-1")

        assertEquals(1, module.segmentationCallbacksById.size)
        assertFalse(second.includeFirstLoad)
        verify(exactly = 1) { Exponea.unregisterSegmentationDataCallback(first) }
        verify(exactly = 1) { Exponea.registerSegmentationDataCallback(second) }
    }

    @Test
    fun `should remove only the requested registration`() {
        module.onSegmentationCallbackSet("cb-1", "discovery", true)
        module.onSegmentationCallbackSet("cb-2", "discovery", false)
        val first = registered("cb-1")

        module.onSegmentationCallbackRemove("cb-1")
        assertEquals(setOf("cb-2"), module.segmentationCallbacksById.keys)
        verify(exactly = 1) { Exponea.unregisterSegmentationDataCallback(first) }

        module.onSegmentationCallbackRemove("cb-1")
        module.onSegmentationCallbackRemove("unknown")
        assertEquals(setOf("cb-2"), module.segmentationCallbacksById.keys)
        verify(exactly = 1) { Exponea.unregisterSegmentationDataCallback(any()) }
    }

    @Test
    fun `should emit new segments addressed to the registration that produced them`() {
        module.onSegmentationCallbackSet("cb-1", "discovery", true)
        module.onSegmentationCallbackSet("cb-2", "discovery", false)
        val payload = slot<String>()

        registered("cb-1").onNewData(
            listOf(Segment(mapOf("id" to "segment-1", "segmentation_id" to "group-1")))
        )

        verify(exactly = 1) { eventEmitter.emit("newSegments", capture(payload)) }
        val json = JSONObject(payload.captured)
        assertEquals("cb-1", json.getString("callbackId"))
        assertEquals("discovery", json.getString("category"))
        val segments = json.getJSONArray("segments")
        assertEquals(1, segments.length())
        assertEquals("segment-1", segments.getJSONObject(0).getString("id"))
        assertEquals("group-1", segments.getJSONObject(0).getString("segmentation_id"))
    }

    @Test
    fun `should release bridge callbacks only when the native stop completes`() {
        every { Exponea.isInitialized } returns true
        val onStopped = slot<() -> Unit>()
        every { Exponea.stopIntegration(capture(onStopped)) } just Runs
        module.onSegmentationCallbackSet("cb-1", "discovery", true)
        module.onSegmentationCallbackSet("cb-2", "content", false)
        val first = registered("cb-1")
        val second = registered("cb-2")
        var resolved = false

        module.stopIntegration(MockResolvingPromise { resolved = true })

        // Native stop is still in flight: nothing is released yet.
        assertFalse(resolved)
        assertEquals(setOf("cb-1", "cb-2"), module.segmentationCallbacksById.keys)
        verify(exactly = 0) { Exponea.unregisterSegmentationDataCallback(any()) }

        onStopped.captured.invoke()

        assertTrue(resolved)
        assertTrue(module.segmentationCallbacksById.isEmpty())
        verify(exactly = 1) { Exponea.unregisterSegmentationDataCallback(first) }
        verify(exactly = 1) { Exponea.unregisterSegmentationDataCallback(second) }
    }

    @Test
    fun `should release registrations made while the stop is pending`() {
        every { Exponea.isInitialized } returns true
        val onStopped = slot<() -> Unit>()
        every { Exponea.stopIntegration(capture(onStopped)) } just Runs
        module.onSegmentationCallbackSet("cb-1", "discovery", true)
        module.stopIntegration(MockResolvingPromise {})

        module.onSegmentationCallbackSet("cb-2", "discovery", false)
        val late = registered("cb-2")
        verify(exactly = 1) { Exponea.registerSegmentationDataCallback(late) }

        onStopped.captured.invoke()

        assertTrue(module.segmentationCallbacksById.isEmpty())
        verify(exactly = 1) { Exponea.unregisterSegmentationDataCallback(late) }
        verify(exactly = 2) { Exponea.unregisterSegmentationDataCallback(any()) }
    }

    @Test
    fun `should allow registering callbacks again after stop`() {
        every { Exponea.isInitialized } returns true
        val onStopped = slot<() -> Unit>()
        every { Exponea.stopIntegration(capture(onStopped)) } just Runs
        module.onSegmentationCallbackSet("cb-1", "discovery", true)
        module.stopIntegration(MockResolvingPromise {})
        onStopped.captured.invoke()

        module.onSegmentationCallbackSet("cb-2", "discovery", true)

        assertEquals(setOf("cb-2"), module.segmentationCallbacksById.keys)
        verify(exactly = 1) { Exponea.registerSegmentationDataCallback(registered("cb-2")) }
    }

    @Test
    fun `should keep registrations when stop is rejected`() {
        every { Exponea.isInitialized } returns false
        module.onSegmentationCallbackSet("cb-1", "discovery", true)

        module.stopIntegration(MockRejectingPromise {
            assertEquals(MockPromise.PromiseStatus.rejected, it.status)
        })

        assertEquals(setOf("cb-1"), module.segmentationCallbacksById.keys)
        verify(exactly = 0) { Exponea.stopIntegration(any()) }
        verify(exactly = 0) { Exponea.unregisterSegmentationDataCallback(any()) }
    }
}
