package exponea.example

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  companion object {
    lateinit var APP_INSTANCE: MainApplication
  }

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          add(ExampleAppPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    APP_INSTANCE = this
    loadReactNative(this)
  }
}
