import React, { useMemo } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { generateCalendar, isSameDay, startOfDay, toDateKey } from '@/utils/calendarUtils';
import { withAlpha } from '@/utils/colorUtils';
import { CalendarEvent } from '@/utils/icalUtils';

import { styles } from './month-calendar.styles';

interface MonthCalendarProps {
  initialDate?: Date;
  events?: CalendarEvent[];
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  onLongPressDate?: (date: Date) => void;
  headerRight?: React.ReactNode;
}

type DayMarkers = { hasAnniversary: boolean; hasEvent: boolean };

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

export function Calendar({
  initialDate = new Date(),
  events,
  selectedDate,
  onSelectDate,
  onLongPressDate,
  headerRight,
}: MonthCalendarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const cellBorderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)';
  const mutedTextColor = colorScheme === 'dark' ? 'rgba(236,237,238,0.45)' : '#6b7280';
  const navButtonBackgroundColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';

  const [cursor, setCursor] = React.useState(startOfDay(initialDate));
  const weeks = useMemo(() => generateCalendar(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const days = useMemo(() => weeks.flat(), [weeks]);
  const markersByDateKey = useMemo(() => buildMarkers(events), [events]);
  const today = useMemo(() => startOfDay(new Date()), []);

  const handlePrev = () => setCursor((prev) => startOfDay(new Date(prev.getFullYear(), prev.getMonth() - 1, 1)));
  const handleNext = () => setCursor((prev) => startOfDay(new Date(prev.getFullYear(), prev.getMonth() + 1, 1)));

  const lastLongPressDateKey = React.useRef<string | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={handlePrev}
          hitSlop={8}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: navButtonBackgroundColor },
            pressed ? { opacity: 0.72 } : null,
          ]}>
          <IconSymbol name="chevron.left" size={22} color={theme.icon} />
        </Pressable>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </ThemedText>
        <View style={styles.headerRight}>
          {headerRight}
          <Pressable
            onPress={handleNext}
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

      <View style={styles.weekdayRow}>
        {/* Use index in the key because labels repeat ("S", "T"). */}
        {WEEKDAYS.map((label, index) => (
          <ThemedText
            key={`${label}-${index}`}
            type="defaultSemiBold"
            style={[styles.weekdayText, { color: theme.icon }]}>
            {label}
          </ThemedText>
        ))}
      </View>

      <FlatList
        data={days}
        renderItem={({ item }) => {
          const date = startOfDay(item.date);
          const dateKey = toDateKey(date);
          const markers = markersByDateKey.get(dateKey);

          const isToday = isSameDay(date, today);
          const isSelected = !!selectedDate && isSameDay(date, selectedDate);

          return (
            <Pressable
              onPress={() => {
                if (lastLongPressDateKey.current === dateKey) {
                  lastLongPressDateKey.current = null;
                  return;
                }
                onSelectDate?.(date);
                if (!item.isCurrentMonth) setCursor(startOfDay(new Date(date.getFullYear(), date.getMonth(), 1)));
              }}
              onLongPress={() => {
                lastLongPressDateKey.current = dateKey;
                onLongPressDate?.(date);
              }}
              delayLongPress={350}
              style={({ pressed }) => [
                styles.cell,
                { borderColor: cellBorderColor },
                !item.isCurrentMonth && styles.cellMuted,
                isSelected && { backgroundColor: withAlpha(theme.tint, 0.12) },
                isToday && { borderColor: theme.tint },
                pressed && { opacity: 0.72 },
              ]}>
              <ThemedText
                type="defaultSemiBold"
                style={[
                  styles.dayText,
                  !item.isCurrentMonth && { color: mutedTextColor },
                  isToday && { color: theme.tint },
                ]}>
                {date.getDate()}
              </ThemedText>
              <View style={styles.markerRow}>
                {markers?.hasAnniversary ? <View style={[styles.marker, { backgroundColor: theme.tint }]} /> : null}
                {markers?.hasEvent ? <View style={[styles.marker, { backgroundColor: theme.icon }]} /> : null}
              </View>
            </Pressable>
          );
        }}
        keyExtractor={(item) => item.date.toISOString()}
        numColumns={7}
        scrollEnabled={false}
        columnWrapperStyle={styles.gridRow}
      />
    </View>
  );
}
