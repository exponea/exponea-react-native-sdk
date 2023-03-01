package com.exponea

import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.Drawable
import android.util.TypedValue
import androidx.core.graphics.drawable.DrawableCompat
import com.exponea.sdk.models.MessageItem
import com.exponea.sdk.util.Logger
import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.ReadableType.Array
import com.facebook.react.bridge.ReadableType.Null
import com.facebook.react.bridge.ReadableType.Number
import java.util.Date
import kotlin.reflect.KClass
import kotlin.text.RegexOption.IGNORE_CASE

internal inline fun <reified T : Any> Map<String, Any?>.getRequired(key: String): T {
    return getSafely(key, T::class)
}

internal fun <T : Any> Map<String, Any?>.getSafely(key: String, type: KClass<T>): T {
    val value = this[key] ?: throw ExponeaModule.ExponeaDataException("Property '$key' cannot be null.")
    if (value::class == type) {
        @Suppress("UNCHECKED_CAST")
        return value as T
    } else {
        throw ExponeaModule.ExponeaDataException(
            "Incorrect type for key '$key'. Expected ${type.simpleName} got ${value::class.simpleName}"
        )
    }
}

internal fun ReadableMap.toHashMapRecursively(): Map<String, Any?> {
    val map = this.toHashMap()
    return map.mapValues {
        when {
            it.value is ReadableMap -> (it.value as ReadableMap).toHashMapRecursively()
            it.value is ReadableArray -> (it.value as ReadableArray).toArrayListRecursively()
            else -> it.value
        }
    }
}

internal fun ReadableArray.toArrayListRecursively(): List<Any?> {
    val list = this.toArrayList()
    return list.map {
        when {
            it is ReadableMap -> it.toHashMapRecursively()
            it is ReadableArray -> it.toArrayListRecursively()
            else -> it
        }
    }
}

internal fun MessageItem.toMap(): Map<String, Any?> {
    return mapOf(
        "id" to id,
        "type" to rawType,
        "is_read" to read,
        "create_time" to receivedTime,
        "content" to rawContent
    )
}

internal inline fun <reified T : Any> Map<String, Any?>.getNullSafelyMap(key: String, defaultValue: Map<String, T>? = null): Map<String, T>? {
    return getNullSafelyMap(key, T::class, defaultValue)
}

internal inline fun <reified T : Any> Map<String, Any?>.getNullSafelyMap(key: String, type: KClass<T>, defaultValue: Map<String, T>? = null): Map<String, T>? {
    val value = this[key] ?: return defaultValue
    @Suppress("UNCHECKED_CAST")
    val mapOfAny = value as? Map<String, Any?> ?: throw ExponeaModule.ExponeaDataException(
        "Non-map type for key '$key'. Got ${value::class.simpleName}"
    )
    return mapOfAny.filterValueIsInstance(type.java)
}

/**
 * Returns a map containing all key-value pairs with values are instances of specified class.
 *
 * The returned map preserves the entry iteration order of the original map.
 */
internal fun <K, V, R> Map<out K, V>.filterValueIsInstance(klass: Class<R>): Map<K, R> {
    val result = LinkedHashMap<K, R>()
    for (entry in this) {
        if (klass.isInstance(entry.value)) {
            @Suppress("UNCHECKED_CAST")
            ((entry.value as R).also { result[entry.key] = it })
        }
    }
    return result
}

internal inline fun <reified T : Any> Map<String, Any?>.getNullSafelyArray(key: String, defaultValue: List<T>? = null): List<T>? {
    return getNullSafelyArray(key, T::class, defaultValue)
}

internal inline fun <reified T : Any> Map<String, Any?>.getNullSafelyArray(key: String, type: KClass<T>, defaultValue: List<T>? = null): List<T>? {
    val value = this[key] ?: return defaultValue
    val arrayOfAny = value as? List<Any?> ?: throw ExponeaModule.ExponeaDataException(
        "Non-array type for key '$key'. Got ${value::class.simpleName}"
    )
    return arrayOfAny
        .filterIsInstance(type.java)
}

internal inline fun <reified T : Any> Map<String, Any?>.getNullSafely(key: String, defaultValue: T? = null): T? {
    return getNullSafely(key, T::class, defaultValue)
}

