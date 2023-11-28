package com.exponea

import com.exponea.widget.AppInboxButtonManager
import com.exponea.widget.InAppContentBlocksPlaceholderManager
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ExponeaPackage : ReactPackage {
    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): MutableList<NativeModule> {
        return arrayListOf(ExponeaModule(reactContext))
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): MutableList<ViewManager<*, *>> {
        return arrayListOf(
            AppInboxButtonManager(),
            InAppContentBlocksPlaceholderManager()
        )
    }
}
