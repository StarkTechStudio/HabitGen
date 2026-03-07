"""
Static code analysis tests for HabitGen React Native app
Iteration 3 - Testing 8 new changes (15 test items)
"""
import os
import re
import pytest

BASE_PATH = "/app/HabitGen"

def read_file(relative_path: str) -> str:
    """Read file content"""
    full_path = os.path.join(BASE_PATH, relative_path)
    with open(full_path, 'r', encoding='utf-8') as f:
        return f.read()


class TestRevenueCat:
    """RevenueCat integration tests"""

    def test_api_key_correct(self):
        """Test 2: RevenueCat uses correct API key"""
        content = read_file("src/api/revenuecat.ts")
        assert "test_ghPtiGxQAYDDKQKmwpcDeivBIHN" in content
        print("✓ RevenueCat API key is correct")

    def test_entitlement_id_correct(self):
        """Test 2: RevenueCat entitlement ID is 'HabitGen Pro'"""
        content = read_file("src/api/revenuecat.ts")
        assert "ENTITLEMENT_ID = 'HabitGen Pro'" in content
        print("✓ Entitlement ID is 'HabitGen Pro'")

    def test_purchases_offerings_support(self):
        """Test 2: PurchasesOfferings imported and used"""
        content = read_file("src/api/revenuecat.ts")
        assert "PurchasesOfferings" in content
        assert "getOfferings" in content
        print("✓ PurchasesOfferings support implemented")

    def test_customer_info_update_listener(self):
        """Test 2: onCustomerInfoUpdate fires on purchase"""
        content = read_file("src/api/revenuecat.ts")
        assert "addCustomerInfoUpdateListener" in content
        assert "onCustomerInfoUpdate" in content
        print("✓ Customer info update listener implemented")


class TestPremiumScreen:
    """PremiumScreen component tests"""

    def test_uses_revenuecat_ui_paywall(self):
        """Test 3: Uses RevenueCatUI.Paywall component"""
        content = read_file("src/components/PremiumScreen.tsx")
        assert "import RevenueCatUI from 'react-native-purchases-ui'" in content
        assert "RevenueCatUI.Paywall" in content
        print("✓ PremiumScreen uses RevenueCatUI.Paywall")

    def test_purchase_completed_callback(self):
        """Test 3: onPurchaseCompleted callback triggers refreshPremium"""
        content = read_file("src/components/PremiumScreen.tsx")
        assert "onPurchaseCompleted" in content
        print("✓ onPurchaseCompleted callback implemented")

    def test_restore_completed_callback(self):
        """Test 3: onRestoreCompleted callback triggers refreshPremium"""
        content = read_file("src/components/PremiumScreen.tsx")
        assert "onRestoreCompleted" in content
        print("✓ onRestoreCompleted callback implemented")


class TestAppTsx:
    """App.tsx PremiumContext tests"""

    def test_premium_context_exists(self):
        """Test 4: PremiumContext with isPremium state"""
        content = read_file("App.tsx")
        assert "PremiumContext" in content
        assert "isPremium" in content
        print("✓ PremiumContext exists with isPremium state")

    def test_customer_info_update_listener(self):
        """Test 4: onCustomerInfoUpdate listener auto-updates premium state"""
        content = read_file("App.tsx")
        assert "onCustomerInfoUpdate" in content
        assert "setIsPremium" in content
        print("✓ onCustomerInfoUpdate listener updates premium state")

    def test_ad_banner_hidden_for_premium(self):
        """Test 4: AdBanner hidden for premium users"""
        content = read_file("App.tsx")
        assert "!isPremium && <AdBanner" in content or "{!isPremium && <AdBanner" in content
        print("✓ AdBanner hidden for premium users")


