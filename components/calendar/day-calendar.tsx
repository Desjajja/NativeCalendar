import React from 'react';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { addDays, startOfDay, toDateKey } from '@/utils/calendarUtils';
import { withAlpha } from '@/utils/colorUtils';
import { CalendarEvent } from '@/utils/icalUtils';

import { styles } from './day-calendar.styles';

interface DayCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onLongPressDate?: (date: Date) => void;
  events?: CalendarEvent[];
  headerRight?: React.ReactNode;
  headerAccessory?: React.ReactNode;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DayCalendar({ selectedDate, onSelectDate, onLongPressDate, events, headerRight, headerAccessory }: DayCalendarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)';
  const navButtonBackgroundColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';

  const normalizedDate = startOfDay(selectedDate);
  const dateKey = toDateKey(normalizedDate);

  const hasAnniversary = React.useMemo(
    () => (events ?? []).some((event) => event.type === 'anniversary' && toDateKey(event.start) === dateKey),
    [events, dateKey]
  );

  const hasEvent = React.useMemo(
    () => (events ?? []).some((event) => event.type !== 'anniversary' && toDateKey(event.start) === dateKey),
    [events, dateKey]
  );

  const weekday = WEEKDAY_LABELS[normalizedDate.getDay()];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => onSelectDate(addDays(normalizedDate, -1))}
          hitSlop={8}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: navButtonBackgroundColor },
            pressed ? { opacity: 0.72 } : null,
          ]}>
          <IconSymbol name="chevron.left" size={22} color={theme.icon} />
        </Pressable>

        <ThemedText type="subtitle" style={styles.headerTitle}>
          {normalizedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
        </ThemedText>

        <View style={styles.headerRight}>
          {headerRight}
          <Pressable
            onPress={() => onSelectDate(addDays(normalizedDate, 1))}
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

      <Pressable
        onPress={() => onSelectDate(normalizedDate)}
        onLongPress={() => onLongPressDate?.(normalizedDate)}
        delayLongPress={350}
        style={({ pressed }) => [
          styles.dayCard,
          { borderColor },
          { backgroundColor: withAlpha(theme.tint, 0.04) },
          pressed ? { opacity: 0.8 } : null,
        ]}>
        <View style={styles.dayTop}>
          <ThemedText style={[styles.dayNumber, { color: theme.text }]}>{normalizedDate.getDate()}</ThemedText>
          <ThemedText type="defaultSemiBold" style={[styles.weekdayText, { color: theme.icon }]}>
            {weekday}
          </ThemedText>
        </View>
        <View style={styles.markerRow}>
          {hasAnniversary ? <View style={[styles.marker, { backgroundColor: theme.tint }]} /> : null}
          {hasEvent ? <View style={[styles.marker, { backgroundColor: theme.icon }]} /> : null}
        </View>
        <ThemedText style={{ color: theme.icon }}>长按可编辑纪念日</ThemedText>
      </Pressable>
    </View>
  );
}

