package com.exponea

import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ExponeaModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "Exponea"
    }

    @ReactMethod
    fun sampleMethod(stringArgument: String, numberArgument: Int, callback: Callback) { // TODO: Implement some actually useful functionality
        callback.invoke("Kotlin received numberArgument: $numberArgument stringArgument: $stringArgument")
    }
}