internal fun <T : Any> Map<String, Any?>.getNullSafely(key: String, type: KClass<T>, defaultValue: T? = null): T? {
    val value = this[key] ?: return defaultValue
    @Suppress("UNCHECKED_CAST")
    return (value as? T) ?: throw ExponeaModule.ExponeaDataException(
        "Incorrect type for key '$key'. Expected ${type.simpleName} got ${value::class.simpleName}"
    )
}

internal fun Dynamic.asSize(): PlatformSize? {
    val type = this.type ?: return null
    when (type) {
        Null -> return null
        ReadableType.Boolean -> return null
        Number -> return PlatformSize(
            TypedValue.COMPLEX_UNIT_PX,
            asDouble().toFloat()
        )
        ReadableType.String -> return PlatformSize(
            sizeType(asString()),
            sizeValue(asString())
        )
        ReadableType.Map -> return null
        Array -> return null
    }
}

private fun sizeValue(source: String): Float {
    val parsed = source.filter { it.isDigit() || it == '.' }.toFloatOrNull()
    if (parsed == null) {
        Logger.e(source, "Unable to read float value from $source")
    }
    return parsed ?: 0F
}

internal data class PlatformSize(val unit: Int, val size: Float) {
    companion object {
        fun parse(from: String?): PlatformSize? {
            if (from.isNullOrBlank()) return null
            return PlatformSize(
                sizeType(from),
                sizeValue(from)
            )
        }
    }
    fun asString(): String {
        return "$size${sizeTypeString(unit)}"
    }
}

private fun sizeTypeString(unit: Int): String {
    return when (unit) {
        TypedValue.COMPLEX_UNIT_PX -> "px"
        TypedValue.COMPLEX_UNIT_IN -> "in"
        TypedValue.COMPLEX_UNIT_MM -> "mm"
        TypedValue.COMPLEX_UNIT_PT -> "pt"
        TypedValue.COMPLEX_UNIT_DIP -> "dp"
        TypedValue.COMPLEX_UNIT_SP -> "sp"
        else -> "px"
    }
}

private fun sizeType(source: String): Int {
    return when {
        source.endsWith("px", true) -> TypedValue.COMPLEX_UNIT_PX
        source.endsWith("in", true) -> TypedValue.COMPLEX_UNIT_IN
        source.endsWith("mm", true) -> TypedValue.COMPLEX_UNIT_MM
        source.endsWith("pt", true) -> TypedValue.COMPLEX_UNIT_PT
        source.endsWith("dp", true) -> TypedValue.COMPLEX_UNIT_DIP
        source.endsWith("dip", true) -> TypedValue.COMPLEX_UNIT_DIP
        source.endsWith("sp", true) -> TypedValue.COMPLEX_UNIT_SP
        else -> TypedValue.COMPLEX_UNIT_PX
    }
}

fun toTypeface(source: String?): Int {
    when (source) {
        "normal" -> return Typeface.NORMAL
        "bold" -> return Typeface.BOLD
        "100" -> return Typeface.NORMAL
        "200" -> return Typeface.NORMAL
        "300" -> return Typeface.NORMAL
        "400" -> return Typeface.NORMAL
        "500" -> return Typeface.NORMAL
        "600" -> return Typeface.NORMAL
        "700" -> return Typeface.BOLD
        "800" -> return Typeface.BOLD
        "900" -> return Typeface.BOLD
        else -> return Typeface.NORMAL
    }
}

internal fun Drawable?.applyTint(color: Int): Drawable? {
    if (this == null) return null
    val wrappedIcon: Drawable = DrawableCompat.wrap(this)
    DrawableCompat.setTint(wrappedIcon, color)
    return wrappedIcon
}

