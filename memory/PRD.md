# HabitGen - Product Requirements Document

## Overview
**App Name:** HabitGen  
**Platform:** React Native CLI (iOS + Android)  
**Bundle ID:** com.starktechstudio.habitgen  
**Description:** A goal-based habit tracker with focus timers, streak tracking, and premium journeys.

## Core Architecture
- **Framework:** React Native CLI with TypeScript
- **Navigation:** React Navigation (4 tabs: Today, Journey, History, Account)
- **State Management:** React Context (AuthContext, ThemeContext, HabitProvider, PremiumContext)
- **Local Storage:** AsyncStorage
- **Auth:** Supabase (JWT + Google OAuth via client ID)
- **Monetization:** RevenueCat (react-native-purchases + react-native-purchases-ui) with default dashboard paywall
- **Ads:** Google AdMob (placeholder)

## File Structure
```
/app/HabitGen/src/
├── api/           # admob, revenuecat, screenlock, supabase
├── assets/        # logo.png (app icon)
├── components/    # 13 reusable components
├── context/       # AuthContext, HabitContext, ThemeContext
├── navigation/    # AppNavigator, TabNavigator
├── screens/       # today/, history/, journey/, account/, onboarding/
├── types/         # Type definitions, theme
└── utils/         # helpers (scaleFontSize), storage
```

## Key Integrations
- **RevenueCat:** API key `test_ghPtiGxQAYDDKQKmwpcDeivBIHN`, entitlement: `premium`, uses RevenueCatUI.Paywall for dashboard-managed paywall
- **Supabase Auth:** URL `https://vwgvqmysqpibkocnwihq.supabase.co`, Google OAuth client ID `506503251834-mvkrt8qs19g7eufms57mratf1r3rn1cp.apps.googleusercontent.com`
- **Google AdMob:** Placeholder with test IDs

## Implemented Features

### Session 1 (Original 15 features)
1. Single selection for preset time in CreateHabitForm
2. Custom duration scroll highlighting in DurationScrollWheel
3. Modern iPhone-style Focus Mode UI in FocusOverlay
4. Difficulty/Priority disabled for non-premium with paywall
5. Journey tab with pain points and paywall for non-premium
6. History chart + "X min" format, deduplicated sessions
7. Extended emojis (18 categories including trading, dancing, boxing, etc.)
8. Clear All Data removes everything (no Export option)
9. Google OAuth button in AuthScreen
10. Bundle ID: com.starktechstudio.habitgen
11. Dynamic text sizing + Android nav bar spacing
12. Today tab fixed header with scrollable habits
13. History tab fixed header with scrollable sessions
14. Timer lock screen popup with allowed/blocked apps
15. 30-min break system with expiry

### Session 2 (9 new changes)
1. **App Logo:** User's uploaded logo used as Android/iOS app icon (mipmap-*). Fire emoji on splash screen.
2. **RevenueCat Integration:** react-native-purchases + react-native-purchases-ui with test API key. Dashboard-managed paywall via RevenueCatUI.Paywall component.
3. **Premium-Aware UI:** PRO badges and lock icons hidden for premium users. Difficulty/Priority fields functional for premium. Journey cards show full opacity with "Start" button for premium.
4. **DurationScrollWheel Fix:** Uses onMomentumScrollEnd for precise snap detection. Value-based highlighting (no lag).
5. **Bright Color Scheme:** Vibrant colors inspired by HabitKit - primary #FF2D55/#FF375F, accent #FF9500/#FFD60A. Both dark and light modes supported.
6. **Ad Banner Positioning:** Hidden for premium users. Positioned above tab bar (which already has Android nav padding).
7. **Google OAuth via Supabase:** signInWithOAuth with Google client ID. Email verification flow with dedicated verify screen, resend option, and login-after-verify check.
8. **Break Button System:** Slot-based breaks (1 per 30 min). Break button shown as overlay during focus. Timer pauses during break with countdown. Breaks per session = floor(duration/30).
9. **Timer Lock Screen Flow:** Start popup explains screen lock, allowed apps (Phone, SMS), blocked apps (social media). Stop popup warns about streak loss. Completion unlocks screen + adds streak.

## MOCKED Features
- **RevenueCat:** Uses test API key (no real purchases)
- **Google AdMob:** Placeholder banner (no real ads)
- **Screen Lock:** UI overlay only (native pinning requires native module)
- **Google OAuth:** Needs native SDK setup for actual deep linking

## Upcoming Tasks
- P0: Native screen lock module (Android startLockTask / iOS Guided Access)
- P1: Supabase data sync for habits/streaks across devices
- P2: Hydration journey with push notifications and hourly reminders
- P3: UI/UX responsive polish across Android screen sizes
