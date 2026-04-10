package com.exponea

import com.exponea.widget.AppInboxButtonManager
import com.exponea.widget.ContentBlockCarouselViewManager
import com.exponea.widget.InAppContentBlocksPlaceholderManager
import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import java.util.HashMap

class ExponeaPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == ExponeaModule.NAME) {
      ExponeaModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
      moduleInfos[ExponeaModule.NAME] = ReactModuleInfo(
        ExponeaModule.NAME,
        ExponeaModule.NAME,
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCxxModule
        true // isTurboModule
      )
      moduleInfos
    }
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return listOf(
      AppInboxButtonManager(),
      ContentBlockCarouselViewManager(),
      InAppContentBlocksPlaceholderManager()
    )
  }
}