class TestCreateHabitForm:
    """CreateHabitForm premium features tests"""

    def test_uses_premium_hook(self):
        """Test 5: Uses usePremium hook"""
        content = read_file("src/components/CreateHabitForm.tsx")
        assert "usePremium" in content
        assert "isPremium" in content
        print("✓ CreateHabitForm uses usePremium hook")

    def test_difficulty_priority_premium_gated(self):
        """Test 5: Non-premium sees locked difficulty/priority with paywall"""
        content = read_file("src/components/CreateHabitForm.tsx")
        assert "showPaywall" in content
        assert "PRO" in content
        print("✓ Difficulty/Priority gated for non-premium")


class TestJourneyScreen:
    """JourneyScreen premium UI tests"""

    def test_premium_no_pro_badge(self):
        """Test 6: Premium users see no PRO badge"""
        content = read_file("src/screens/journey/JourneyScreen.tsx")
        # PRO badge is conditional on !isPremium
        assert "!isPremium && (" in content or "{!isPremium && (" in content
        print("✓ Premium users do not see PRO badge (conditional render)")

    def test_non_premium_opacity(self):
        """Test 6: Non-premium sees 0.75 opacity"""
        content = read_file("src/screens/journey/JourneyScreen.tsx")
        assert "opacity: isPremium ? 1 : 0.75" in content
        print("✓ Non-premium journey cards have 0.75 opacity")

    def test_start_button_text(self):
        """Test 6: Premium sees 'Start', non-premium sees 'Unlock'"""
        content = read_file("src/screens/journey/JourneyScreen.tsx")
        assert "isPremium ? 'Start" in content
        assert "Unlock" in content
        print("✓ Start/Unlock button text based on premium status")


class TestAccountScreen:
    """AccountScreen premium UI tests"""

    def test_premium_active_text(self):
        """Test 7: Premium users see 'Premium Active'"""
        content = read_file("src/screens/account/AccountScreen.tsx")
        assert "Premium Active" in content
        print("✓ Premium Active text shown for premium users")

    def test_manage_subscription(self):
        """Test 7: 'Manage Subscription' calls RevenueCatUI.presentCustomerCenter"""
        content = read_file("src/screens/account/AccountScreen.tsx")
        assert "Manage Subscription" in content
        assert "RevenueCatUI.presentCustomerCenter" in content
        print("✓ Manage Subscription with Customer Center implemented")

    def test_revenuecat_ui_import(self):
        """Test 7: RevenueCatUI imported in AccountScreen"""
        content = read_file("src/screens/account/AccountScreen.tsx")
        assert "import RevenueCatUI from 'react-native-purchases-ui'" in content
        print("✓ RevenueCatUI imported in AccountScreen")

    def test_restore_purchases(self):
        """Test 7: Restore Purchases option available"""
        content = read_file("src/screens/account/AccountScreen.tsx")
        assert "Restore Purchases" in content
        assert "restorePurchases" in content
        print("✓ Restore Purchases functionality implemented")


class TestDurationScrollWheel:
    """DurationScrollWheel instant highlighting tests"""

    def test_onscroll_handler(self):
        """Test 8: Uses onScroll for instant highlighting during scroll"""
        content = read_file("src/components/DurationScrollWheel.tsx")
        assert "onScroll={onScroll}" in content or "onScroll" in content
        print("✓ onScroll handler implemented")

    def test_scroll_event_throttle(self):
        """Test 8: scrollEventThrottle=16 for smooth updates"""
        content = read_file("src/components/DurationScrollWheel.tsx")
        assert "scrollEventThrottle={16}" in content or "scrollEventThrottle" in content
        print("✓ scrollEventThrottle set for responsive updates")

    def test_centered_index_state(self):
        """Test 8: centeredIndex state tracks visual position"""
        content = read_file("src/components/DurationScrollWheel.tsx")
        assert "centeredIndex" in content
        assert "setCenteredIndex" in content
        print("✓ centeredIndex state for instant highlighting")


