package com.exponea

import androidx.test.core.app.ApplicationProvider
import com.exponea.sdk.Exponea
import com.exponea.sdk.models.CustomerIds
import com.exponea.sdk.models.ExponeaConfiguration
import com.exponea.sdk.models.FlushMode
import com.exponea.sdk.models.PropertiesList
import com.exponea.sdk.util.Logger
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
internal class ExponeaModuleTest {
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
    fun `should return correct module name`() {
        assertEquals("Exponea", module.name)
    }

    @Test
    fun `should initialize Exponea SDK`() {
        module.configure(
            JavaOnlyMap.of("projectToken", "mock", "authorizationToken", "mock"),
            MockResolvingPromise { }
        )
        verify { Exponea.init(any(), ExponeaConfiguration(projectToken = "mock", authorization = "Token mock")) }
    }

    @Test
    fun `should fail to initialize Exponea SDK without required properties`() {
        module.configure(
            JavaOnlyMap.of(),
            MockRejectingPromise {
                assertEquals(
                    "Required property 'projectToken' missing in configuration object",
                    it.errorThrowable?.localizedMessage
                )
            }
        )
    }

    @Test
    fun `should resolve Exponea SDK configuration status`() {
        every { Exponea.isInitialized } returns true
        module.isConfigured(MockResolvingPromise { assertEquals(true, it.result) })
        every { Exponea.isInitialized } returns false
        module.isConfigured(MockResolvingPromise { assertEquals(false, it.result) })
    }

    @Test
    fun `should get customer cookie from Exponea SDK`() {
        every { Exponea.isInitialized } returns false
        module.getCustomerCookie(
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaNotInitializedException::class, it.errorThrowable!!::class)
            }
        )
        every { Exponea.isInitialized } returns true
        every { Exponea.customerCookie } returns "mock-customer-cookie"
        module.getCustomerCookie(
            MockResolvingPromise { assertEquals("mock-customer-cookie", it.result) }
        )
    }

    @Test
    fun `should enable push self-check`() {
        // TODO not available until Android SDK is updated in EXRN-32
        // module.checkPushSetup(MockResolvingPromise { assertTrue(Exponea.checkPushSetup) })
    }

    @Test
    fun `should get flush mode`() {
        module.getFlushMode(MockResolvingPromise { assertEquals(Exponea.flushMode.name, it.result) })
    }

    @Test
    fun `should set flush mode`() {
        module.setFlushMode("PERIOD", MockResolvingPromise { assertEquals(FlushMode.PERIOD, Exponea.flushMode) })
    }

    @Test
    fun `should get flush period`() {
        module.getFlushPeriod(MockResolvingPromise { assertEquals(Exponea.flushPeriod.amount.toDouble(), it.result) })
    }

    @Test
    fun `should set flush period`() {
        module.setFlushPeriod(123.0, MockResolvingPromise { assertEquals(123, Exponea.flushPeriod.amount) })
    }

    @Test
    fun `should get logger level`() {
        module.getLogLevel(MockResolvingPromise { assertEquals(Exponea.loggerLevel.name, it.result) })
    }

    @Test
    fun `should set logger level`() {
        module.setLogLevel("OFF", MockResolvingPromise { assertEquals(Logger.Level.OFF, Exponea.loggerLevel) })
    }

    @Test
    fun `should identify customer`() {
        every { Exponea.isInitialized } returns false
        module.identifyCustomer(
            JavaOnlyMap.of("id", "value"),
            JavaOnlyMap.of("email", "a@b.c"),
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaNotInitializedException::class, it.errorThrowable!!::class)
            }
        )
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
    fun `should flush data`() {
        every { Exponea.isInitialized } returns false
        module.flushData(
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaNotInitializedException::class, it.errorThrowable!!::class)
            }
        )
        every { Exponea.isInitialized } returns true
        module.flushData(
            MockResolvingPromise {
                verify { Exponea.flushData(any()) }
            }
        )
    }

    @Test
    fun `should track event`() {
        every { Exponea.isInitialized } returns false
        module.trackEvent(
            "event_name",
            JavaOnlyMap.of("string", "asd", "number", 123, "boolean", false),
            JavaOnlyMap.of(),
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaNotInitializedException::class, it.errorThrowable!!::class)
            }
        )
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
    fun `should track session start`() {
        every { Exponea.isInitialized } returns false
        module.trackSessionStart(
            JavaOnlyMap.of(),
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaNotInitializedException::class, it.errorThrowable!!::class)
            }
        )
        every { Exponea.isInitialized } returns true
        module.trackSessionStart(
            JavaOnlyMap.of(),
            MockResolvingPromise {
                verify { Exponea.trackSessionStart(range(Date().time / 1000.0 - 1, Date().time / 1000.0 + 1)) }
            }
        )
        module.trackSessionStart(
            JavaOnlyMap.of("timestamp", null),
            MockResolvingPromise {
                verify { Exponea.trackSessionStart(range(Date().time / 1000.0 - 1, Date().time / 1000.0 + 1)) }
            }
        )
        module.trackSessionStart(
            JavaOnlyMap.of("timestamp", 123),
            MockResolvingPromise {
                verify { Exponea.trackSessionStart(123.0) }
            }
        )
    }

    @Test
    fun `should track session end`() {
        every { Exponea.isInitialized } returns false
        module.trackSessionEnd(
            JavaOnlyMap.of(),
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaNotInitializedException::class, it.errorThrowable!!::class)
            }
        )
        every { Exponea.isInitialized } returns true
        module.trackSessionEnd(
            JavaOnlyMap.of(),
            MockResolvingPromise {
                verify { Exponea.trackSessionEnd(range(Date().time / 1000.0 - 1, Date().time / 1000.0 + 1)) }
            }
        )
        module.trackSessionEnd(
            JavaOnlyMap.of("timestamp", null),
            MockResolvingPromise {
                verify { Exponea.trackSessionEnd(range(Date().time / 1000.0 - 1, Date().time / 1000.0 + 1)) }
            }
        )
        module.trackSessionEnd(
            JavaOnlyMap.of("timestamp", 123),
            MockResolvingPromise {
                verify { Exponea.trackSessionEnd(123.0) }
            }
        )
    }
}
