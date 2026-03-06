# HabitGen - Product Requirements Document

## Overview
**App Name:** HabitGen
**Platform:** React Native CLI (iOS + Android)
**Bundle ID:** com.starktechstudio.habitgen
**Description:** A goal-based habit tracker with focus timers, streak tracking, and premium journeys.

## Core Architecture
- **Framework:** React Native CLI with TypeScript
- **Navigation:** React Navigation (4 tabs: Today, Journey, History, Account)
- **State Management:** React Context (AuthContext, ThemeContext, HabitProvider)
- **Local Storage:** AsyncStorage
- **Auth:** Supabase (JWT + Google OAuth placeholder)
- **Monetization:** RevenueCat (placeholder), Google AdMob (test IDs)

## File Structure
```
/app/HabitGen/src/
├── api/           # admob, revenuecat, screenlock, supabase
├── assets/        # logo.png
├── components/    # Reusable components (13 files)
├── context/       # AuthContext, HabitContext, ThemeContext
├── navigation/    # AppNavigator, TabNavigator
├── screens/       # today/, history/, journey/, account/, onboarding/
├── types/         # Type definitions, theme
└── utils/         # helpers, storage
```

## Implemented Features (All 15 User Requirements)

### 1. Single Selection for Preset Time
- CreateHabitForm uses single `selectedPreset` state (not array)
- Only one duration can be selected at a time

### 2. Custom Duration Scroll Highlighting
- DurationScrollWheel highlights selected value with larger font, bold weight
- Selection overlay bar with primary color tint

### 3. Modern iPhone-Style Focus Mode UI
- FocusOverlay redesigned with dark theme, rotating ring animation
- iOS-style status pill at top
- Circular timer island with pulse animation
- Allowed/blocked apps info cards

### 4. Difficulty & Priority as Disabled PRO Fields
- Fields visible but disabled (opacity 0.45)
- Tapping opens PremiumScreen paywall
- Lock overlay with "Upgrade to PRO" message

### 5. Journey Tab with Pain Points & Paywall
- 10 guided journeys with real pain points
- All locked with PRO badge
- Tapping shows journey details + paywall option
- Hydration journey includes hourly reminder concept

### 6. History Tab Fixes
- Chart shows last 7 days with visible empty bars
- Duration displayed as "X min" (not "Xm")
- Recent sessions deduplicated (one per habit, latest)
- No quit button on sessions
- Chart summary shows total sessions and minutes

### 7. Extended Emoji Library
- Activities: dancing, boxing, horse riding, bike riding, coding, trading, content creation
- 7 emoji categories with 25+ emojis each
- GOALS list expanded to 18 options

### 8. Data Management
- No "Export Data" option
- "Clear All Data" removes ALL habits, sessions, streaks, timer, preferences
- Confirmation dialog before clearing

### 9. Google OAuth
- AuthScreen has "Continue with Google" button
- Supabase OAuth integration (native module setup needed)
- Email/password fallback available

### 10. Bundle ID
- Android: com.starktechstudio.habitgen (build.gradle + Kotlin files)
- iOS: com.starktechstudio.habitgen (Xcode project)

### 11. Dynamic Text & Android Nav Bar
- scaleFontSize utility for responsive text
- TabNavigator has Platform-specific padding (Android: 68px height, 12px bottom padding)
- Elevation for Android tab bar

### 12. Today Tab Fixed Header
- Header (greeting, stats, "Your Habits" label) is fixed
- Only habit cards are scrollable
- Pull-to-refresh on habit list

### 13. History Tab Fixed Header
- Header (title, filters, chart) is fixed
- Only "Recent Sessions" section scrolls

### 14. Timer Lock Screen Popup
- Start popup explains: screen lock, allowed apps, blocked apps, streak penalty
- Stop popup warns about streak loss
- Session completion unlocks screen + increases streak

### 15. 30-Minute Break System
- Break offered every 30 minutes during focus
- 30-second acceptance window
- Auto-expires if not taken
- New break offered at next 30-min mark

## Mocked/Placeholder Features
- **RevenueCat:** Purchase flow is simulated
- **Google AdMob:** Placeholder banner
- **Screen Lock:** UI overlay only (native pinning requires native module)
- **Google OAuth:** Alert with setup instructions (needs native SDK)

## Upcoming Tasks
- P0: Native screen lock module for Android/iOS
- P1: Supabase data synchronization
- P2: UI/UX responsive polish
- P3: Journey content expansion with real notifications
