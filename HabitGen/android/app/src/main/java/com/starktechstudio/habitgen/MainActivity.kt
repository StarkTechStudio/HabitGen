package com.starktechstudio.habitgen

import android.view.KeyEvent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "HabitGen"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun dispatchKeyEvent(event: KeyEvent): Boolean {
    if (ScreenLockModule.isFocusLocked) {
      return true
    }
    return super.dispatchKeyEvent(event)
  }

  override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
    if (ScreenLockModule.isFocusLocked) {
      return true
    }
    return super.onKeyDown(keyCode, event)
  }

  override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
    if (ScreenLockModule.isFocusLocked) {
      return true
    }
    return super.onKeyUp(keyCode, event)
  }

  @Suppress("DEPRECATION")
  @Deprecated("Deprecated in Java")
  override fun onBackPressed() {
    if (ScreenLockModule.isFocusLocked) {
      return
    }
    super.onBackPressed()
  }
}
