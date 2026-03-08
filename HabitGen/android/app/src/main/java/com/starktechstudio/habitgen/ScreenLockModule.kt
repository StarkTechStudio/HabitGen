package com.starktechstudio.habitgen

import android.app.Activity
import android.app.ActivityManager
import android.app.Application
import android.app.KeyguardManager
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.util.Log
import android.view.View
import android.view.WindowManager
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ScreenLockModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "ScreenLockModule"

    companion object {
        private const val TAG = "ScreenLockModule"
        @Volatile
        @JvmStatic
        var isFocusLocked = false
            private set

        fun setLocked(locked: Boolean) {
            isFocusLocked = locked
        }
    }

    private val mainHandler = Handler(Looper.getMainLooper())
    private var lifecycleCallbacks: Application.ActivityLifecycleCallbacks? = null
    private var screenWakeLock: PowerManager.WakeLock? = null

    private fun getAdminComponent(): ComponentName {
        return ComponentName(reactApplicationContext, HabitGenDeviceAdmin::class.java)
    }

    private fun getDPM(): DevicePolicyManager {
        return reactApplicationContext.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
    }

    @ReactMethod
    fun requestDeviceAdmin() {
        val activity = reactApplicationContext.currentActivity ?: return
        val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN).apply {
            putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, getAdminComponent())
            putExtra(
                DevicePolicyManager.EXTRA_ADD_EXPLANATION,
                "HabitGen needs this to lock your phone during focus sessions."
            )
        }
        activity.startActivity(intent)
    }

    @ReactMethod
    fun isDeviceAdminEnabled(promise: Promise) {
        try {
            promise.resolve(getDPM().isAdminActive(getAdminComponent()))
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    /**
     * 1) Set showWhenLocked + turnScreenOn + keepScreenOn
     * 2) Acquire a wake lock for the ENTIRE session (keeps screen on even after lockNow)
     * 3) lockNow() - locks the phone (home/recents/minimize don't work)
     * 4) Re-launch activity to force it visible over the lock screen
     */
    @ReactMethod
    fun enableFocusLock() {
        Log.d(TAG, "enableFocusLock called")
        setLocked(true)
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            Log.e(TAG, "currentActivity is null")
            return
        }

        val dpm = getDPM()
        val component = getAdminComponent()
        if (!dpm.isAdminActive(component)) {
            Log.w(TAG, "Device admin not active, requesting")
            requestDeviceAdmin()
            setLocked(false)
            return
        }

        // Step 1: Set window flags
        activity.runOnUiThread {
            val act = reactApplicationContext.currentActivity ?: return@runOnUiThread
            try {
                act.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
                    act.setShowWhenLocked(true)
                    act.setTurnScreenOn(true)
                } else {
                    @Suppress("DEPRECATION")
                    act.window.addFlags(
                        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                    )
                }
                // Hide nav bar + status bar for full immersive kiosk mode
                hideSystemUI(act)
                Log.d(TAG, "Window flags set + immersive mode")
            } catch (e: Exception) {
                Log.e(TAG, "Error setting flags", e)
            }
        }

        // Step 2: Acquire wake lock for entire session BEFORE locking
        acquireSessionWakeLock()

        // Step 3: Lock the phone after flags and wake lock are in place
        mainHandler.postDelayed({
            if (!isFocusLocked) return@postDelayed
            try {
                if (dpm.isAdminActive(component)) {
                    dpm.lockNow()
                    Log.d(TAG, "lockNow() called")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error locking", e)
            }

            // Step 4: Re-launch activity over lock screen
            mainHandler.postDelayed({
                if (!isFocusLocked) return@postDelayed
                bringActivityToFront()
            }, 500)
        }, 300)

        registerLifecycleCallbacks()
    }

    @ReactMethod
    fun disableFocusLock() {
        Log.d(TAG, "disableFocusLock called")
        setLocked(false)
        unregisterLifecycleCallbacks()

        val activity = reactApplicationContext.currentActivity ?: return
        activity.runOnUiThread {
            val act = reactApplicationContext.currentActivity ?: return@runOnUiThread
            try {
                act.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
                    act.setShowWhenLocked(false)
                    act.setTurnScreenOn(false)
                    val km = reactApplicationContext.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
                    km.requestDismissKeyguard(act, null)
                } else {
                    @Suppress("DEPRECATION")
                    act.window.clearFlags(
                        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                    )
                }
                showSystemUI(act)
            } catch (e: Exception) {
                Log.e(TAG, "Error clearing flags", e)
            }
        }

        // Deactivate device admin so app can be uninstalled
        try {
            val dpm = getDPM()
            if (dpm.isAdminActive(getAdminComponent())) {
                dpm.removeActiveAdmin(getAdminComponent())
                Log.d(TAG, "Device admin deactivated")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error deactivating admin", e)
        }
    }

    /**
     * Keep the screen on for the entire focus session.
     * This wake lock stays held until disableFocusLock is called.
     */
    @Suppress("DEPRECATION")
    private fun acquireSessionWakeLock() {
        releaseWakeLock()
        try {
            val pm = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as PowerManager
            screenWakeLock = pm.newWakeLock(
                PowerManager.FULL_WAKE_LOCK or
                    PowerManager.ACQUIRE_CAUSES_WAKEUP or
                    PowerManager.ON_AFTER_RELEASE,
                "HabitGen:FocusTimer"
            )
            // Hold for up to 4 hours (covers any realistic timer duration)
            screenWakeLock?.acquire(4 * 60 * 60 * 1000L)
            Log.d(TAG, "Session wake lock acquired (4h)")
        } catch (e: Exception) {
            Log.e(TAG, "Error acquiring wake lock", e)
        }
    }

    private fun hideSystemUI(activity: Activity) {
        try {
            WindowCompat.setDecorFitsSystemWindows(activity.window, false)
            val controller = WindowInsetsControllerCompat(activity.window, activity.window.decorView)
            controller.hide(WindowInsetsCompat.Type.systemBars())
            controller.systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        } catch (_: Exception) {
            // Fallback for older APIs
            @Suppress("DEPRECATION")
            activity.window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                    View.SYSTEM_UI_FLAG_FULLSCREEN or
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            )
        }
    }

    private fun showSystemUI(activity: Activity) {
        try {
            WindowCompat.setDecorFitsSystemWindows(activity.window, true)
            val controller = WindowInsetsControllerCompat(activity.window, activity.window.decorView)
            controller.show(WindowInsetsCompat.Type.systemBars())
        } catch (_: Exception) {
            @Suppress("DEPRECATION")
            activity.window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_VISIBLE
        }
    }

    private fun releaseWakeLock() {
        try {
            if (screenWakeLock?.isHeld == true) {
                screenWakeLock?.release()
                Log.d(TAG, "Wake lock released")
            }
        } catch (_: Exception) {}
        screenWakeLock = null
    }

    /**
     * Instantly bring the app back to front using moveTaskToFront (fastest method).
     * Falls back to launching via intent if moveTaskToFront fails.
     */
    private fun bringActivityToFront() {
        try {
            val am = reactApplicationContext.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            val tasks = am.appTasks
            if (tasks.isNotEmpty()) {
                tasks[0].moveToFront()
                Log.d(TAG, "moveToFront via appTasks")
                return
            }
        } catch (_: Exception) {}

        try {
            val launchIntent = reactApplicationContext.packageManager
                .getLaunchIntentForPackage(reactApplicationContext.packageName)
            if (launchIntent != null) {
                launchIntent.addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_REORDER_TO_FRONT or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP
                )
                reactApplicationContext.startActivity(launchIntent)
                Log.d(TAG, "Activity re-launched via intent")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error bringing activity to front", e)
        }
    }

    private fun registerLifecycleCallbacks() {
        unregisterLifecycleCallbacks()
        val app = reactApplicationContext.applicationContext as? Application ?: return
        lifecycleCallbacks = object : Application.ActivityLifecycleCallbacks {
            override fun onActivityPaused(activity: Activity) {
                if (!isFocusLocked) return
                Log.d(TAG, "Activity paused while locked - bringing back immediately")
                // Don't call lockNow() again (causes black flash).
                // Phone is already locked; just snap the activity back instantly.
                mainHandler.post {
                    if (isFocusLocked) bringActivityToFront()
                }
            }
            override fun onActivityStopped(activity: Activity) {
                if (!isFocusLocked) return
                // Double-check: if we somehow fully stopped, bring back
                mainHandler.post {
                    if (isFocusLocked) bringActivityToFront()
                }
            }
            override fun onActivityResumed(activity: Activity) {
                if (!isFocusLocked) return
                // Re-apply immersive mode every time activity comes back
                activity.runOnUiThread { hideSystemUI(activity) }
            }
            override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {}
            override fun onActivityStarted(activity: Activity) {}
            override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
            override fun onActivityDestroyed(activity: Activity) {}
        }
        app.registerActivityLifecycleCallbacks(lifecycleCallbacks)
    }

    private fun unregisterLifecycleCallbacks() {
        lifecycleCallbacks?.let { cb ->
            val app = reactApplicationContext.applicationContext as? Application
            app?.unregisterActivityLifecycleCallbacks(cb)
        }
        lifecycleCallbacks = null
        mainHandler.removeCallbacksAndMessages(null)
        releaseWakeLock()
    }
}
