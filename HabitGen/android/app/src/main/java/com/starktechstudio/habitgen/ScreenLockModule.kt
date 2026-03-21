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
import com.facebook.react.bridge.Arguments
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

        // Step 1: Set window flags + immersive mode
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
                hideSystemUI(act)
                Log.d(TAG, "Window flags set + immersive mode")
            } catch (e: Exception) {
                Log.e(TAG, "Error setting flags", e)
            }
        }

        // Step 2: Acquire wake lock for entire session
        acquireSessionWakeLock()

        // Step 3: If Device Admin is already active, use lockNow for stronger lock
        val dpm = getDPM()
        val component = getAdminComponent()
        if (dpm.isAdminActive(component)) {
            mainHandler.postDelayed({
                if (!isFocusLocked) return@postDelayed
                try {
                    dpm.lockNow()
                    Log.d(TAG, "lockNow() called (admin was already active)")
                } catch (e: Exception) {
                    Log.e(TAG, "Error locking", e)
                }
                mainHandler.postDelayed({
                    if (!isFocusLocked) return@postDelayed
                    bringActivityToFront()
                }, 500)
            }, 300)
        }

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
    }

    /**
     * Helper for uninstall flow: remove this app as an active Device Admin so
     * the user can uninstall without visiting system settings manually.
     */
    @ReactMethod
    fun removeDeviceAdmin(promise: Promise) {
        try {
            val dpm = getDPM()
            val component = getAdminComponent()
            if (dpm.isAdminActive(component)) {
                dpm.removeActiveAdmin(component)
                Log.d(TAG, "Device admin deactivated for uninstall")
            }
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error removing device admin", e)
            promise.resolve(false)
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

    @Volatile
    private var allowedAppOpen = false

    @ReactMethod
    fun launchAllowedApp(appType: String, promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.resolve(false)
            return
        }
        try {
            val intent: Intent? = when (appType) {
                "phone" -> Intent(Intent.ACTION_DIAL)
                "messages" -> resolveMessagesIntent()
                "calculator" -> resolveCalculatorIntent()
                "music" -> resolveMusicIntent()
                else -> null
            }
            if (intent == null) {
                promise.resolve(false)
                return
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            allowedAppOpen = true
            mainHandler.postDelayed({ allowedAppOpen = false }, 2 * 60 * 1000L)
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error launching allowed app: $appType", e)
            allowedAppOpen = false
            promise.resolve(false)
        }
    }

    private fun resolveMessagesIntent(): Intent? {
        val pm = reactApplicationContext.packageManager
        val packages = listOf(
            "com.google.android.apps.messaging",
            "com.samsung.android.messaging",
            "com.android.mms"
        )
        for (pkg in packages) {
            val intent = pm.getLaunchIntentForPackage(pkg)
            if (intent != null) return intent
        }
        val intent = Intent(Intent.ACTION_MAIN)
        intent.addCategory(Intent.CATEGORY_APP_MESSAGING)
        return if (intent.resolveActivity(pm) != null) intent else null
    }

    private fun resolveCalculatorIntent(): Intent? {
        val pm = reactApplicationContext.packageManager
        val packages = listOf(
            "com.google.android.calculator",
            "com.android.calculator2",
            "com.sec.android.app.popupcalculator",
            "com.oneplus.calculator"
        )
        for (pkg in packages) {
            val intent = pm.getLaunchIntentForPackage(pkg)
            if (intent != null) return intent
        }
        return null
    }

    private fun resolveMusicIntent(): Intent? {
        val pm = reactApplicationContext.packageManager
        val packages = listOf(
            "com.google.android.apps.youtube.music",
            "com.spotify.music",
            "com.samsung.android.app.music",
            "com.google.android.music",
            "com.apple.android.music"
        )
        for (pkg in packages) {
            val intent = pm.getLaunchIntentForPackage(pkg)
            if (intent != null) return intent
        }
        val intent = Intent(Intent.ACTION_MAIN)
        intent.addCategory("android.intent.category.APP_MUSIC")
        return if (intent.resolveActivity(pm) != null) intent else null
    }

    @ReactMethod
    fun getInstalledMusicApps(promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val musicIntent = Intent(Intent.ACTION_MAIN)
            musicIntent.addCategory("android.intent.category.APP_MUSIC")
            val musicActivities = pm.queryIntentActivities(musicIntent, 0)

            val knownMusic = listOf(
                "com.google.android.apps.youtube.music",
                "com.spotify.music",
                "com.samsung.android.app.music",
                "com.google.android.music",
                "com.apple.android.music",
                "com.amazon.mp3",
                "deezer.android.app",
                "com.soundcloud.android",
                "com.pandora.android",
                "com.aspiro.tidal",
                "com.jio.media.jiobeats"
            )
            val found = mutableSetOf<String>()
            val result = Arguments.createArray()

            for (pkg in knownMusic) {
                val intent = pm.getLaunchIntentForPackage(pkg)
                if (intent != null && !found.contains(pkg)) {
                    found.add(pkg)
                    val appInfo = pm.getApplicationInfo(pkg, 0)
                    val label = pm.getApplicationLabel(appInfo).toString()
                    val entry = Arguments.createMap()
                    entry.putString("packageName", pkg)
                    entry.putString("label", label)
                    result.pushMap(entry)
                }
            }

            for (ri in musicActivities) {
                val pkg = ri.activityInfo.packageName
                if (!found.contains(pkg)) {
                    found.add(pkg)
                    val label = ri.loadLabel(pm).toString()
                    val entry = Arguments.createMap()
                    entry.putString("packageName", pkg)
                    entry.putString("label", label)
                    result.pushMap(entry)
                }
            }

            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting music apps", e)
            promise.resolve(Arguments.createArray())
        }
    }

    @ReactMethod
    fun launchPackage(packageName: String, promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val intent = pm.getLaunchIntentForPackage(packageName)
            if (intent == null) {
                promise.resolve(false)
                return
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            allowedAppOpen = true
            mainHandler.postDelayed({ allowedAppOpen = false }, 2 * 60 * 1000L)
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error launching package: $packageName", e)
            allowedAppOpen = false
            promise.resolve(false)
        }
    }

    private fun registerLifecycleCallbacks() {
        unregisterLifecycleCallbacks()
        val app = reactApplicationContext.applicationContext as? Application ?: return
        lifecycleCallbacks = object : Application.ActivityLifecycleCallbacks {
            override fun onActivityPaused(activity: Activity) {
                if (!isFocusLocked || allowedAppOpen) return
                Log.d(TAG, "Activity paused while locked - bringing back immediately")
                mainHandler.post {
                    if (isFocusLocked && !allowedAppOpen) bringActivityToFront()
                }
            }
            override fun onActivityStopped(activity: Activity) {
                if (!isFocusLocked || allowedAppOpen) return
                mainHandler.post {
                    if (isFocusLocked && !allowedAppOpen) bringActivityToFront()
                }
            }
            override fun onActivityResumed(activity: Activity) {
                if (!isFocusLocked) return
                allowedAppOpen = false
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
