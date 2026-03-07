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
- **Auth:** Supabase (JWT + Google OAuth via client ID 506503251834-...)
- **Monetization:** RevenueCat (react-native-purchases + react-native-purchases-ui)
  - API Key: test_ghPtiGxQAYDDKQKmwpcDeivBIHN
  - Entitlement: "HabitGen Pro"
  - Products: Monthly, Yearly (configured in RevenueCat dashboard)
  - Dashboard-managed paywall via RevenueCatUI.Paywall
  - Customer Center for subscription management
- **Ads:** Google AdMob (placeholder, hidden for premium)

## File Structure
```
/app/HabitGen/
├── android/
│   └── app/src/main/java/com/starktechstudio/habitgen/
│       ├── MainActivity.kt
│       ├── MainApplication.kt
│       ├── ScreenLockModule.kt      # Native screen pinning
│       └── ScreenLockPackage.kt     # Module registration
├── src/
│   ├── api/
│   │   ├── admob.ts
│   │   ├── revenuecat.ts            # RevenueCat service
│   │   ├── screenlock.ts            # Screen lock with native module
│   │   └── supabase.ts
│   ├── assets/logo.png              # App icon source
│   ├── components/
│   │   ├── AdBanner.tsx             # Premium-aware ad
│   │   ├── AuthScreen.tsx           # Google OAuth + email verify
│   │   ├── CreateHabitForm.tsx      # Premium-aware fields
│   │   ├── DurationScrollWheel.tsx  # Fixed highlighting
│   │   ├── EmojiPicker.tsx
│   │   ├── FocusOverlay.tsx         # iPhone-style focus mode
│   │   ├── HabitCard.tsx
│   │   ├── HabitDetailScreen.tsx
│   │   ├── PremiumScreen.tsx        # RevenueCat paywall
│   │   ├── TimerScreen.tsx          # Slot-based breaks
│   │   └── TimePickerStep.tsx
│   ├── context/
│   │   ├── AuthContext.tsx           # Syncs RevenueCat user ID
│   │   ├── HabitContext.tsx
│   │   └── ThemeContext.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── TabNavigator.tsx          # Android nav padding
│   ├── screens/
│   │   ├── account/AccountScreen.tsx  # Customer Center
│   │   ├── history/HistoryScreen.tsx
│   │   ├── journey/JourneyScreen.tsx  # Guided paths
│   │   ├── onboarding/OnboardingScreen.tsx  # 4 steps with focus apps
│   │   ├── today/TodayScreen.tsx
│   │   └── SplashScreen.tsx
│   ├── types/
│   │   ├── index.ts
│   │   └── theme.ts                   # Bright vibrant colors
│   └── utils/
│       ├── helpers.ts
│       └── storage.ts
├── App.tsx                             # PremiumContext, RevenueCat init
└── package.json
```

## Implemented Features (All Sessions)

### Session 1 - Original 15 Features
All original features implemented (single preset selection, scroll highlighting, iPhone focus UI, etc.)

### Session 2 - 9 Changes
RevenueCat placeholder, premium-aware UI, bright colors, Google OAuth, break system, etc.

### Session 3 - Current (8 Changes)
1. **App Icon** - User's logo cropped to fill mipmap-* icons. Fire emoji on splash screen.
2. **Full RevenueCat Integration** - react-native-purchases + react-native-purchases-ui with:
   - API key: test_ghPtiGxQAYDDKQKmwpcDeivBIHN
   - Entitlement: "HabitGen Pro"
   - RevenueCatUI.Paywall for dashboard-managed paywall
   - Customer Center via RevenueCatUI.presentCustomerCenter()
   - Products: Monthly + Yearly (configure in RC dashboard)
   - User ID synced with Supabase auth
3. **Premium Unlock** - onCustomerInfoUpdate auto-updates isPremium. All PRO/lock badges hidden for premium users.
4. **Native Screen Lock** - Android ScreenLockModule.kt with startLockTask()/stopLockTask(). Onboarding step 4 lets user pick 3 allowed apps.
5. **Ad Banner Fix** - Hidden for premium. Layout positioned above tab bar, not behind Android nav.
6. **DurationScrollWheel Fix** - Uses onScroll (scrollEventThrottle=16) for instant index-based highlighting. centeredIndex tracks visual position.
7. **Break System** - Slot-based: breakSlots[i] for each 30-min slot. Available after (i+1)*30 min, expires at (i+2)*30 min. Timer pauses during break.
8. **Journey Guided Paths** - Sleep journey locks phone during schedule. Other journeys set daily reminders for premium users.

## Bright Color Scheme
**Light Mode:** Primary #FF2D55, Accent #FF9500, Success #34C759
**Dark Mode:** Primary #FF375F, Accent #FFD60A, Success #30D158

## Upcoming Tasks
- P1: Supabase data synchronization for habits/streaks across devices
- P2: Push notifications for journey reminders (hydration hourly, sleep winddown)
- P2: Full responsive polish across all Android screen sizes
- P3: Journey content expansion with real notification triggers
- P3: Production RevenueCat/AdMob SDK final setup with real products
