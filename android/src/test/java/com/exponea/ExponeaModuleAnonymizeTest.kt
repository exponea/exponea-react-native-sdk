package com.exponea

import androidx.test.core.app.ApplicationProvider
import com.exponea.sdk.Exponea
import com.exponea.sdk.models.EventType
import com.exponea.sdk.models.ExponeaConfiguration
import com.exponea.sdk.models.ExponeaConfigurationOverrides
import com.exponea.sdk.models.IntegrationConfig
import com.exponea.sdk.models.ProjectConfig
import com.exponea.sdk.models.StreamConfig
import com.facebook.react.bridge.BridgeReactContext
import com.facebook.react.bridge.JavaOnlyArray
import com.facebook.react.bridge.JavaOnlyMap
import io.mockk.CapturingSlot
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.slot
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
        module = ExponeaModule(BridgeReactContext(ApplicationProvider.getApplicationContext()))
    }

    @After
    fun after() {
        unmockkAll()
    }

    private fun mockAnonymizeWithCompletion(
        integrationSlot: CapturingSlot<IntegrationConfig?>? = null,
        overridesSlot: CapturingSlot<ExponeaConfigurationOverrides?>? = null
    ) {
        every {
            Exponea.anonymize(
                integrationConfig = if (integrationSlot != null) captureNullable(integrationSlot) else any(),
                exponeaConfigurationOverrides = if (overridesSlot != null) captureNullable(overridesSlot) else any(),
                onAnonymized = any()
            )
        } answers {
            (thirdArg<() -> Unit>()).invoke()
        }
    }

    @Test
    fun `anonymize should run even when Exponea SDK is not initialized`() {
        every { Exponea.isInitialized } returns false
        mockAnonymizeWithCompletion()
        module.anonymize(JavaOnlyMap.of(), JavaOnlyMap.of(), MockResolvingPromise {
            verify { Exponea.anonymize(integrationConfig = null, exponeaConfigurationOverrides = null, onAnonymized = any()) }
        })
    }

    @Test
    fun `anonymize should resolve and anonymize with empty parameters`() {
        every { Exponea.isInitialized } returns true
        mockAnonymizeWithCompletion()
        module.anonymize(JavaOnlyMap.of(), JavaOnlyMap.of(), MockResolvingPromise {
            verify { Exponea.anonymize(integrationConfig = null, exponeaConfigurationOverrides = null, onAnonymized = any()) }
        })
    }

    @Test
    fun `anonymize should reject when integrationConfig has neither streamId nor projectToken`() {
        every { Exponea.isInitialized } returns true
        mockAnonymizeWithCompletion()
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
        val integrationSlot = slot<IntegrationConfig?>()
        val overridesSlot = slot<ExponeaConfigurationOverrides?>()
        mockAnonymizeWithCompletion(integrationSlot, overridesSlot)
        module.anonymize(
            JavaOnlyMap.of(
                "projectToken", "new project token",
                "authorizationToken", "new authorization token"
            ),
            JavaOnlyMap.of(),
            MockResolvingPromise {
                val project = integrationSlot.captured as ProjectConfig
                assertEquals("https://api.exponea.com", project.baseUrl)
                assertEquals("new project token", project.projectToken)
                assertEquals("Token new authorization token", project.authorization)
                assertEquals(null, overridesSlot.captured)
            }
        )
    }

    @Test
    fun `anonymize should resolve and anonymize with new stream`() {
        every { Exponea.isInitialized } returns true
        val integrationSlot = slot<IntegrationConfig?>()
        mockAnonymizeWithCompletion(integrationSlot)
        module.anonymize(
            JavaOnlyMap.of(
                "streamId", "stream-1234",
                "baseUrl", "https://stream.example.com"
            ),
            JavaOnlyMap.of(),
            MockResolvingPromise {
                val stream = integrationSlot.captured as StreamConfig
                assertEquals("stream-1234", stream.streamId)
                assertEquals("https://stream.example.com", stream.baseUrl)
            }
        )
    }

    @Test
    fun `anonymize should reject with invalid new mapping`() {
        every { Exponea.isInitialized } returns true
        mockAnonymizeWithCompletion()
        module.anonymize(
            JavaOnlyMap.of(),
            JavaOnlyMap.of(
                "NON_EXISTING_EVENT_TYPE",
                JavaOnlyArray.of()
            ),
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaDataException::class, it.errorThrowable!!::class)
                assertEquals(
                    "Invalid event type 'NON_EXISTING_EVENT_TYPE' found in project configuration",
                    it.errorThrowable?.message
                )
            }
        )
    }

    @Test
    fun `anonymize should not inherit integrationConfig baseUrl in route map entries`() {
        every { Exponea.isInitialized } returns true
        val integrationSlot = slot<IntegrationConfig?>()
        val overridesSlot = slot<ExponeaConfigurationOverrides?>()
        mockAnonymizeWithCompletion(integrationSlot, overridesSlot)
        module.anonymize(
            JavaOnlyMap.of(
                "projectToken", "new project token",
                "authorizationToken", "new authorization token",
                "baseUrl", "https://project.example.com"
            ),
            JavaOnlyMap.of(
                "INSTALL",
                JavaOnlyArray.of(
                    JavaOnlyMap.of(
                        "projectToken", "install project token",
                        "authorizationToken", "install authorization token"
                    )
                )
            ),
            MockResolvingPromise {
                val installProjects = overridesSlot.captured?.integrationRouteMap?.get(EventType.INSTALL)
                assertEquals(1, installProjects?.size)
                // default base url
                assertEquals("https://api.exponea.com", installProjects?.get(0)?.baseUrl)
            }
        )
    }

    @Test
    fun `anonymize should resolve and anonymize with both parameters`() {
        every { Exponea.isInitialized } returns true
        val integrationSlot = slot<IntegrationConfig?>()
        val overridesSlot = slot<ExponeaConfigurationOverrides?>()
        mockAnonymizeWithCompletion(integrationSlot, overridesSlot)
        module.anonymize(
            JavaOnlyMap.of(
                "projectToken", "new project token",
                "authorizationToken", "new authorization token",
                "baseUrl", "https://something.com"
            ),
            JavaOnlyMap.of(
                "INSTALL",
                JavaOnlyArray.of(
                    JavaOnlyMap.of(
                        "projectToken", "install project token",
                        "authorizationToken", "install authorization token",
                        "baseUrl", "https://install.something.com"
                    )
                )
            ),
            MockResolvingPromise {
                val project = integrationSlot.captured as ProjectConfig
                assertEquals("https://something.com", project.baseUrl)
                assertEquals("new project token", project.projectToken)
                assertEquals("Token new authorization token", project.authorization)
                val installProjects = overridesSlot.captured?.integrationRouteMap?.get(EventType.INSTALL)
                assertEquals(1, installProjects?.size)
                assertEquals("https://install.something.com", installProjects?.get(0)?.baseUrl)
                assertEquals("install project token", installProjects?.get(0)?.projectToken)
                assertEquals("Token install authorization token", installProjects?.get(0)?.authorization)
            }
        )
    }
}
