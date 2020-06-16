package com.exponea

import androidx.test.core.app.ApplicationProvider
import com.exponea.sdk.Exponea
import com.exponea.sdk.models.ExponeaConfiguration
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.ReactApplicationContext
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.verify
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
}
