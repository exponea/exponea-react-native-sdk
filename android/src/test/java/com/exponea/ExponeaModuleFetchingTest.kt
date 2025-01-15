package com.exponea

import androidx.test.core.app.ApplicationProvider
import com.exponea.sdk.Exponea
import com.exponea.sdk.models.Consent
import com.exponea.sdk.models.ConsentSources
import com.exponea.sdk.models.CustomerRecommendation
import com.exponea.sdk.models.CustomerRecommendationOptions
import com.exponea.sdk.models.FetchError
import com.exponea.sdk.models.Result
import com.facebook.react.bridge.BridgeReactContext
import com.facebook.react.bridge.JavaOnlyArray
import com.facebook.react.bridge.JavaOnlyMap
import com.google.gson.Gson
import com.google.gson.JsonPrimitive
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.slot
import io.mockk.unmockkAll
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
internal class ExponeaModuleFetchingTest {
    lateinit var module: ExponeaModule

    @Before
    fun before() {
        mockkObject(Exponea)
        module = ExponeaModule(BridgeReactContext(ApplicationProvider.getApplicationContext()))
    }

    @After
    fun after() {
        unmockkAll()
    }

    @Test
    fun `fetch consents should reject when Exponea not initialized`() {
        every { Exponea.isInitialized } returns false
        module.fetchConsents(
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaNotInitializedException::class, it.errorThrowable!!::class)
            }
        )
    }
    @Test
    fun `fetch consents should reject on fetch error`() {
        every { Exponea.isInitialized } returns true
        every { Exponea.getConsents(any(), any()) } answers {
            secondArg<(Result<FetchError>) -> Unit>().invoke(Result(false, FetchError("{}", "mock error")))
        }
        module.fetchConsents(
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaFetchException::class, it.errorThrowable!!::class)
                assertEquals("mock error", it.errorThrowable!!.message)
            }
        )
    }
    @Test
    fun `fetch consents should resolve with response from server`() {
        every { Exponea.isInitialized } returns true
        every { Exponea.getConsents(any(), any()) } answers {
            firstArg<(Result<ArrayList<Consent>>) -> Unit>().invoke(Result(true, arrayListOf(
                Consent(
                    "mock-id",
                    true,
                    ConsentSources(
                        createdFromCRM = true,
                        imported = false,
                        fromConsentPage = true,
                        privateAPI = false,
                        publicAPI = true,
                        trackedFromScenario = false
                    ),
                    hashMapOf(
                        "it" to hashMapOf("Antonio" to "Margheriti"),
                        "de" to hashMapOf("Hugo" to "Stiglitz")
                    )
                )
            )))
        }
        val expectedResponse = """
        [
            {
                "sources":{
                    "imported":false,
                    "privateAPI":false,
                    "publicAPI":true,
                    "createdFromCRM":true,
                    "trackedFromScenario":false
                },
                "translations":{"de":{"Hugo":"Stiglitz"},"it":{"Antonio":"Margheriti"}},
                "legitimateInterest":true,
                "id":"mock-id"
            }
        ]"""
        module.fetchConsents(
            MockResolvingPromise {
                assertEquals(
                    Gson().fromJson(expectedResponse, Object::class.java),
                    Gson().fromJson(it.result as String, Object::class.java)
                )
            }
        )
    }

    @Test
    fun `fetch recommendations should reject when Exponea is not initialized`() {
        every { Exponea.isInitialized } returns false
        module.fetchRecommendations(
            JavaOnlyMap.of(),
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaNotInitializedException::class, it.errorThrowable!!::class)
            }
        )
    }

    @Test
    fun `fetch recommendations should reject without required fields`() {
        every { Exponea.isInitialized } returns true
        module.fetchRecommendations(
            JavaOnlyMap.of(),
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaDataException::class, it.errorThrowable!!::class)
                assertEquals("Property 'id' cannot be null.", it.errorThrowable!!.message)
            }
        )
    }

    @Test
    fun `fetch recommendations should properly parse options`() {
        every { Exponea.isInitialized } returns true
        val slot = slot<CustomerRecommendationOptions>()
        every { Exponea.fetchRecommendation(capture(slot), any(), any()) } answers {
            thirdArg<(Result<FetchError>) -> Unit>().invoke(Result(false, FetchError("{}", "mock error")))
        }
        module.fetchRecommendations(
            JavaOnlyMap.of(
                "id", "mock-id",
                "fillWithRandom", false,
                "size", 100,
                "items", JavaOnlyMap.of("item1", "value1", "item2", "value2"),
                "noTrack", true,
                "catalogAttributesWhitelist", JavaOnlyArray.of("item3", "item4")
            ),
            MockRejectingPromise {
                assertEquals(
                    slot.captured,
                    CustomerRecommendationOptions(
                        id = "mock-id",
                        fillWithRandom = false,
                        size = 100,
                        items = hashMapOf("item1" to "value1", "item2" to "value2"),
                        noTrack = true,
                        catalogAttributesWhitelist = arrayListOf("item3", "item4")
                    )
                )
            }
        )
    }

    @Test
    fun `fetch recommendations should reject on fetch error`() {
        every { Exponea.isInitialized } returns true
        val slot = slot<CustomerRecommendationOptions>()
        every { Exponea.fetchRecommendation(capture(slot), any(), any()) } answers {
            thirdArg<(Result<FetchError>) -> Unit>().invoke(Result(false, FetchError("{}", "mock error")))
        }
        module.fetchRecommendations(
            JavaOnlyMap.of("id", "mock-id", "fillWithRandom", true),
            MockRejectingPromise {
                assertEquals(ExponeaModule.ExponeaFetchException::class, it.errorThrowable!!::class)
                assertEquals("mock error", it.errorThrowable!!.message)
            }
        )
    }

    @Test
    fun `fetch recommendations should resolve with response from server`() {
        every { Exponea.isInitialized } returns true
        val slot = slot<CustomerRecommendationOptions>()
        every { Exponea.fetchRecommendation(capture(slot), any(), any()) } answers {
            secondArg<(Result<ArrayList<CustomerRecommendation>>) -> Unit>().invoke(
                Result(
                    true,
                    arrayListOf(
                        CustomerRecommendation(
                            engineName = "mock engine name",
                            itemId = "mock item id",
                            recommendationId = "mock recommendation id",
                            recommendationVariantId = "mock variant id",
                            data = hashMapOf(
                                "string" to JsonPrimitive("string"),
                                "number" to JsonPrimitive(123),
                                "boolean" to JsonPrimitive(false)
                            )
                        )
                    )
                )
            )
        }
        val expectedResponse = """
            [
                {
                    "itemId": "mock item id",
                    "recommendationVariantId": "mock variant id",
                    "data": {
                        "string": "string",
                        "number": 123.0,
                        "boolean": false
                    },
                    "recommendationId": "mock recommendation id",
                    "engineName": "mock engine name"
                }
            ]
        """.trimIndent()
        module.fetchRecommendations(
            JavaOnlyMap.of("id", "mock-id", "fillWithRandom", true),
            MockResolvingPromise {
                assertEquals(
                    Gson().fromJson(expectedResponse, Object::class.java),
                    Gson().fromJson(it.result as String, Object::class.java)
                )
            }
        )
    }
}
