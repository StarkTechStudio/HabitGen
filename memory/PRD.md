# HabitGen - Product Requirements Document

## Original Problem Statement
Build "HabitGen" - a habit-tracking app using pure React Native CLI with `ios` and `android` build folders.

## Platform & Stack
- **Framework**: React Native CLI 0.84.1, TypeScript
- **State**: React Context + AsyncStorage
- **Navigation**: React Navigation (Bottom Tabs + Native Stack)
- **Auth**: Supabase
- **Monetization**: RevenueCat (placeholder) + Google AdMob (test IDs)
- **Screen Lock**: Native module placeholder + JS focus overlay

## Project Structure
```
/app/HabitGen/
├── android/          # Android native build folder (Kotlin)
├── ios/              # iOS native build folder (Swift)
├── src/
│   ├── api/          # Supabase, RevenueCat, AdMob, ScreenLock services
│   ├── components/   # Reusable components (15 files)
│   ├── context/      # ThemeContext, HabitContext, AuthContext
│   ├── navigation/   # AppNavigator, TabNavigator
│   ├── screens/      # 5 screens (Splash, Onboarding, Today, Journey, History, Account)
│   ├── types/        # TypeScript types & theme definitions
│   └── utils/        # Storage layer, helpers
├── App.tsx           # Root component
├── index.js          # Entry point
├── package.json      # 30 source files total
└── tsconfig.json
```

## What's Implemented (ALL FEATURES)

### Core App (Phase 1) - DONE
- [x] React Native CLI project with `android/` + `ios/` folders
- [x] Splash screen with animations
- [x] 3-step onboarding (scroll wheel time pickers, goal selection)
- [x] 4-tab bottom navigation (Today, Journey, History, Account)
- [x] Dark/Light theme with persistence

### Habit Management (Phase 2) - DONE
- [x] Create/Edit/Delete habits
- [x] Full emoji picker (6 categories, 144+ emojis)
- [x] Session presets (15, 30, 45, 60 min) + Apple-style scroll wheel (5-180 min)
- [x] Premium: Difficulty levels (easy/medium/hard)
- [x] Premium: Priority goals (low/medium/high)

### Timer & Focus Mode (Phase 3) - DONE
- [x] Pomodoro timer with focus mode
- [x] Focus overlay (screen lock placeholder with full UI)
- [x] Pre-session warning popup
- [x] No pause during session - stop = streak penalty
- [x] Break system (5 min per 30 min worked)
- [x] Edit/Delete disabled while timer runs
- [x] Hardware back button blocked during focus
- [x] Streak tracking (current, longest, auto-increment/penalize)

### Auth & Sync (Phase 4) - DONE
- [x] Supabase auth (sign in / sign up / sign out)
- [x] Auth context with session management
- [x] Profile card shows auth state

### Monetization (Phase 5) - DONE
- [x] RevenueCat premium subscription flow (placeholder with full UI)
- [x] Premium paywall screen with feature list
- [x] Google AdMob banner (test IDs, hidden for premium)
- [x] Restore purchases flow

### Additional Screens - DONE
- [x] Journey screen (6 guided programs with premium badges)
- [x] History screen (7-day bar chart, session logs, habit filters)
- [x] Account screen (auth, premium, theme toggle, data management)

## TypeScript Compilation: ZERO ERRORS

## 3rd Party Integration Credentials
- Supabase URL: `https://vwgvqmysqpibkocnwihq.supabase.co`
- Supabase Key: configured in `src/api/supabase.ts`
- AdMob: Using official Google test IDs
- RevenueCat: Placeholder (replace API key for production)

## How to Build
```bash
cd /app/HabitGen
npm install
# Android
npx react-native run-android
# iOS
cd ios && pod install && cd ..
npx react-native run-ios
```

## Future Enhancements
- Full native screen lock module (Android startLockTask, iOS Guided Access)
- Push notification reminders
- Cloud data sync with Supabase
- Advanced analytics & insights
- Social features (share streaks)
