package com.exponea

import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.os.Bundle
import androidx.test.core.app.ApplicationProvider
import com.exponea.sdk.Exponea
import com.exponea.sdk.models.ExponeaConfiguration
import com.exponea.sdk.models.FlushMode
import com.exponea.sdk.util.Logger
import com.facebook.react.bridge.BridgeReactContext
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.ReadableMap
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import io.mockk.verify
import java.io.File
import kotlin.test.assertNotNull
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(manifest = Config.DEFAULT_MANIFEST_NAME)
internal class ExponeaModuleTest {
    lateinit var module: ExponeaModule

    @Before
    fun before() {
        mockkObject(Exponea)
        module = ExponeaModule(BridgeReactContext(ApplicationProvider.getApplicationContext()))

        // we need to create dummy package with meta data for android sdk telemetry
        val packageManager = module.reactContext.packageManager
        val shadowPackageManager = shadowOf(packageManager)
        val packageInfo = PackageInfo()
        packageInfo.packageName = "org.robolectric.default"
        packageInfo.applicationInfo = ApplicationInfo().apply {
            metaData = Bundle()
        }
        shadowPackageManager.installPackage(packageInfo)
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
        module.checkPushSetup(MockResolvingPromise { assertTrue(Exponea.checkPushSetup) })
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
    fun `should get default properties`() {
        every { Exponea.defaultProperties } returns hashMapOf()
        module.getDefaultProperties(MockResolvingPromise { assertEquals("{}", it.result) })
        every { Exponea.defaultProperties } returns hashMapOf("key" to "value", "number" to 123)
        module.getDefaultProperties(MockResolvingPromise {
            assertEquals("{\"number\":123,\"key\":\"value\"}", it.result)
        })
    }

    @Test
    fun `should set default properties`() {
        Exponea.init(ApplicationProvider.getApplicationContext(), ExponeaConfiguration(
            projectToken = "mockToken"
        ))
        module.setDefaultProperties(
            JavaOnlyMap.of(),
            MockResolvingPromise { assertEquals(hashMapOf<String, Any>(), Exponea.defaultProperties) }
        )
        module.setDefaultProperties(
            JavaOnlyMap.of("key", "value", "number", 123),
            MockResolvingPromise {
                assertEquals(hashMapOf("key" to "value", "number" to 123.0), Exponea.defaultProperties)
            }
        )
    }

    @Test
    fun `should register segmentation callback`() {
        val exposingCategory = "discovery"
        val includeFirstLoad = false
        module.registerSegmentationDataCallback(exposingCategory, includeFirstLoad, MockResolvingPromise {
            assertNotNull(it.result)
            assertTrue(it.result is String)
            assertTrue((it.result as String).isNotBlank())
        })
        assertEquals(1, module.segmentationDataCallbacks.size)
        assertEquals(exposingCategory, module.segmentationDataCallbacks[0].exposingCategory)
        assertEquals(includeFirstLoad, module.segmentationDataCallbacks[0].includeFirstLoad)
    }

    @Test
    fun `should unregister segmentation callback successfully`() {
        val exposingCategory = "discovery"
        val includeFirstLoad = false
        var callbackInstanceId: String? = null
        module.registerSegmentationDataCallback(exposingCategory, includeFirstLoad, MockResolvingPromise {
            callbackInstanceId = it.result as String
        })
        assertNotNull(callbackInstanceId)
        module.unregisterSegmentationDataCallback(callbackInstanceId!!, MockResolvingPromise {
            assertEquals(MockPromise.PromiseStatus.fulfilled, it.status)
        })
    }

    @Test
    fun `should failed while unregistering of non-existing segmentation callback`() {
        module.unregisterSegmentationDataCallback("non-existing-id", MockRejectingPromise {
            assertEquals(MockPromise.PromiseStatus.rejected, it.status)
        })
    }

    @Test
    fun `should call segments getter with force`() {
        val data = TestJsonParser.parse(File("../src/test_data/get-segments-forced.json").readText())
        module.getSegments(data as ReadableMap, MockResolvingPromise {})
        verify {
            Exponea.getSegments("discovery", true, any())
        }
    }

    @Test
    fun `should call segments getter without force`() {
        val data = TestJsonParser.parse(File("../src/test_data/get-segments-nonforced.json").readText())
        module.getSegments(data as ReadableMap, MockResolvingPromise {})
        verify {
            Exponea.getSegments("discovery", false, any())
        }
    }

    @Test
    fun `should call segments getter without force param`() {
        val data = TestJsonParser.parse(File("../src/test_data/get-segments-minimal.json").readText())
        module.getSegments(data as ReadableMap, MockResolvingPromise {})
        verify {
            Exponea.getSegments("discovery", false, any())
        }
    }
}
