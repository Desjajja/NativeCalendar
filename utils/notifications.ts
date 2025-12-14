import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { CalendarEvent } from '@/utils/icalUtils';
import { startOfDay } from '@/utils/calendarUtils';

/**
 * Local reminders via `expo-notifications`.
 *
 * Notes:
 * - This is local-only (no backend, no push token).
 * - Notifications can still fire when the app is closed.
 * - iOS Simulator behavior can differ from a real device.
 */

let androidChannelReady = false;

export const ensureNotificationHandler = () => {
  // Show alerts while app is in foreground.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
};

const ensureAndroidChannel = async () => {
  if (Platform.OS !== 'android' || androidChannelReady) return;

  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });

  androidChannelReady = true;
};

export const ensureReminderPermissions = async (): Promise<boolean> => {
  await ensureAndroidChannel();

  const status = await Notifications.getPermissionsAsync();
  if (status.granted) return true;

  const request = await Notifications.requestPermissionsAsync();
  return request.granted;
};

export const getReminderTriggerDate = (event: CalendarEvent): Date | null => {
  if (!event.reminderEnabled) return null;

  const now = Date.now();
  const isAllDay = event.allDay ?? event.type === 'anniversary';

  if (isAllDay) {
    const base = startOfDay(event.start);
    const trigger = new Date(base);
    trigger.setHours(9, 0, 0, 0);
    return trigger.getTime() > now ? trigger : null;
  }

  const minutesBefore = event.reminderMinutesBefore ?? 0;
  const trigger = new Date(event.start.getTime() - minutesBefore * 60 * 1000);
  return trigger.getTime() > now ? trigger : null;
};

export const scheduleReminder = async (event: CalendarEvent): Promise<string | null> => {
  const triggerDate = getReminderTriggerDate(event);
  if (!triggerDate) return null;

  const pad2 = (value: number) => String(value).padStart(2, '0');
  const formatTime = (date: Date) => `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

  const bodyParts: string[] = [];
  if (event.description) bodyParts.push(event.description);
  bodyParts.push(event.allDay ? '全天 · 09:00' : formatTime(event.start));

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: event.summary || 'Reminder',
      body: bodyParts.filter(Boolean).join(' · '),
      data: { eventId: event.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: 'reminders',
    },
  });

  return id;
};

export const cancelReminder = async (notificationId?: string) => {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.warn('Failed to cancel notification', notificationId, error);
  }
};
