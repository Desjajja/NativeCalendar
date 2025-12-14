import React from 'react';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { addDays, isSameDay, startOfDay, startOfWeek, toDateKey } from '@/utils/calendarUtils';
import { withAlpha } from '@/utils/colorUtils';
import { CalendarEvent } from '@/utils/icalUtils';

import { styles } from './week-calendar.styles';

interface WeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onLongPressDate?: (date: Date) => void;
  events?: CalendarEvent[];
  headerRight?: React.ReactNode;
  headerAccessory?: React.ReactNode;
}

type DayMarkers = { hasAnniversary: boolean; hasEvent: boolean };

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const buildMarkers = (events: CalendarEvent[] | undefined): Map<string, DayMarkers> => {
  const markers = new Map<string, DayMarkers>();
  if (!events) return markers;

  events.forEach((event) => {
    const dateKey = toDateKey(event.start);
    const entry = markers.get(dateKey) ?? { hasAnniversary: false, hasEvent: false };
    if (event.type === 'anniversary') entry.hasAnniversary = true;
    else entry.hasEvent = true;
    markers.set(dateKey, entry);
  });

  return markers;
};

export function WeekCalendar({
  selectedDate,
  onSelectDate,
  onLongPressDate,
  events,
  headerRight,
  headerAccessory,
}: WeekCalendarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const cellBorderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)';
  const navButtonBackgroundColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';

  const normalizedSelected = startOfDay(selectedDate);
  const weekStart = startOfWeek(normalizedSelected, 0);
  const days = React.useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const markersByDateKey = React.useMemo(() => buildMarkers(events), [events]);

  const rangeLabel = `${days[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => onSelectDate(addDays(normalizedSelected, -7))}
          hitSlop={8}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: navButtonBackgroundColor },
            pressed ? { opacity: 0.72 } : null,
          ]}>
          <IconSymbol name="chevron.left" size={22} color={theme.icon} />
        </Pressable>

        <ThemedText type="subtitle" style={styles.headerTitle}>
          {rangeLabel}
        </ThemedText>

        <View style={styles.headerRight}>
          {headerRight}
          <Pressable
            onPress={() => onSelectDate(addDays(normalizedSelected, 7))}
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: navButtonBackgroundColor },
              pressed ? { opacity: 0.72 } : null,
            ]}>
            <IconSymbol name="chevron.right" size={22} color={theme.icon} />
          </Pressable>
        </View>
      </View>

      {headerAccessory ? <View>{headerAccessory}</View> : null}

      <View style={styles.row}>
        {days.map((date, index) => {
          const dateKey = toDateKey(date);
          const markers = markersByDateKey.get(dateKey);
          const isSelected = isSameDay(date, normalizedSelected);

          return (
            <Pressable
              key={dateKey}
              onPress={() => onSelectDate(date)}
              onLongPress={() => onLongPressDate?.(date)}
              delayLongPress={350}
              style={({ pressed }) => [
                styles.dayCell,
                { borderColor: cellBorderColor },
                isSelected ? { backgroundColor: withAlpha(theme.tint, 0.12), borderColor: theme.tint } : null,
                pressed ? { opacity: 0.72 } : null,
              ]}>
              <ThemedText style={[styles.weekday, { color: theme.icon }]}>{WEEKDAY_LABELS[index]}</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.dayNumber}>
                {date.getDate()}
              </ThemedText>
              <View style={styles.markerRow}>
                {markers?.hasAnniversary ? <View style={[styles.marker, { backgroundColor: theme.tint }]} /> : null}
                {markers?.hasEvent ? <View style={[styles.marker, { backgroundColor: theme.icon }]} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
