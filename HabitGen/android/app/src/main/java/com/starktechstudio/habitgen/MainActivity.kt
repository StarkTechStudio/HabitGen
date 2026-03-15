package com.starktechstudio.habitgen

import android.content.Intent
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.drawable.Icon
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.KeyEvent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "HabitGen"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
      super.onCreate(savedInstanceState)
      registerDynamicShortcuts()
  }

  private fun registerDynamicShortcuts() {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N_MR1) return
      val shortcutManager = getSystemService(ShortcutManager::class.java) ?: return

      val uninstallIntent = Intent(Intent.ACTION_VIEW, Uri.parse("habitgen://uninstall-helper"))
          .setPackage(packageName)
          .setClass(this, MainActivity::class.java)

      val shortcut = ShortcutInfo.Builder(this, "dont_uninstall")
          .setShortLabel("Remove Permission")
          .setLongLabel("Don't uninstall me! I'm your companion")
          .setIcon(Icon.createWithResource(this, R.mipmap.ic_launcher))
          .setIntent(uninstallIntent)
          .build()

      shortcutManager.dynamicShortcuts = listOf(shortcut)
  }

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
