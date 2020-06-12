package com.exponea

import androidx.test.core.app.ApplicationProvider
import com.facebook.react.bridge.ReactApplicationContext
import junit.framework.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
internal class ExponeaModuleTest {
    @Test
    fun `should return correct module name`() {
        assertEquals(
            "Exponea",
            ExponeaModule(ReactApplicationContext(ApplicationProvider.getApplicationContext())).name
        )
    }
}