private val HEX_VALUE = Regex("[0-9A-F]", IGNORE_CASE)
private val SHORT_HEX_FORMAT = Regex("^#([0-9A-F]){3}\$", IGNORE_CASE)
private val SHORT_HEXA_FORMAT = Regex("^#[0-9A-F]{4}\$", IGNORE_CASE)
private val HEX_FORMAT = Regex("^#[0-9A-F]{6}\$", IGNORE_CASE)
private val HEXA_FORMAT = Regex("^#[0-9A-F]{8}\$", IGNORE_CASE)
private val RGBA_FORMAT = Regex(
    "^rgba\\([ ]*([0-9]{1,3})[, ]+([0-9]{1,3})[, ]+([0-9]{1,3})[,/ ]+([0-9.]+)[ ]*\\)\$",
    IGNORE_CASE
)
private val ARGB_FORMAT = Regex(
    "^argb\\([ ]*([0-9.]{1,3})[, ]+([0-9]{1,3})[, ]+([0-9]{1,3})[, ]+([0-9]+)[ ]*\\)\$",
    IGNORE_CASE
)
private val RGB_FORMAT = Regex("^rgb\\([ ]*([0-9]{1,3})[, ]+([0-9]{1,3})[, ]+([0-9]{1,3})[ ]*\\)\$", IGNORE_CASE)
private val NAMED_COLORS = mapOf(
    // any color name from here: https://www.w3.org/wiki/CSS/Properties/color/keywords
    "aliceblue" to Color.parseColor("#f0f8ff"),
    "antiquewhite" to Color.parseColor("#faebd7"),
    "aqua" to Color.parseColor("#00ffff"),
    "aquamarine" to Color.parseColor("#7fffd4"),
    "azure" to Color.parseColor("#f0ffff"),
    "beige" to Color.parseColor("#f5f5dc"),
    "bisque" to Color.parseColor("#ffe4c4"),
    "black" to Color.parseColor("#000000"),
    "blanchedalmond" to Color.parseColor("#ffebcd"),
    "blue" to Color.parseColor("#0000ff"),
    "blueviolet" to Color.parseColor("#8a2be2"),
    "brown" to Color.parseColor("#a52a2a"),
    "burlywood" to Color.parseColor("#deb887"),
    "cadetblue" to Color.parseColor("#5f9ea0"),
    "chartreuse" to Color.parseColor("#7fff00"),
    "chocolate" to Color.parseColor("#d2691e"),
    "coral" to Color.parseColor("#ff7f50"),
    "cornflowerblue" to Color.parseColor("#6495ed"),
    "cornsilk" to Color.parseColor("#fff8dc"),
    "crimson" to Color.parseColor("#dc143c"),
    "cyan" to Color.parseColor("#00ffff"),
    "darkblue" to Color.parseColor("#00008b"),
    "darkcyan" to Color.parseColor("#008b8b"),
    "darkgoldenrod" to Color.parseColor("#b8860b"),
    "darkgray" to Color.parseColor("#a9a9a9"),
    "darkgreen" to Color.parseColor("#006400"),
    "darkgrey" to Color.parseColor("#a9a9a9"),
    "darkkhaki" to Color.parseColor("#bdb76b"),
    "darkmagenta" to Color.parseColor("#8b008b"),
    "darkolivegreen" to Color.parseColor("#556b2f"),
    "darkorange" to Color.parseColor("#ff8c00"),
    "darkorchid" to Color.parseColor("#9932cc"),
    "darkred" to Color.parseColor("#8b0000"),
    "darksalmon" to Color.parseColor("#e9967a"),
    "darkseagreen" to Color.parseColor("#8fbc8f"),
    "darkslateblue" to Color.parseColor("#483d8b"),
    "darkslategray" to Color.parseColor("#2f4f4f"),
    "darkslategrey" to Color.parseColor("#2f4f4f"),
    "darkturquoise" to Color.parseColor("#00ced1"),
    "darkviolet" to Color.parseColor("#9400d3"),
    "deeppink" to Color.parseColor("#ff1493"),
    "deepskyblue" to Color.parseColor("#00bfff"),
    "dimgray" to Color.parseColor("#696969"),
    "dimgrey" to Color.parseColor("#696969"),
    "dodgerblue" to Color.parseColor("#1e90ff"),
    "firebrick" to Color.parseColor("#b22222"),
    "floralwhite" to Color.parseColor("#fffaf0"),
    "forestgreen" to Color.parseColor("#228b22"),
    "fuchsia" to Color.parseColor("#ff00ff"),
    "gainsboro" to Color.parseColor("#dcdcdc"),
    "ghostwhite" to Color.parseColor("#f8f8ff"),
    "gold" to Color.parseColor("#ffd700"),
    "goldenrod" to Color.parseColor("#daa520"),
    "gray" to Color.parseColor("#808080"),
    "green" to Color.parseColor("#008000"),
    "greenyellow" to Color.parseColor("#adff2f"),
    "grey" to Color.parseColor("#808080"),
    "honeydew" to Color.parseColor("#f0fff0"),
    "hotpink" to Color.parseColor("#ff69b4"),
    "indianred" to Color.parseColor("#cd5c5c"),
    "indigo" to Color.parseColor("#4b0082"),
    "ivory" to Color.parseColor("#fffff0"),
    "khaki" to Color.parseColor("#f0e68c"),
    "lavender" to Color.parseColor("#e6e6fa"),
    "lavenderblush" to Color.parseColor("#fff0f5"),
    "lawngreen" to Color.parseColor("#7cfc00"),
    "lemonchiffon" to Color.parseColor("#fffacd"),
    "lightblue" to Color.parseColor("#add8e6"),
    "lightcoral" to Color.parseColor("#f08080"),
    "lightcyan" to Color.parseColor("#e0ffff"),
    "lightgoldenrodyellow" to Color.parseColor("#fafad2"),
    "lightgray" to Color.parseColor("#d3d3d3"),
    "lightgreen" to Color.parseColor("#90ee90"),
    "lightgrey" to Color.parseColor("#d3d3d3"),
    "lightpink" to Color.parseColor("#ffb6c1"),
    "lightsalmon" to Color.parseColor("#ffa07a"),
    "lightseagreen" to Color.parseColor("#20b2aa"),
    "lightskyblue" to Color.parseColor("#87cefa"),
    "lightslategray" to Color.parseColor("#778899"),
    "lightslategrey" to Color.parseColor("#778899"),
    "lightsteelblue" to Color.parseColor("#b0c4de"),
    "lightyellow" to Color.parseColor("#ffffe0"),
    "lime" to Color.parseColor("#00ff00"),
    "limegreen" to Color.parseColor("#32cd32"),
    "linen" to Color.parseColor("#faf0e6"),
    "magenta" to Color.parseColor("#ff00ff"),
    "maroon" to Color.parseColor("#800000"),
    "mediumaquamarine" to Color.parseColor("#66cdaa"),
    "mediumblue" to Color.parseColor("#0000cd"),
    "mediumorchid" to Color.parseColor("#ba55d3"),
    "mediumpurple" to Color.parseColor("#9370db"),
    "mediumseagreen" to Color.parseColor("#3cb371"),
    "mediumslateblue" to Color.parseColor("#7b68ee"),
    "mediumspringgreen" to Color.parseColor("#00fa9a"),
    "mediumturquoise" to Color.parseColor("#48d1cc"),
    "mediumvioletred" to Color.parseColor("#c71585"),
    "midnightblue" to Color.parseColor("#191970"),
    "mintcream" to Color.parseColor("#f5fffa"),
    "mistyrose" to Color.parseColor("#ffe4e1"),
    "moccasin" to Color.parseColor("#ffe4b5"),
    "navajowhite" to Color.parseColor("#ffdead"),
    "navy" to Color.parseColor("#000080"),
    "oldlace" to Color.parseColor("#fdf5e6"),
    "olive" to Color.parseColor("#808000"),
    "olivedrab" to Color.parseColor("#6b8e23"),
    "orange" to Color.parseColor("#ffa500"),
    "orangered" to Color.parseColor("#ff4500"),
    "orchid" to Color.parseColor("#da70d6"),
    "palegoldenrod" to Color.parseColor("#eee8aa"),
    "palegreen" to Color.parseColor("#98fb98"),
    "paleturquoise" to Color.parseColor("#afeeee"),
    "palevioletred" to Color.parseColor("#db7093"),
    "papayawhip" to Color.parseColor("#ffefd5"),
    "peachpuff" to Color.parseColor("#ffdab9"),
    "peru" to Color.parseColor("#cd853f"),
    "pink" to Color.parseColor("#ffc0cb"),
    "plum" to Color.parseColor("#dda0dd"),
    "powderblue" to Color.parseColor("#b0e0e6"),
    "purple" to Color.parseColor("#800080"),
    "red" to Color.parseColor("#ff0000"),
    "rosybrown" to Color.parseColor("#bc8f8f"),
    "royalblue" to Color.parseColor("#4169e1"),
    "saddlebrown" to Color.parseColor("#8b4513"),
    "salmon" to Color.parseColor("#fa8072"),
    "sandybrown" to Color.parseColor("#f4a460"),
    "seagreen" to Color.parseColor("#2e8b57"),
    "seashell" to Color.parseColor("#fff5ee"),
    "sienna" to Color.parseColor("#a0522d"),
    "silver" to Color.parseColor("#c0c0c0"),
    "skyblue" to Color.parseColor("#87ceeb"),
    "slateblue" to Color.parseColor("#6a5acd"),
    "slategray" to Color.parseColor("#708090"),
    "slategrey" to Color.parseColor("#708090"),
    "snow" to Color.parseColor("#fffafa"),
    "springgreen" to Color.parseColor("#00ff7f"),
    "steelblue" to Color.parseColor("#4682b4"),
    "tan" to Color.parseColor("#d2b48c"),
    "teal" to Color.parseColor("#008080"),
    "thistle" to Color.parseColor("#d8bfd8"),
    "tomato" to Color.parseColor("#ff6347"),
    "turquoise" to Color.parseColor("#40e0d0"),
    "violet" to Color.parseColor("#ee82ee"),
    "wheat" to Color.parseColor("#f5deb3"),
    "white" to Color.parseColor("#ffffff"),
    "whitesmoke" to Color.parseColor("#f5f5f5"),
    "yellow" to Color.parseColor("#ffff00"),
    "yellowgreen" to Color.parseColor("#9acd32")
)

