package com.exponea

import android.graphics.Color
import com.facebook.react.bridge.DynamicFromObject
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(manifest = Config.NONE)
internal class ParsersTest {
    @Test
    fun `should parse named color`() {
        val parsedColor = DynamicFromObject("red").asColor()
        assertEquals(Color.RED, parsedColor)
    }

    @Test
    fun `should parse hex color`() {
        val parsedColor = DynamicFromObject("#FF0000").asColor()
        assertEquals(Color.RED, parsedColor)
    }

    @Test
    fun `should parse hex-alpha color`() {
        val parsedColor = DynamicFromObject("#FF0000FF").asColor()
        assertEquals(Color.RED, parsedColor)
    }

    @Test
    fun `should parse short-hex color`() {
        val parsedColor = DynamicFromObject("#F00").asColor()
        assertEquals(Color.RED, parsedColor)
    }

    @Test
    fun `should parse short-hex-alpha color`() {
        val parsedColor = DynamicFromObject("#F00F").asColor()
        assertEquals(Color.RED, parsedColor)
    }

    @Test
    fun `should parse rgb color`() {
        val parsedColor = DynamicFromObject("rgb(255, 0, 0)").asColor()
        assertEquals(Color.RED, parsedColor)
    }

    @Test
    fun `should parse rgba color`() {
        val parsedColor = DynamicFromObject("rgba(255, 0, 0, 1.0)").asColor()
        assertEquals(Color.RED, parsedColor)
    }

    @Test
    fun `should parse argb color`() {
        val parsedColor = DynamicFromObject("argb(1.0, 255, 0, 0)").asColor()
        assertEquals(Color.RED, parsedColor)
    }

    @Test
    fun `should parse rgba-slash color`() {
        val parsedColor = DynamicFromObject("rgba(255 0 0 / 1.0)").asColor()
        assertEquals(Color.RED, parsedColor)
    }

    @Test
    fun `should print Int color`() {
        val colorString = Color.RED.asColorString()
        val parsedColor = DynamicFromObject(colorString).asColor()
        assertEquals(Color.RED, parsedColor)
    }
}