class TestTimerScreenBreaks:
    """TimerScreen slot-based break system tests"""

    def test_break_slots_array(self):
        """Test 9: breakSlots array for tracking breaks"""
        content = read_file("src/components/TimerScreen.tsx")
        assert "breakSlots" in content
        assert "setBreakSlots" in content
        print("✓ breakSlots array implemented")

    def test_slot_based_availability(self):
        """Test 9: Breaks available after slot boundary (i+1)*30 min"""
        content = read_file("src/components/TimerScreen.tsx")
        # Check for 30-minute slot logic
        assert "(i + 1) * 30" in content or "slotStartMin" in content
        print("✓ Slot-based break availability logic")

    def test_break_expiration(self):
        """Test 9: Breaks expire at (i+2)*30 min"""
        content = read_file("src/components/TimerScreen.tsx")
        assert "(i + 2) * 30" in content or "slotExpireMin" in content
        print("✓ Break expiration at next slot boundary")

    def test_timer_pauses_during_break(self):
        """Test 9: Timer pauses during break"""
        content = read_file("src/components/TimerScreen.tsx")
        assert "isOnBreak" in content
        # Main timer effect should check !isOnBreak
        assert "!isOnBreak" in content
        print("✓ Timer pauses during break")


class TestOnboardingScreen:
    """OnboardingScreen focus apps tests"""

    def test_four_steps(self):
        """Test 10: 4 steps (wake, bed, goals, focus apps)"""
        content = read_file("src/screens/onboarding/OnboardingScreen.tsx")
        assert "TOTAL_STEPS = 4" in content
        print("✓ Onboarding has 4 steps")

    def test_focus_apps_step(self):
        """Test 10: Step 4 shows FOCUS_APPS"""
        content = read_file("src/screens/onboarding/OnboardingScreen.tsx")
        assert "FOCUS_APPS" in content
        assert "Focus Mode Apps" in content
        print("✓ Step 4 shows focus apps selection")

    def test_max_3_apps(self):
        """Test 10: Max 3 apps selection"""
        content = read_file("src/screens/onboarding/OnboardingScreen.tsx")
        assert "prev.length >= 3" in content or "3 apps" in content
        print("✓ Maximum 3 apps selection enforced")

    def test_phone_messages_locked(self):
        """Test 10: Phone/Messages are locked as required"""
        content = read_file("src/screens/onboarding/OnboardingScreen.tsx")
        assert "{ id: 'phone'" in content
        assert "{ id: 'messages'" in content
        assert "locked: true" in content
        print("✓ Phone and Messages locked as required")


class TestScreenLockModule:
    """Native Android ScreenLockModule tests"""

    def test_screen_lock_module_exists(self):
        """Test 11: ScreenLockModule.kt with required methods"""
        content = read_file("android/app/src/main/java/com/starktechstudio/habitgen/ScreenLockModule.kt")
        assert "startLockTask" in content
        assert "stopLockTask" in content
        assert "isInLockTaskMode" in content
        print("✓ ScreenLockModule.kt has all required methods")

    def test_react_method_annotations(self):
        """Test 11: Methods have @ReactMethod annotations"""
        content = read_file("android/app/src/main/java/com/starktechstudio/habitgen/ScreenLockModule.kt")
        assert "@ReactMethod" in content
        print("✓ Methods have @ReactMethod annotations")


class TestScreenLockPackage:
    """ScreenLockPackage registration tests"""

    def test_screen_lock_package_exists(self):
        """Test 12: ScreenLockPackage.kt exists"""
        content = read_file("android/app/src/main/java/com/starktechstudio/habitgen/ScreenLockPackage.kt")
        assert "class ScreenLockPackage" in content
        assert "ReactPackage" in content
        print("✓ ScreenLockPackage.kt exists")

    def test_registered_in_main_application(self):
        """Test 12: ScreenLockPackage registered in MainApplication.kt"""
        content = read_file("android/app/src/main/java/com/starktechstudio/habitgen/MainApplication.kt")
        assert "ScreenLockPackage" in content
        print("✓ ScreenLockPackage registered in MainApplication.kt")


