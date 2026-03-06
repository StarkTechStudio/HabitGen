# HabitGen - PRD & Progress

## Problem Statement
Build HabitGen, a goal-based habit tracker app (originally Android/Kotlin, pivoted to React web with mobile-first design for cross-platform). Features include habit tracking with streaks, pomodoro-style timers, journey system, onboarding flow, history analytics, Supabase auth, RevenueCat payments (mocked), AdMob ads (placeholder).

## Architecture
- **Frontend**: React 18 + Tailwind CSS + Recharts + Lucide React
- **Backend**: FastAPI (Python) with Supabase auth proxy
- **Auth**: Supabase (email/password)
- **Storage**: localStorage (offline-first design)
- **Payments**: RevenueCat (MOCKED - toggles premium state locally)
- **Ads**: AdMob (NOT YET IMPLEMENTED - placeholder)

## User Personas
- Young adults building habits (students, professionals)
- Productivity enthusiasts (pomodoro users)
- Goal-oriented users wanting streak motivation

## Core Requirements (Static)
- [x] Splash screen with pledge text (2.5s auto-redirect)
- [x] 3-step onboarding (wake time, bed time, goals multi-select)
- [x] Today dashboard with habit cards, streaks, progress
- [x] Timer system (work/break, pause/resume/stop, persistence)
- [x] 80% completion threshold for timer sessions
- [x] Streak system with fire emoji
- [x] Journey tab (premium-gated)
- [x] Login with Supabase email auth
- [x] History with 7-day chart, stats, session log
- [x] Account with settings, subscription status, clear data
- [x] Paywall modal (monthly/yearly plans)
- [x] Bottom navigation (5 tabs)
- [x] Dark theme with orange/fire accent
- [x] Offline-first localStorage
- [x] Mobile-first responsive design (max 430px)

## What's Been Implemented (March 6, 2026)
### MVP - All Core Features
- Full onboarding flow with time pickers and goal selection
- Habit CRUD (add, complete, delete)
- Streak tracking with fire emoji animation
- Pomodoro timer with work/break modes, persistence
- 5-tab bottom navigation with glassmorphism
- Journey screen with sample journeys + premium gate
- Email auth via Supabase (signup/login)
- History with recharts bar graph + stats
- Account settings with notification toggle
- Paywall with pricing display
- Backend: health check, auth proxy endpoints

### Testing: 92% pass rate (iteration_1)

## Prioritized Backlog
### P0 (Critical - Next)
- [ ] AdMob banner/video ad integration for free tier
- [ ] RevenueCat actual SDK integration

### P1 (High)
- [ ] Notification reminders (Web Notifications API)
- [ ] Smart reminders based on wake/sleep time
- [ ] Timer state restoration on page reload (partially done via localStorage)
- [ ] Data sync to Supabase when logged in

### P2 (Medium)
- [ ] Weekly habit analytics
- [ ] Streak freeze feature
- [ ] Social streak sharing
- [ ] OAuth login (Google)
- [ ] Journey progress persistence
- [ ] Custom journey creation

### P3 (Low/Future)
- [ ] React Native (Expo) port for native mobile
- [ ] Home screen widgets
- [ ] Light mode toggle
- [ ] Export data feature
- [ ] Multi-language support

## Next Tasks
1. Implement AdMob ad placeholders (banner in footer, video after timer)
2. Add Web Notification reminders
3. Sync data to Supabase when user is logged in
4. Port to React Native (Expo) for native builds
