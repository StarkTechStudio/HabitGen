import { DeviceEventEmitter } from 'react-native';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { storage } from '../utils/storage';
import { getLocalDateString } from '../utils/helpers';

export const NOTIF_SESSION_UPDATED = 'habitgen_notif_session_updated';

const WARNING_CHANNEL = 'habitgen-warnings';

async function ensureWarningChannel(): Promise<void> {
  await notifee.createChannel({
    id: WARNING_CHANNEL,
    name: 'Habit Warnings',
    importance: AndroidImportance.HIGH,
  });
}

/**
 * Check if skipped sessions have reached 20% threshold for a habit
 * and send a warning notification if so.
 */
async function checkSkipThresholdWarning(habitId: string): Promise<void> {
  const today = getLocalDateString(new Date());
  const todaySessions = await storage.getNotificationSessionsForHabit(habitId, today);
  const habits = await storage.getHabits();
  const habit = habits.find(h => h.id === habitId);
  if (!habit?.notifyConfig) return;

  const total = habit.notifyConfig.frequencyCount;
  const skippedCount = todaySessions.filter(s => s.status === 'skipped').length;
  const threshold = Math.ceil(total * 0.2);

  // Only warn once — exactly when we cross the 20% boundary
  if (skippedCount === threshold) {
    await ensureWarningChannel();
    await notifee.displayNotification({
      id: `skip_warning_${habitId}_${today}`,
      title: `\u{26A0}\u{FE0F} ${habit.emoji} ${habit.name} - Warning`,
      body: `You already skipped ${Math.round((skippedCount / total) * 100)}% of your habit progress. If you continue like this you will lose your streak and the habit will be automatically deleted.`,
      android: {
        channelId: WARNING_CHANNEL,
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }
}

/**
 * Handle notification events:
 * - ACTION_PRESS (Completed / Skip buttons on the notification bar)
 * - DELIVERED (new notification arrived — mark previous session as skipped if untouched)
 */
export async function handleNotificationAction(
  type: EventType,
  detail: { notification?: { id?: string; data?: Record<string, any> }; pressAction?: { id?: string } },
): Promise<void> {
  const data = detail.notification?.data || {};

  if (type === EventType.ACTION_PRESS) {
    const actionId = detail.pressAction?.id;
    let sessionId = String(data.sessionId || '');
    const habitId = String(data.habitId || '');
    if (!sessionId && habitId && data.notifIndex != null) {
      const today = getLocalDateString(new Date());
      sessionId = `notif_${habitId}_${today}_${data.notifIndex}`;
    }

    if (sessionId && (actionId === 'completed' || actionId === 'skip')) {
      const status = actionId === 'completed' ? 'completed' : 'skipped';

      await storage.updateNotificationSession(sessionId, {
        status,
        respondedAt: Date.now(),
      });

      try {
        await storage.appendPendingNotifAction({ sessionId, status });
      } catch {
        // Non-critical
      }

      if (status === 'skipped' && habitId) {
        await checkSkipThresholdWarning(habitId);
      }

      DeviceEventEmitter.emit(NOTIF_SESSION_UPDATED);
    }

    const notificationId = detail.notification?.id;
    if (notificationId) {
      await notifee.cancelNotification(notificationId);
    }
    return;
  }

  // When a new notification is DELIVERED, cancel the previous notification
  // from the bar and auto-skip its session if the user didn't act on it.
  if (type === EventType.DELIVERED) {
    const prevSessionId = String(data.prevSessionId || '');
    const prevNotifId = String(data.prevNotifId || '');
    const habitId = String(data.habitId || '');

    if (prevNotifId) {
      await notifee.cancelNotification(prevNotifId);
    }

    if (prevSessionId) {
      const allSessions = await storage.getNotificationSessions();
      const prev = allSessions.find(s => s.id === prevSessionId);
      if (prev && prev.status === 'pending') {
        await storage.updateNotificationSession(prevSessionId, {
          status: 'skipped',
          respondedAt: Date.now(),
        });

        try {
          await storage.appendPendingNotifAction({ sessionId: prevSessionId, status: 'skipped' });
        } catch {
          // Non-critical
        }

        if (habitId) {
          await checkSkipThresholdWarning(habitId);
        }

        DeviceEventEmitter.emit(NOTIF_SESSION_UPDATED);
      }
    }
  }
}
