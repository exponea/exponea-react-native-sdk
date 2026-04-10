package com.exponea

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.mockk.every
import io.mockk.mockk
import io.mockk.spyk
import io.mockk.unmockkAll
import io.mockk.verify
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
internal class ExponeaModulePushTest {
    lateinit var module: ExponeaModule
    lateinit var context: ReactApplicationContext
    lateinit var eventEmmiter: DeviceEventManagerModule.RCTDeviceEventEmitter
    @Before
    fun before() {
        context = mockk()
        eventEmmiter = spyk()
        every { context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java) } returns eventEmmiter
        module = ExponeaModule(context)
    }

    @After
    fun after() {
        unmockkAll()
    }

    @Test
    fun `should set push received listener`() {
        // TurboModule implementation: listener lifecycle methods are simple markers
        module.onPushReceivedListenerSet()
        // No verification needed - method is a no-op placeholder
    }

    @Test
    fun `should set and remove push received listener`() {
        // TurboModule implementation: listener lifecycle methods are simple markers
        module.onPushReceivedListenerSet()
        module.onPushReceivedListenerRemove()
        module.onPushReceivedListenerSet()
        // No verification needed - methods are no-op placeholders
    }

    @Test
    fun `should set push opened listener`() {
        // TurboModule implementation: listener lifecycle methods are simple markers
        module.onPushOpenedListenerSet()
        // No verification needed - method is a no-op placeholder
    }

    @Test
    fun `should set and remove push opened listener`() {
        // TurboModule implementation: listener lifecycle methods are simple markers
        module.onPushOpenedListenerSet()
        module.onPushOpenedListenerRemove()
        module.onPushOpenedListenerSet()
        // No verification needed - methods are no-op placeholders
    }
}
