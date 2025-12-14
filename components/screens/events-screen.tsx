import React from 'react';
import { FlatList, View } from 'react-native';

import { SafeAreaPage } from '@/components/safe-area-page';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useCalendarEvents } from '@/context/calendar-events-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { startOfDay, toDateKey } from '@/utils/calendarUtils';
import { withAlpha } from '@/utils/colorUtils';
import { CalendarEvent } from '@/utils/icalUtils';

import { styles } from './events-screen.styles';

const sortByStartAsc = (a: CalendarEvent, b: CalendarEvent) => a.start.getTime() - b.start.getTime();

type EventGroup = {
  date: Date;
  events: CalendarEvent[];
};

const pad2 = (value: number) => String(value).padStart(2, '0');
const formatTime = (date: Date) => `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

const deriveAllDay = (event: CalendarEvent): boolean => {
  if (typeof event.allDay === 'boolean') return event.allDay;
  if (event.type !== 'anniversary') return false;
  return event.start.getHours() === 0 && event.start.getMinutes() === 0 && !event.end;
};

const formatEventTime = (event: CalendarEvent): string => {
  if (deriveAllDay(event)) return '全天';
  if (event.end) return `${formatTime(event.start)}–${formatTime(event.end)}`;
  return formatTime(event.start);
};

export default function EventsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const cardBorderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const cardBackgroundColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  const { events } = useCalendarEvents();
  const today = React.useMemo(() => startOfDay(new Date()), []);

  const eventGroups = React.useMemo<EventGroup[]>(() => {
    const threshold = today.getTime();
    const map = new Map<string, EventGroup>();

    events.forEach((event) => {
      const normalizedDate = startOfDay(event.start);
      if (normalizedDate.getTime() < threshold) return;

      const dateKey = toDateKey(normalizedDate);
      const entry = map.get(dateKey);

      if (entry) {
        entry.events.push(event);
      } else {
        map.set(dateKey, { date: normalizedDate, events: [event] });
      }
    });

    const groups = Array.from(map.values());
    groups.forEach((group) => group.events.sort(sortByStartAsc));
    return groups
      .filter((group) => group.events.some((event) => event.type === 'anniversary'))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, today]);

  return (
    <SafeAreaPage style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          事件
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.icon }]}>仅展示有纪念日的日期（展开查看当天事件）</ThemedText>
      </View>

      <FlatList
        data={eventGroups}
        keyExtractor={(group) => toDateKey(group.date)}
        renderItem={({ item }) => {
          const hasAnniversary = item.events.some((event) => event.type === 'anniversary');

          return (
            <View
              style={[
                styles.row,
                { borderColor: cardBorderColor, backgroundColor: cardBackgroundColor },
                hasAnniversary ? { backgroundColor: withAlpha(theme.tint, 0.08) } : null,
              ]}>
              <View style={styles.rowTop}>
                <ThemedText type="defaultSemiBold" style={styles.dateText}>
                  {item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
                </ThemedText>
                <ThemedText style={[styles.countText, { color: theme.icon }]}>
                  {item.events.length ? `${item.events.length} 条` : ''}
                </ThemedText>
              </View>

              <View style={styles.eventList}>
                {item.events.map((event) => (
                  <View key={event.id} style={styles.eventRow}>
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            event.type === 'anniversary'
                              ? theme.tint
                              : colorScheme === 'dark'
                                ? 'rgba(255,255,255,0.42)'
                                : 'rgba(0,0,0,0.32)',
                        },
                      ]}
                    />
                    <View style={styles.eventContent}>
                      <View style={styles.eventTop}>
                        <ThemedText numberOfLines={1} type="defaultSemiBold" style={styles.eventTitle}>
                          {event.summary}
                        </ThemedText>
                        <ThemedText style={[styles.eventTime, { color: theme.icon }]}>{formatEventTime(event)}</ThemedText>
                      </View>
                      {event.description ? (
                        <ThemedText numberOfLines={1} style={[styles.eventDescription, { color: theme.icon }]}>
                          {event.description}
                        </ThemedText>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <ThemedText style={{ color: theme.icon }}>暂无纪念日。请在“日历”里长按日期或点“+”添加。</ThemedText>
        }
      />
    </SafeAreaPage>
  );
}
