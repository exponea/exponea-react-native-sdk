package com.exponea

import com.facebook.react.bridge.JavaOnlyArray
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.google.gson.Gson
import com.google.gson.JsonObject

object TestJsonParser {
    fun parse(jsonString: String): Any? {
        return parseJsonNode(Gson().fromJson(jsonString, Object::class.java))
    }

    private fun parseJsonNode(jsonNode: Any?): Any? {
        return when {
            jsonNode is Map<*, *> -> parseJsonObject(jsonNode)
            jsonNode is List<*> -> parseJsonArray(jsonNode)
            else -> jsonNode
        }
    }

    private fun parseJsonObject(jsonObject: Map<*, *>): JavaOnlyMap {
        val map = JavaOnlyMap()
        jsonObject.forEach {
            val key = it.key as String
            val value = parseJsonNode(it.value)
            when {
                value is JavaOnlyMap -> map.putMap(key, value)
                value is JavaOnlyArray -> map.putArray(key, value)
                value is String -> map.putString(key, value)
                value is Double -> map.putDouble(key, value)
                value is Int -> map.putInt(key, value)
                value is Boolean -> map.putBoolean(key, value)
                value == null -> map.putNull(key)
            }
        }
        return map
    }

    private fun parseJsonArray(jsonArray: List<*>): JavaOnlyArray {
        val array = JavaOnlyArray()
        jsonArray.forEach {
            val value = parseJsonNode(it)
            when {
                value is ReadableMap -> array.pushMap(value)
                value is ReadableArray -> array.pushArray(value)
                value is String -> array.pushString(value)
                value is Double -> array.pushDouble(value)
                value is Int -> array.pushInt(value)
                value is Boolean -> array.pushBoolean(value)
                value == null -> array.pushNull()
            }
        }
        return array
    }

    fun minify(source: String): String {
        val parsedSource = parseJsonNode(Gson().fromJson(source, JsonObject::class.java))
        return Gson().toJson(parsedSource)
    }
}
