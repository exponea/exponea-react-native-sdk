package com.exponea.widget

import com.exponea.sdk.models.InAppContentBlock
import com.exponea.sdk.models.InAppContentBlockAction
import com.exponea.sdk.models.InAppContentBlockActionType
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.facebook.react.uimanager.events.EventDispatcher
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.hamcrest.CoreMatchers.containsString
import org.hamcrest.CoreMatchers.equalTo
import org.hamcrest.MatcherAssert.assertThat
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
internal class InAppContentBlocksPlaceholderManagerTest {

    private lateinit var manager: InAppContentBlocksPlaceholderManager
    private lateinit var mockContext: ThemedReactContext
    private val capturedEvents = mutableListOf<Event<*>>()

    private val testContentBlock = InAppContentBlock(
        id = "block-123",
        name = "Test Block",
        dateFilter = null,
        rawFrequency = "always",
        priority = 1,
        consentCategoryTracking = null,
        rawContentType = "html",
        content = null,
        placeholders = listOf("example_top")
    )

    private val testAction = InAppContentBlockAction(
        type = InAppContentBlockActionType.DEEPLINK,
        name = "DL (flush)",
        url = "exponea://flush"
    )

    @Before
    fun before() {
        mockkStatic(Arguments::class)
        every { Arguments.createMap() } answers { JavaOnlyMap() }

        mockkStatic(UIManagerHelper::class)
        val mockDispatcher = mockk<EventDispatcher>(relaxed = true)
        every { UIManagerHelper.getEventDispatcher(any()) } returns mockDispatcher
        every { UIManagerHelper.getSurfaceId(any<ThemedReactContext>()) } returns 0
        every { mockDispatcher.dispatchEvent(any()) } answers { capturedEvents.add(firstArg<Event<*>>()) }

        mockContext = mockk(relaxed = true)
        manager = InAppContentBlocksPlaceholderManager()
    }

    @After
    fun after() {
        capturedEvents.clear()
        unmockkAll()
    }

    @Test
    fun `ACTION_CLICKED event should contain correct eventType`() {
        val eventData = dispatchEvent("ACTION_CLICKED", testContentBlock, testAction)
        assertThat(eventData.getString("eventType"), equalTo("ACTION_CLICKED"))
    }

    @Test
    fun `ACTION_CLICKED event should contain correct placeholderId`() {
        val eventData = dispatchEvent("ACTION_CLICKED", testContentBlock, testAction)
        assertThat(eventData.getString("placeholderId"), equalTo("example_top"))
    }

    @Test
    fun `ACTION_CLICKED event should contain serialized contentBlock`() {
        val eventData = dispatchEvent("ACTION_CLICKED", testContentBlock, testAction)
        val contentBlockJson = eventData.getString("contentBlock")!!
        assertThat(contentBlockJson, containsString("block-123"))
        assertThat(contentBlockJson, containsString("Test Block"))
    }

    @Test
    fun `ACTION_CLICKED event should contain serialized action under contentBlockAction key`() {
        val eventData = dispatchEvent("ACTION_CLICKED", testContentBlock, testAction)
        val actionJson = eventData.getString("contentBlockAction")!!
        assertThat(actionJson, containsString("DEEPLINK"))
        assertThat(actionJson, containsString("exponea://flush"))
        assertThat(actionJson, containsString("DL (flush)"))
    }

    @Test
    fun `SHOWN event should contain correct eventType and placeholderId`() {
        val eventData = dispatchEvent("SHOWN", testContentBlock, null)
        assertThat(eventData.getString("eventType"), equalTo("SHOWN"))
        assertThat(eventData.getString("placeholderId"), equalTo("example_top"))
    }

    @Test
    fun `ERROR event should contain errorMessage`() {
        val eventData = dispatchEvent("ERROR", testContentBlock, null, errorMessage = "Something went wrong")
        assertThat(eventData.getString("eventType"), equalTo("ERROR"))
        assertThat(eventData.getString("errorMessage"), equalTo("Something went wrong"))
    }

    private fun dispatchEvent(
        eventType: String,
        contentBlock: InAppContentBlock?,
        action: InAppContentBlockAction?,
        errorMessage: String? = null
    ): WritableMap {
        val container = createViewInstance()
        triggerEventListener(container, eventType, contentBlock, action, errorMessage)
        assertThat("Event should be dispatched", capturedEvents.isNotEmpty(), equalTo(true))
        return getEventData(capturedEvents.last())
    }

    private fun createViewInstance(): InAppContentBlocksPlaceholder {
        val method = InAppContentBlocksPlaceholderManager::class.java
            .getDeclaredMethod("createViewInstance", ThemedReactContext::class.java)
        method.isAccessible = true
        return method.invoke(manager, mockContext) as InAppContentBlocksPlaceholder
    }

    private fun getEventData(event: Event<*>): WritableMap {
        val method = Event::class.java.getDeclaredMethod("getEventData")
        method.isAccessible = true
        return method.invoke(event) as WritableMap
    }

    private fun triggerEventListener(
        container: InAppContentBlocksPlaceholder,
        eventType: String,
        contentBlock: InAppContentBlock?,
        action: InAppContentBlockAction?,
        errorMessage: String?
    ) {
        val field = InAppContentBlocksPlaceholder::class.java
            .getDeclaredField("inAppContentBlockEventListener")
        field.isAccessible = true
        @Suppress("UNCHECKED_CAST")
        val listener = field.get(container)
            as? ((String, String, InAppContentBlock?, InAppContentBlockAction?, String?) -> Unit)
        checkNotNull(listener) { "Event listener was not set by createViewInstance" }
        listener.invoke(eventType, "example_top", contentBlock, action, errorMessage)
    }
}
