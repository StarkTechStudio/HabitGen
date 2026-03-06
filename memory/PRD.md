# HabitGen - Product Requirements Document

## Original Problem Statement
Build a habit-tracking Android and iOS application named "HabitGen" using pure React Native CLI (not Expo), generating both `ios` and `android` build folders.

## App Overview
**HabitGen** is a goal-based habit tracker with Pomodoro-style timers, streak tracking, premium journeys, and dark/light theme support.

## Platform
- **Framework**: React Native CLI (0.84.1)
- **Language**: TypeScript
- **State**: React Context + AsyncStorage (local-first)
- **Navigation**: React Navigation (Bottom Tabs + Native Stack)
- **Auth**: Supabase (optional)
- **Monetization**: RevenueCat (placeholder) + Google AdMob (test IDs)

## Core Features

### Navigation (4 Tabs)
- **Today** - Dashboard with habits list, stats, streaks
- **Journey** - Premium guided programs
- **History** - Charts, session logs, filters
- **Account** - Profile, settings, theme toggle, auth

### Onboarding
- 3-step flow: Wake-up time → Bed time → Goal selection
- Apple-style scroll wheel time pickers
- Saves to AsyncStorage

### Habit Management
- Create/Edit/Delete habits
- Full emoji picker (6 categories, 144+ emojis)
- Session duration presets (15, 30, 45, 60 min)
- Custom duration with Apple-style scroll wheel (5-180 min)
- Premium: Difficulty level (easy/medium/hard)
- Premium: Priority goals (low/medium/high)
- Edit/Delete disabled while timer running

### Timer System
- Pomodoro-style with focus mode
- Warning popup before starting
- No pause button during session
- Stop = streak penalty (with confirmation)
- Break system: 5 min per 30 min worked
- Progress indicator (circular + bar)

### Streak Tracking
- Current streak + longest streak
- Fire emoji indicator
- Penalize on early stop
- Auto-increment on session complete

### Theme System
- Dark mode (default) / Light mode
- Toggle in Account screen
- Persisted in AsyncStorage

## Data Schema (AsyncStorage)
- **UserPreferences**: wakeUpTime, bedTime, defaultGoal, theme, onboardingComplete, isPremium
- **Habits**: id, name, emoji, sessionPresets, customDuration, difficulty?, priority?
- **HabitSessions**: id, habitId, startTime, endTime, duration, completed, date
- **Streaks**: habitId, currentStreak, longestStreak, lastCompletedDate

## 3rd Party Integrations
- **Supabase**: URL: `https://vwgvqmysqpibkocnwihq.supabase.co` (auth + sync, placeholder)
- **RevenueCat**: Premium subscriptions (placeholder)
- **Google AdMob**: Free tier ads (test IDs)

---

## What's Been Implemented (Phase 1 + Phase 2 + Phase 3 Core)

### Date: Feb 2026

**Phase 1 - Core Setup & Navigation** ✅
- [x] React Native CLI project initialized (v0.84.1, TypeScript)
- [x] `android/` and `ios/` folders generated
- [x] All dependencies installed (React Navigation, AsyncStorage, Supabase, etc.)
- [x] Splash screen with animations
- [x] 3-step onboarding (wake time, bed time, goals)
- [x] 4-tab bottom navigation (Today, Journey, History, Account)
- [x] Dark/Light theme system with persistence
- [x] AsyncStorage utility layer

**Phase 2 - Habit Management** ✅
- [x] Create/Edit/Delete habits
- [x] Full emoji picker (6 categories, 144+ emojis)
- [x] Session duration presets (15, 30, 45, 60 min)
- [x] Apple-style scroll wheel for custom duration
- [x] Premium difficulty & priority settings
- [x] Habit detail screen with stats

**Phase 3 - Timer & Streaks** ✅
- [x] Timer with focus mode UI
- [x] Pre-session warning popup
- [x] Early stop = streak penalty with confirmation
- [x] Break system (5 min per 30 min)
- [x] Edit/Delete disabled during timer
- [x] Streak tracking (current, longest, auto-increment)
- [x] Pulse animation on running timer

**Additional Screens** ✅
- [x] Journey screen (6 guided programs, premium badges)
- [x] History screen (7-day bar chart, session logs, filters)
- [x] Account screen (theme toggle, auth placeholder, data management)

**TypeScript**: Zero compilation errors ✅

---

## Upcoming Tasks

### P1: Screen Lock During Timer (Native Module)
- Research native modules for app pinning/screen lock
- Implement permission request flow
- Lock screen during timer sessions

### P1: Supabase Authentication
- Sign in/Sign up from Account screen
- Data sync between devices
- Profile management

### P2: RevenueCat Integration
- Premium subscription flow
- Gate difficulty/priority behind premium
- Gate premium journeys

### P2: Google AdMob
- Banner ads on free tier
- Test IDs implementation

### P3: Polish & Testing
- Unit tests
- E2E test suite
- Performance optimization
- Accessibility audit