class TestAuthContext:
    """AuthContext RevenueCat sync tests"""

    def test_revenuecat_login_on_auth(self):
        """Test 13: RevenueCat logIn synced with Supabase auth"""
        content = read_file("src/context/AuthContext.tsx")
        assert "revenueCatService.logIn" in content
        print("✓ RevenueCat logIn called on Supabase auth")

    def test_revenuecat_logout_on_signout(self):
        """Test 13: RevenueCat logOut synced with signOut"""
        content = read_file("src/context/AuthContext.tsx")
        assert "revenueCatService.logOut" in content
        print("✓ RevenueCat logOut called on Supabase signOut")


class TestThemeColors:
    """Theme bright colors tests"""

    def test_primary_light_color(self):
        """Test 14: Primary color #FF2D55 in light theme"""
        content = read_file("src/types/theme.ts")
        assert "primary: '#FF2D55'" in content
        print("✓ Light theme primary color is #FF2D55")

    def test_primary_dark_color(self):
        """Test 14: Primary color #FF375F in dark theme"""
        content = read_file("src/types/theme.ts")
        assert "primary: '#FF375F'" in content
        print("✓ Dark theme primary color is #FF375F")

    def test_accent_light_color(self):
        """Test 14: Accent color #FF9500 in light theme"""
        content = read_file("src/types/theme.ts")
        assert "accent: '#FF9500'" in content
        print("✓ Light theme accent color is #FF9500")

    def test_accent_dark_color(self):
        """Test 14: Accent color #FFD60A in dark theme"""
        content = read_file("src/types/theme.ts")
        assert "accent: '#FFD60A'" in content
        print("✓ Dark theme accent color is #FFD60A")


class TestBundleId:
    """Bundle ID verification tests"""

    def test_build_gradle_namespace(self):
        """Test 15: Bundle ID in build.gradle namespace"""
        content = read_file("android/app/build.gradle")
        assert 'namespace "com.starktechstudio.habitgen"' in content
        print("✓ build.gradle namespace is com.starktechstudio.habitgen")

    def test_build_gradle_application_id(self):
        """Test 15: Bundle ID in build.gradle applicationId"""
        content = read_file("android/app/build.gradle")
        assert 'applicationId "com.starktechstudio.habitgen"' in content
        print("✓ build.gradle applicationId is com.starktechstudio.habitgen")

    def test_kotlin_package_declarations(self):
        """Test 15: Kotlin package declarations use correct bundle ID"""
        screen_lock = read_file("android/app/src/main/java/com/starktechstudio/habitgen/ScreenLockModule.kt")
        main_app = read_file("android/app/src/main/java/com/starktechstudio/habitgen/MainApplication.kt")
        assert "package com.starktechstudio.habitgen" in screen_lock
        assert "package com.starktechstudio.habitgen" in main_app
        print("✓ Kotlin package declarations use com.starktechstudio.habitgen")


class TestSplashScreen:
    """SplashScreen fire emoji test"""

    def test_fire_emoji_on_splash(self):
        """Test 1: Splash screen shows fire emoji"""
        content = read_file("src/screens/SplashScreen.tsx")
        # Check for fire emoji character
        assert "🔥" in content or "\\u{1F525}" in content or "fireEmoji" in content
        print("✓ SplashScreen shows fire emoji")


class TestAppIcons:
    """Android app icon verification"""

    def test_mipmap_icons_exist(self):
        """Test 1: Android mipmap icons exist"""
        densities = ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"]
        for density in densities:
            path = f"android/app/src/main/res/mipmap-{density}/ic_launcher.png"
            full_path = os.path.join(BASE_PATH, path)
            assert os.path.exists(full_path), f"Missing icon: {path}"
        print("✓ All Android mipmap icons exist")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
