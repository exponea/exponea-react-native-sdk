package com.exponea

import androidx.test.core.app.ApplicationProvider
import com.exponea.sdk.Exponea
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.mockk.every
import io.mockk.mockk
import io.mockk.spyk
import io.mockk.unmockkAll
import io.mockk.verify
import java.io.File
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
internal class ExponeaModuleInAppCallbackTest {
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
        module.resetInAppCallbackToDefault()
    }

    @Test
    fun `should notify listener when in app message is shown`() {
        ExponeaModule.pendingInAppAction = InAppMessageAction(
            message = InAppMessageTestData.buildInAppMessage(),
            type = InAppMessageActionType.SHOW
        )
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false,
            MockResolvingPromise {}
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-shown.json").readText()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
        Exponea.inAppMessageActionCallback.inAppMessageShown(
            InAppMessageTestData.buildInAppMessage(),
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }

    @Test
    fun `should notify listener when in app message is clicked`() {
        ExponeaModule.pendingInAppAction = InAppMessageAction(
            message = InAppMessageTestData.buildInAppMessage(),
            button = InAppMessageTestData.buildInAppMessageButton(),
            type = InAppMessageActionType.ACTION
        )
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false,
            MockResolvingPromise {}
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-click-minimal.json").readText()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
        Exponea.inAppMessageActionCallback.inAppMessageClickAction(
            InAppMessageTestData.buildInAppMessage(),
            InAppMessageTestData.buildInAppMessageButton(),
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }

    @Test
    fun `should notify listener when in app message is closed`() {
        ExponeaModule.pendingInAppAction = InAppMessageAction(
            message = InAppMessageTestData.buildInAppMessage(),
            button = InAppMessageTestData.buildInAppMessageButton(url = null),
            interaction = true,
            type = InAppMessageActionType.CLOSE
        )
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false,
            MockResolvingPromise {}
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-close-complete.json").readText()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
        Exponea.inAppMessageActionCallback.inAppMessageCloseAction(
            InAppMessageTestData.buildInAppMessage(),
            InAppMessageTestData.buildInAppMessageButton(url = null),
            interaction = true,
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }

    @Test
    fun `should notify listener when in app message is closed without button`() {
        ExponeaModule.pendingInAppAction = InAppMessageAction(
            message = InAppMessageTestData.buildInAppMessage(),
            button = null,
            interaction = false,
            type = InAppMessageActionType.CLOSE
        )
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false,
            MockResolvingPromise {}
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-close-minimal.json").readText()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
        Exponea.inAppMessageActionCallback.inAppMessageCloseAction(
            InAppMessageTestData.buildInAppMessage(),
            button = null,
            interaction = true,
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }

    @Test
    fun `should notify listener when in app message process faced error`() {
        val expectedErrorMessage = "Something goes wrong"
        ExponeaModule.pendingInAppAction = InAppMessageAction(
            errorMessage = expectedErrorMessage,
            type = InAppMessageActionType.ERROR
        )
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false,
            MockResolvingPromise {}
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-error-minimal.json").readText()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
        Exponea.inAppMessageActionCallback.inAppMessageError(
            message = null,
            errorMessage = expectedErrorMessage,
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }

    @Test
    fun `should notify listener when in app message faced error`() {
        val expectedErrorMessage = "Something goes wrong"
        ExponeaModule.pendingInAppAction = InAppMessageAction(
            message = InAppMessageTestData.buildInAppMessage(),
            errorMessage = expectedErrorMessage,
            type = InAppMessageActionType.ERROR
        )
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false,
            MockResolvingPromise {}
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-error-complete.json").readText()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
        Exponea.inAppMessageActionCallback.inAppMessageError(
            message = InAppMessageTestData.buildInAppMessage(),
            errorMessage = expectedErrorMessage,
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }
}
