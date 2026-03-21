# HabitGen - Product Requirements Document

## Original Problem Statement
User requested a UI/UX redesign of the HabitGen React Native habit tracking app to match provided screenshot designs, while preserving all existing functionality. Changes pushed to main branch.

## Architecture
- **Platform**: React Native (iOS + Android)
- **State Management**: React Context (HabitContext, ThemeContext, AuthContext)
- **Storage**: AsyncStorage (local), Supabase (cloud sync)
- **Premium**: RevenueCat
- **Navigation**: React Navigation (Tab + Stack)

## User Personas
- Health-conscious individuals building daily habits
- Productivity seekers tracking focus sessions
- Premium users accessing curated journeys

## Core Requirements (Static)
- Habit creation (Focus & Notify modes)
- Timer/session tracking
- Streak tracking
- History & statistics
- Curated journeys (premium)
- Dark/Light theme toggle
- Push notifications
- Sleep schedule

## What's Been Implemented - January 2026

### UI/UX Redesign (Jan 2026)
- **Theme**: New teal/mint green color palette (light: #F0F5F3 bg, #0D7377 primary, #2DD4BF accent; dark: #0A1A19 bg, #2DD4BF primary)
- **TodayScreen**: Circular progress ring, motivational cards, stats summary (streak, weekly score, habits mastered), FAB button
- **HistoryScreen**: Streak day circles (M-S), activity heatmap grid, longest streak card, total completed card
- **JourneyScreen**: SVG gradient journey cards with habit count badges, "Personalized for you" section with Smart Matching & Community Driven cards
- **TabNavigator**: Custom SVG icons (calendar, chart, sparkle, person) with active pill indicator
- **HabitCard**: Category labels (MORNING, WELLNESS, KNOWLEDGE, etc.), clean card styling with shadows
- **AccountScreen**: SVG icons replacing emojis, profile card, grouped settings sections
- **SplashScreen**: Dark teal branding
- **12 files modified, 0 functionality changes**

## Prioritized Backlog
### P0 (Critical)
- None currently

### P1 (Important)
- Journey detail screen with hero images (matching screen 4 & 9 screenshots)
- Activity heatmap click-to-view-details
- Animated transitions between screens

### P2 (Nice to have)
- Custom habit icons/emoji picker redesign
- Onboarding flow visual refresh to match new theme
- Glassmorphism effects on cards
- Micro-animations on habit completion

## Next Tasks
1. Test on physical iOS/Android devices for visual validation
2. Journey Detail screen refinement (hero image cards)
3. Add streak celebration animations
4. Onboarding screen visual refresh
