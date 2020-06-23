package com.exponea

import androidx.test.core.app.ApplicationProvider
import com.exponea.sdk.Exponea
import com.exponea.sdk.models.EventType
import com.exponea.sdk.models.ExponeaConfiguration
import com.exponea.sdk.models.ExponeaProject
import com.facebook.react.bridge.JavaOnlyArray
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.ReactApplicationContext
import io.mockk.Runs
import io.mockk.every
import io.mockk.just
import io.mockk.mockkObject
import io.mockk.unmockkAll
import io.mockk.verify
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
internal class ExponeaModuleAnonymizeTest {
    lateinit var module: ExponeaModule

    @Before
    fun before() {
        mockkObject(Exponea, recordPrivateCalls = true)
        val field = Exponea::class.java.getDeclaredField("configuration")
        field.isAccessible = true
        field.set(Exponea, ExponeaConfiguration())
        module = ExponeaModule(ReactApplicationContext(ApplicationProvider.getApplicationContext()))
    }

    @After
    fun after() {
        unmockkAll()
    }

    @Test
    fun `anonymize should reject when Exponea SDK is not configured`() {
        every { Exponea.isInitialized } returns false
        module.anonymize(JavaOnlyMap.of(), JavaOnlyMap.of(), MockRejectingPromise {
            assertEquals(ExponeaModule.ExponeaNotInitializedException::class, it.errorThrowable!!::class)
        })
    }

    @Test
    fun `anonymize should resolve and anonymize with empty parameters`() {
        every { Exponea.isInitialized } returns true
        every { Exponea.anonymize() } just Runs
        module.anonymize(JavaOnlyMap.of(), JavaOnlyMap.of(), MockResolvingPromise {
            verify { Exponea.anonymize() }
        })
    }

    @Test
    fun `anonymize should reject with invalid new project`() {
        every { Exponea.isInitialized } returns true
        every { Exponea.anonymize() } just Runs
        module.anonymize(
            JavaOnlyMap.of(
                "exponeaProject",
                JavaOnlyMap.of()
            ),
            JavaOnlyMap.of(),
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaDataException::class, it.errorThrowable!!::class)
                assertEquals("Property 'projectToken' cannot be null.", it.errorThrowable?.message)
            }
        )
    }

    @Test
    fun `anonymize should resolve and anonymize with new project`() {
        every { Exponea.isInitialized } returns true
        every { Exponea.anonymize() } just Runs
        module.anonymize(
            JavaOnlyMap.of(
                "exponeaProject",
                JavaOnlyMap.of(
                    "projectToken", "new project token",
                    "authorizationToken", "new authorization token"
                )
            ),
            JavaOnlyMap.of(),
            MockResolvingPromise {
                verify {
                    Exponea.anonymize(
                        ExponeaProject("https://api.exponea.com", "new project token", "Token new authorization token")
                    )
                }
            }
        )
    }

    @Test
    fun `anonymize should reject with invalid new mapping`() {
        every { Exponea.isInitialized } returns true
        every { Exponea.anonymize() } just Runs
        module.anonymize(
            JavaOnlyMap.of(),
            JavaOnlyMap.of(
                "projectMapping",
                JavaOnlyMap.of(
                    "NON_EXISTING_EVENT_TYPE",
                    JavaOnlyArray.of()
                )
            ),
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaDataException::class, it.errorThrowable!!::class)
                assertEquals(
                    "Invalid event type NON_EXISTING_EVENT_TYPE found in project configuration",
                    it.errorThrowable?.message
                )
            }
        )
    }

    @Test
    fun `anonymize should resolve and anonymize with both parameters`() {
        every { Exponea.isInitialized } returns true
        every { Exponea.anonymize() } just Runs
        module.anonymize(
            JavaOnlyMap.of(
                "exponeaProject",
                JavaOnlyMap.of(
                    "projectToken", "new project token",
                    "authorizationToken", "new authorization token",
                    "baseUrl", "https://something.com"
                )
            ),
            JavaOnlyMap.of(
                "projectMapping",
                JavaOnlyMap.of(
                    "INSTALL",
                    JavaOnlyArray.of(
                        JavaOnlyMap.of(
                            "projectToken", "install project token",
                            "authorizationToken", "install authorization token",
                            "baseUrl", "https://install.something.com"
                        )
                    )
                )
            ),
            MockResolvingPromise {
                verify {
                    Exponea.anonymize(
                        ExponeaProject("https://something.com", "new project token", "Token new authorization token"),
                        hashMapOf(
                            EventType.INSTALL to arrayListOf(
                                ExponeaProject(
                                    "https://install.something.com",
                                    "install project token",
                                    "Token install authorization token"
                                )
                            )
                        )
                    )
                }
            }
        )
    }
}