internal fun Dynamic.asColor(): Int? {
    val type = this.type ?: return null
    when (type) {
        Null -> return null
        ReadableType.Boolean -> return null
        Number -> return asInt()
        ReadableType.String -> {
            val colorString = asString()
            try {
                if (colorString.isNullOrBlank()) {
                    return null
                }
                if (SHORT_HEX_FORMAT.matches(colorString)) {
                    val hexFormat = HEX_VALUE.replace(colorString) {
                        // doubles HEX value
                        it.value + it.value
                    }
                    return Color.parseColor(hexFormat)
                }
                if (HEX_FORMAT.matches(colorString)) {
                    return Color.parseColor(colorString)
                }
                if (SHORT_HEXA_FORMAT.matches(colorString)) {
                    val hexaFormat = HEX_VALUE.replace(colorString) {
                        // doubles HEX value
                        it.value + it.value
                    }
                    // #RRGGBBAA (css) -> #AARRGGBB (android)
                    val ahexFormat = "#${hexaFormat.substring(7, 9)}${hexaFormat.substring(1, 7)}"
                    return Color.parseColor(ahexFormat)
                }
                if (HEXA_FORMAT.matches(colorString)) {
                    // #RRGGBBAA (css) -> #AARRGGBB (android)
                    val ahexFormat = "#${colorString.substring(7, 9)}${colorString.substring(1, 7)}"
                    return Color.parseColor(ahexFormat)
                }
                if (RGBA_FORMAT.matches(colorString)) {
                    // rgba(255, 255, 255, 1.0)
                    // rgba(255 255 255 / 1.0)
                    val parts = RGBA_FORMAT.findAll(colorString).flatMap { it.groupValues }.toList()
                    return Color.argb(
                        // parts[0] skip!
                        (parts[4].toFloat() * 255).toInt(),
                        parts[1].toInt(),
                        parts[2].toInt(),
                        parts[3].toInt()
                    )
                }
                if (ARGB_FORMAT.matches(colorString)) {
                    // argb(1.0, 255, 0, 0)
                    val parts = ARGB_FORMAT.findAll(colorString).flatMap { it.groupValues }.toList()
                    return Color.argb(
                        // parts[0] skip!
                        (parts[1].toFloat() * 255).toInt(),
                        parts[2].toInt(),
                        parts[3].toInt(),
                        parts[4].toInt()
                    )
                }
                if (RGB_FORMAT.matches(colorString)) {
                    // rgb(255, 255, 255)
                    val parts = RGB_FORMAT.findAll(colorString).flatMap { it.groupValues }.toList()
                    return Color.rgb(
                        // parts[0] skip!
                        parts[1].toInt(),
                        parts[2].toInt(),
                        parts[3].toInt()
                    )
                }
                return NAMED_COLORS[colorString.lowercase()]
            } catch (e: IllegalArgumentException) {
                Logger.e(this, "Unable to parse color from $colorString")
                return null
            }
        }
        ReadableType.Map -> return null
        Array -> return null
    }
}

internal fun Int.asColorString(): String {
    // HEXa format = #RRGGBBAA
    val red = Color.red(this)
    val green = Color.green(this)
    val blue = Color.blue(this)
    val alpha = Color.alpha(this)
    return String.format("#%02x%02x%02x%02x", red, green, blue, alpha)
}

fun currentTimeSeconds() = Date().time / 1000.0