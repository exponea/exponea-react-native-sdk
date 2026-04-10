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
        module.onInAppMessageCallbackRemove()
    }

    @Test
    fun `should notify listener when in app message is shown - nonrich`() {
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-shown.json").readText()
        )
        Exponea.inAppMessageActionCallback.inAppMessageShown(
            InAppMessageTestData.buildInAppMessage(),
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }

    @Test
    fun `should notify listener when in app message is clicked - nonrich`() {
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-click-minimal.json").readText()
        )
        Exponea.inAppMessageActionCallback.inAppMessageClickAction(
            InAppMessageTestData.buildInAppMessage(),
            InAppMessageTestData.buildInAppMessageButton(),
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }

    @Test
    fun `should notify listener when in app message is closed - nonrich`() {
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-close-complete.json").readText()
        )
        Exponea.inAppMessageActionCallback.inAppMessageCloseAction(
            InAppMessageTestData.buildInAppMessage(),
            InAppMessageTestData.buildInAppMessageButton(url = null),
            interaction = true,
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }

    @Test
    fun `should notify listener when in app message is closed without button - nonrich`() {
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-close-minimal.json").readText()
        )
        Exponea.inAppMessageActionCallback.inAppMessageCloseAction(
            InAppMessageTestData.buildInAppMessage(),
            button = null,
            interaction = false,  // Fixed: test data expects false
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }

    @Test
    fun `should notify listener when in app message process faced error - nonrich`() {
        val expectedErrorMessage = "Something goes wrong"
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-error-minimal.json").readText()
        )
        Exponea.inAppMessageActionCallback.inAppMessageError(
            message = null,
            errorMessage = expectedErrorMessage,
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }

    @Test
    fun `should notify listener when in app message faced error - nonrich`() {
        val expectedErrorMessage = "Something goes wrong"
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-error-complete.json").readText()
        )
        Exponea.inAppMessageActionCallback.inAppMessageError(
            message = InAppMessageTestData.buildInAppMessage(),
            errorMessage = expectedErrorMessage,
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }

    @Test
    fun `should notify listener when in app message is shown - richstyled`() {
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-shown-richstyle.json").readText()
        )
        Exponea.inAppMessageActionCallback.inAppMessageShown(
            InAppMessageTestData.buildInAppMessage(isRichstyle = true),
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }

    @Test
    fun `should notify listener when in app message is clicked - richstyled`() {
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-click-minimal-richstyle.json").readText()
        )
        Exponea.inAppMessageActionCallback.inAppMessageClickAction(
            InAppMessageTestData.buildInAppMessage(isRichstyle = true),
            InAppMessageTestData.buildInAppMessageButton(),
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }

    @Test
    fun `should notify listener when in app message is closed - richstyled`() {
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-close-complete-richstyle.json").readText()
        )
        Exponea.inAppMessageActionCallback.inAppMessageCloseAction(
            InAppMessageTestData.buildInAppMessage(isRichstyle = true),
            InAppMessageTestData.buildInAppMessageButton(url = null),
            interaction = true,
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }

    @Test
    fun `should notify listener when in app message is closed without button - richstyled`() {
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-close-minimal-richstyle.json").readText()
        )
        Exponea.inAppMessageActionCallback.inAppMessageCloseAction(
            InAppMessageTestData.buildInAppMessage(isRichstyle = true),
            button = null,
            interaction = false,  // Fixed: test data expects false
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }

    @Test
    fun `should notify listener when in app message faced error - richstyled`() {
        val expectedErrorMessage = "Something goes wrong"
        module.onInAppMessageCallbackSet(
            overrideDefaultBehavior = true,
            trackActions = false
        )
        val expectedInAppActionData = TestJsonParser.minify(
            File("../src/test_data/in-app-error-complete-richstyle.json").readText()
        )
        Exponea.inAppMessageActionCallback.inAppMessageError(
            message = InAppMessageTestData.buildInAppMessage(isRichstyle = true),
            errorMessage = expectedErrorMessage,
            ApplicationProvider.getApplicationContext()
        )
        verify { eventEmmiter.emit("inAppAction", expectedInAppActionData) }
    }
}
