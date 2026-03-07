package com.starktechstudio.habitgen

import android.app.Activity
import android.app.ActivityManager
import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ScreenLockModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "ScreenLockModule"

    @ReactMethod
    fun startLockTask() {
        val activity: Activity? = currentActivity
        activity?.runOnUiThread {
            try {
                activity.startLockTask()
            } catch (e: Exception) {
                // Screen pinning may not be available on all devices
                e.printStackTrace()
            }
        }
    }

    @ReactMethod
    fun stopLockTask() {
        val activity: Activity? = currentActivity
        activity?.runOnUiThread {
            try {
                activity.stopLockTask()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    @ReactMethod
    fun isInLockTaskMode(): Boolean {
        val activityManager =
            reactApplicationContext.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        return activityManager.lockTaskModeState != ActivityManager.LOCK_TASK_MODE_NONE
    }
}
