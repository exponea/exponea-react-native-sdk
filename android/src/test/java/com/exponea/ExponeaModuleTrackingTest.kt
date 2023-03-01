package com.exponea

import androidx.test.core.app.ApplicationProvider
import com.exponea.sdk.Exponea
import com.exponea.sdk.models.CustomerIds
import com.exponea.sdk.models.PropertiesList
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.ReactApplicationContext
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import io.mockk.verify
import java.util.Date
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
        module.identifyCustomer(
            JavaOnlyMap.of("id", "value"),
            JavaOnlyMap.of("email", "a@b.c"),
            MockResolvingPromise {
                verify {
                    Exponea.identifyCustomer(
                        CustomerIds().withId("id", "value"),
                        PropertiesList(hashMapOf("email" to "a@b.c"))
                    )
                }
            }
        )
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
}
