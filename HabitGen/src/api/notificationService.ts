import notifee, {
  AndroidImportance,
  AndroidVisibility,
  TriggerType,
  TimestampTrigger,
  AuthorizationStatus,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { Habit } from '../types';
import { storage } from '../utils/storage';
import { getLocalDateString } from '../utils/helpers';

const CHANNEL_ID = 'habitgen-notify-habits';
const CHANNEL_NAME = 'Habit Reminders';
const NOTIF_ID = (habitId: string, index: number) => `habit_${habitId}_${index}`;

export interface TimeValidationResult {
  valid: boolean;
  reason?: string;
}

class NotificationService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: CHANNEL_NAME,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        vibration: true,
        sound: 'default',
      });
    }
  }

  async requestPermission(): Promise<boolean> {
    const settings = await notifee.requestPermission();
    return (
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
    );
  }

  async hasPermission(): Promise<boolean> {
    const settings = await notifee.getNotificationSettings();
    return (
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
    );
  }

  /**
   * Validate that the notification schedule fits within wake-up to bed time.
   */
  async validateTimeWindow(habit: Habit): Promise<TimeValidationResult> {
    if (habit.habitMode !== 'notify' || !habit.notifyConfig) {
      return { valid: false, reason: 'Invalid habit config' };
    }

    const prefs = await storage.getUserPreferences();
    const { durationMinutes, frequencyCount } = habit.notifyConfig;

    if (frequencyCount <= 0 || durationMinutes <= 0) {
      return { valid: false, reason: 'Invalid frequency or duration' };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [wakeH, wakeM] = (prefs.wakeUpTime || '07:00').split(':').map(Number);
    const [bedH, bedM] = (prefs.bedTime || '23:00').split(':').map(Number);

    const wakeTime = new Date(today);
    wakeTime.setHours(wakeH, wakeM, 0, 0);

    let bedTime = new Date(today);
    bedTime.setHours(bedH, bedM, 0, 0);
    if (bedTime <= wakeTime) bedTime.setDate(bedTime.getDate() + 1);

    const startTime = now.getTime() > wakeTime.getTime() ? now : wakeTime;
    const startMs = startTime.getTime();
    const intervalMs = (durationMinutes / frequencyCount) * 60 * 1000;

    const firstTriggerMs = startMs + intervalMs;
    const lastTriggerMs = startMs + frequencyCount * intervalMs;

    if (firstTriggerMs < wakeTime.getTime()) {
      return {
        valid: false,
        reason:
          'You cannot start the notification as it is before your wake up time. Kindly adjust the duration or the frequency.',
      };
    }
    if (lastTriggerMs > bedTime.getTime()) {
      return {
        valid: false,
        reason:
          'You cannot start the notification as it exceeds the bed time. Kindly adjust the duration or the frequency.',
      };
    }

    return { valid: true };
  }

  /**
   * Mark any pending sessions whose scheduled time has passed as skipped.
   * IMPORTANT: Process the pending action queue BEFORE calling this,
   * so that user-completed sessions aren't overwritten as skipped.
   */
  async markPassedAsSkipped(): Promise<void> {
    const habits = await storage.getHabits();
    const notifyActive = habits.filter(
      h => h.habitMode === 'notify' && h.notifyConfig && h.notifyActive,
    );

    const today = getLocalDateString(new Date());
    const now = Date.now();
    const habitsWithNewSkips = new Set<string>();

    for (const habit of notifyActive) {
      const sessions = await storage.getNotificationSessionsForHabit(
        habit.id,
        today,
      );
      for (const s of sessions) {
        if (s.status === 'pending' && s.scheduledAt < now) {
          await storage.updateNotificationSession(s.id, {
            status: 'skipped',
            respondedAt: now,
          });
          habitsWithNewSkips.add(habit.id);
        }
      }
    }

    // Check 20% skip warning for any habit that got new skips
    for (const habitId of habitsWithNewSkips) {
      await this.checkSkipWarning(habitId);
    }
  }

  async checkSkipWarning(habitId: string): Promise<void> {
    const today = getLocalDateString(new Date());
    const todaySessions = await storage.getNotificationSessionsForHabit(habitId, today);
    const habits = await storage.getHabits();
    const habit = habits.find(h => h.id === habitId);
    if (!habit?.notifyConfig) return;

    const total = habit.notifyConfig.frequencyCount;
    const skippedCount = todaySessions.filter(s => s.status === 'skipped').length;
    const skipPercent = Math.round((skippedCount / total) * 100);
    const halfThreshold = Math.ceil(total * 0.5);
    const warnThreshold = Math.ceil(total * 0.2);

    await this.initialize();
    const warningChannel = 'habitgen-warnings';
    await notifee.createChannel({
      id: warningChannel,
      name: 'Habit Warnings',
      importance: AndroidImportance.HIGH,
    });

    if (skippedCount >= halfThreshold) {
      await this.cancelForHabit(habitId);

      const streak = await storage.getStreak(habitId);
      if (streak.currentStreak > 0) {
        await storage.updateStreak({
          ...streak,
          currentStreak: streak.currentStreak - 1,
        });
      }

      const habitName = habit.name;
      const habitEmoji = habit.emoji;

      const updatedHabits = habits.filter(h => h.id !== habitId);
      await storage.saveHabits(updatedHabits);
      await storage.removeNotificationSessionsForHabit(habitId, today);

      await notifee.displayNotification({
        id: `skip_warning_${habitId}_${today}`,
        title: `\u{26A0}\u{FE0F} ${habitEmoji} ${habitName}`,
        body: `Missed over 50% \u{2014} ${habitName} is gone. Time for a fresh start!`,
        android: {
          channelId: warningChannel,
          importance: AndroidImportance.HIGH,
          smallIcon: 'ic_launcher',
          pressAction: { id: 'default' },
        },
      });
      return;
    }

    if (skippedCount >= warnThreshold) {
      await notifee.displayNotification({
        id: `skip_warning_${habitId}_${today}`,
        title: `\u{26A0}\u{FE0F} ${habit.emoji} ${habit.name}`,
        body: `${skipPercent}% missed \u{2014} act now or lose your streak + habit!`,
        android: {
          channelId: warningChannel,
          importance: AndroidImportance.HIGH,
          smallIcon: 'ic_launcher',
          pressAction: { id: 'default' },
        },
      });
    }
  }

  /**
   * Schedule all notifications for a notify-mode habit for today.
   * Uses a single notification ID so each new one replaces the previous (keep one until next).
   * Auto-skips previous when next fires (handled by markPassedAsSkipped on app open).
   */
  async scheduleForHabit(habit: Habit): Promise<void> {
    if (habit.habitMode !== 'notify' || !habit.notifyConfig) return;

    await this.initialize();

    const validation = await this.validateTimeWindow(habit);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    await this.cancelForHabit(habit.id);

    const prefs = await storage.getUserPreferences();
    const { durationMinutes, frequencyCount } = habit.notifyConfig;

    const now = new Date();
    const todayStr = getLocalDateString(now);
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [wakeH, wakeM] = (prefs.wakeUpTime || '07:00').split(':').map(Number);
    const wakeTime = new Date(todayMidnight);
    wakeTime.setHours(wakeH, wakeM, 0, 0);

    const startTime = now.getTime() > wakeTime.getTime() ? now : wakeTime;
    const startMs = startTime.getTime();
    const intervalMs = (durationMinutes / frequencyCount) * 60 * 1000;

    const existingSessions = await storage.getNotificationSessionsForHabit(
      habit.id,
      todayStr,
    );

    const intervalMinRaw = durationMinutes / frequencyCount;
    let timeStr = '';
    if (intervalMinRaw >= 60) {
      const ih = Math.floor(intervalMinRaw / 60);
      const im = Math.round(intervalMinRaw % 60);
      timeStr = im > 0 ? `${ih}h ${im}m` : `${ih} hour${ih > 1 ? 's' : ''}`;
    } else if (intervalMinRaw >= 1) {
      timeStr = `${Math.round(intervalMinRaw)} minute${Math.round(intervalMinRaw) > 1 ? 's' : ''}`;
    } else {
      const secs = Math.round(intervalMinRaw * 60);
      timeStr = `${secs} second${secs > 1 ? 's' : ''}`;
    }

    let prevSessionId = '';
    let prevNotifId = '';
    for (let i = 0; i < frequencyCount; i++) {
      const triggerTime = startMs + (i + 1) * intervalMs;
      if (triggerTime <= Date.now()) {
        prevSessionId = `notif_${habit.id}_${todayStr}_${i}`;
        prevNotifId = NOTIF_ID(habit.id, i);
        continue;
      }

      const sessionId = `notif_${habit.id}_${todayStr}_${i}`;
      const existing = existingSessions.find(s => s.id === sessionId);
      if (!existing) {
        await storage.addNotificationSession({
          id: sessionId,
          habitId: habit.id,
          date: todayStr,
          scheduledAt: triggerTime,
          status: 'pending',
        });
      }

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerTime,
      };

      await notifee.createTriggerNotification(
        {
          id: NOTIF_ID(habit.id, i),
          title: `${habit.emoji} ${habit.name}`,
          body: `Time for your ${habit.name}! (${i + 1}/${frequencyCount} — every ${timeStr})`,
          android: {
            channelId: CHANNEL_ID,
            importance: AndroidImportance.HIGH,
            pressAction: { id: 'default' },
            smallIcon: 'ic_launcher',
            actions: [
              {
                title: 'Completed',
                pressAction: { id: 'completed' },
              },
              {
                title: 'Skip',
                pressAction: { id: 'skip' },
              },
            ],
          },
          data: {
            habitId: habit.id,
            sessionId,
            notifIndex: String(i),
            prevSessionId,
            prevNotifId,
            type: 'habit_reminder',
          },
        },
        trigger,
      );

      prevSessionId = sessionId;
      prevNotifId = NOTIF_ID(habit.id, i);
    }
  }

  async scheduleAllHabits(): Promise<void> {
    await this.initialize();
    await this.markPassedAsSkipped();

    const habits = await storage.getHabits();
    const notifyActive = habits.filter(
      h =>
        h.habitMode === 'notify' &&
        h.notifyConfig &&
        h.notifyActive === true,
    );

    for (const habit of notifyActive) {
      try {
        await this.scheduleForHabit(habit);
      } catch {
        // Skip if validation fails (e.g. outside time window)
      }
    }
  }

  async cancelForHabit(habitId: string): Promise<void> {
    const prefix = `habit_${habitId}_`;
    const triggerIds = await notifee.getTriggerNotificationIds();
    const toCancel = triggerIds.filter((id: string) => id.startsWith(prefix));
    for (const id of toCancel) {
      await notifee.cancelNotification(id);
    }
    // Also cancel any displayed (non-trigger) notifications for this habit
    const displayed = await notifee.getDisplayedNotifications();
    for (const n of displayed) {
      if (n.id?.startsWith(prefix)) {
        await notifee.cancelNotification(n.id);
      }
    }
  }

  async cancelAll(): Promise<void> {
    await notifee.cancelAllNotifications();
  }
}

export const notificationService = new NotificationService();
