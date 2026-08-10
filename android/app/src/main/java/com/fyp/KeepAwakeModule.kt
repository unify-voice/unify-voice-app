package com.unifyvoice.android

import android.view.WindowManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class KeepAwakeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "KeepAwake"

  @ReactMethod
  fun setEnabled(enabled: Boolean) {
    val activity = reactApplicationContext.currentActivity ?: return
    activity.runOnUiThread {
      val window = activity.window ?: return@runOnUiThread
      if (enabled) {
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
      } else {
        window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
      }
    }
  }
}
