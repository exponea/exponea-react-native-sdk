package com.exponea

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import kotlin.reflect.KClass

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
