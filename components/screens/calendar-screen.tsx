import React from 'react';
import { Alert, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';

import { DayCalendar } from '@/components/calendar/day-calendar';
import { Calendar as MonthCalendar } from '@/components/calendar/month-calendar';
import { WeekCalendar } from '@/components/calendar/week-calendar';
import { SafeAreaPage } from '@/components/safe-area-page';
import { ThemedText } from '@/components/themed-text';
import { IconActionButton } from '@/components/ui/icon-action-button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Colors } from '@/constants/theme';
import { useCalendarEvents } from '@/context/calendar-events-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isSameDay, startOfDay, toDateKey } from '@/utils/calendarUtils';
import { withAlpha } from '@/utils/colorUtils';
import { exportEventsToIcs, parseIcs } from '@/utils/icalUtils';

import { styles } from './calendar-screen.styles';

type CalendarViewMode = 'month' | 'week' | 'day';

const pad2 = (value: number) => String(value).padStart(2, '0');
const formatTime = (date: Date) => `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

const deriveAllDay = (event: { allDay?: boolean; type?: string; start: Date; end?: Date }): boolean => {
  if (typeof event.allDay === 'boolean') return event.allDay;
  if (event.type !== 'anniversary') return false;
  return event.start.getHours() === 0 && event.start.getMinutes() === 0 && !event.end;
};

const formatEventTime = (event: { allDay?: boolean; type?: string; start: Date; end?: Date }): string => {
  if (deriveAllDay(event)) return '全天';
  if (event.end) return `${formatTime(event.start)}–${formatTime(event.end)}`;
  return formatTime(event.start);
};

export default function CalendarScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const cardBorderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const cardBackgroundColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const actionBackgroundColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';

  const { events, mergeAnniversaries } = useCalendarEvents();
  const [selectedDate, setSelectedDate] = React.useState(startOfDay(new Date()));
  const [viewMode, setViewMode] = React.useState<CalendarViewMode>('month');
  const [monthCursorDate, setMonthCursorDate] = React.useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  React.useEffect(() => {
    if (viewMode !== 'month') return;
    setMonthCursorDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate, viewMode]);

  const selectedEvents = React.useMemo(() => {
    const selectedKey = toDateKey(selectedDate);
    return events
      .filter((event) => toDateKey(event.start) === selectedKey)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, selectedDate]);

  const openAnniversaryEditor = () => {
    // Pass the selected date into the modal via route params.
    router.push({ pathname: '/modal', params: { date: toDateKey(selectedDate) } });
  };

  const openAnniversaryEditorForDate = (date: Date) => {
    setSelectedDate(startOfDay(date));
    router.push({ pathname: '/modal', params: { date: toDateKey(date) } });
  };

  const importAnniversaries = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['text/calendar', '*/*'], copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.length) return;

      // DocumentPicker returns a file URI; we read it as text and parse as ICS.
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const parsed = parseIcs(content).filter((event) => event.type === 'anniversary');
      mergeAnniversaries(parsed);

      Alert.alert('导入成功', `已导入 ${parsed.length} 条纪念日`);
    } catch (error) {
      console.warn('Import anniversaries failed', error);
      Alert.alert('导入失败', String(error instanceof Error ? error.message : error));
    }
  };

  const exportAnniversaries = async () => {
    const anniversaries = events.filter((event) => event.type === 'anniversary');
    if (anniversaries.length === 0) {
      Alert.alert('暂无纪念日可导出');
      return;
    }

    try {
      // Generate a minimal VCALENDAR with VEVENTs.
      const icsContent = exportEventsToIcs(anniversaries);
      const baseDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
      if (!baseDirectory) {
        Alert.alert('导出失败', '当前环境不支持文件系统导出（无可用目录）。');
        return;
      }

      const fileUri = `${baseDirectory}anniversaries-${Date.now()}.ics`;
      await FileSystem.writeAsStringAsync(fileUri, icsContent, { encoding: FileSystem.EncodingType.UTF8 });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('导出成功', `文件已保存：${fileUri}`);
        return;
      }

      try {
        // iOS benefits from UTI to recognize `.ics` correctly in the share sheet.
        await Sharing.shareAsync(fileUri, { mimeType: 'text/calendar', UTI: 'com.apple.ical.ics' });
      } catch (shareError) {
        console.warn('Share failed, file kept at:', fileUri, shareError);
        Alert.alert('导出成功', `文件已保存：${fileUri}`);
      }
    } catch (error) {
      console.warn('Export anniversaries failed', error);
      Alert.alert('导出失败', String(error instanceof Error ? error.message : error));
    }
  };

  const headerRight = (
    <>
      <IconActionButton
        name="square.and.arrow.down"
        onPress={importAnniversaries}
        color={theme.icon}
        label="导入纪念日"
        backgroundColor={actionBackgroundColor}
        size={22}
        weight="semibold"
      />
      <IconActionButton
        name="square.and.arrow.up"
        onPress={exportAnniversaries}
        color={theme.icon}
        label="导出纪念日"
        backgroundColor={actionBackgroundColor}
        size={22}
        weight="semibold"
      />
      <IconActionButton
        name="plus"
        onPress={openAnniversaryEditor}
        color={theme.icon}
        label="新增纪念日"
        backgroundColor={actionBackgroundColor}
        size={22}
        weight="semibold"
      />
    </>
  );

  const headerAccessory = (
    <SegmentedControl<CalendarViewMode>
      options={[
        { value: 'month', label: '月视图', accessibilityLabel: '切换到月视图' },
        { value: 'week', label: '周视图', accessibilityLabel: '切换到周视图' },
        { value: 'day', label: '日视图', accessibilityLabel: '切换到日视图' },
      ]}
      value={viewMode}
      onChange={setViewMode}
      style={styles.viewMode}
    />
  );

  return (
    <SafeAreaPage style={styles.container}>
      <View style={[styles.card, { borderColor: cardBorderColor, backgroundColor: cardBackgroundColor }]}>
        {viewMode === 'month' ? (
          <MonthCalendar
            events={events}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onLongPressDate={openAnniversaryEditorForDate}
            headerRight={headerRight}
            headerAccessory={headerAccessory}
            cursorDate={monthCursorDate}
            onChangeCursorDate={(next) => {
              const normalized = startOfDay(next);
              setMonthCursorDate(new Date(normalized.getFullYear(), normalized.getMonth(), 1));

              setSelectedDate((prev) => {
                const sameMonth = prev.getFullYear() === normalized.getFullYear() && prev.getMonth() === normalized.getMonth();
                if (sameMonth) return prev;
                return startOfDay(new Date(normalized.getFullYear(), normalized.getMonth(), 1));
              });
            }}
          />
        ) : viewMode === 'week' ? (
          <WeekCalendar
            events={events}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onLongPressDate={openAnniversaryEditorForDate}
            headerRight={headerRight}
            headerAccessory={headerAccessory}
          />
        ) : (
          <DayCalendar
            events={events}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onLongPressDate={openAnniversaryEditorForDate}
            headerRight={headerRight}
            headerAccessory={headerAccessory}
          />
        )}
      </View>

      <View style={[styles.detailCard, { borderColor: cardBorderColor, backgroundColor: cardBackgroundColor }]}>
        <ThemedText type="defaultSemiBold" style={styles.detailTitle}>
          {selectedDate.toLocaleDateString()} {isSameDay(selectedDate, new Date()) ? '（今天）' : ''}
        </ThemedText>
        {selectedEvents.length === 0 ? (
          <ThemedText style={[styles.detailEmpty, { color: theme.icon }]}>这一天还没有事件/纪念日</ThemedText>
        ) : (
          <View style={styles.detailList}>
            {selectedEvents.map((event) => (
              <View key={event.id} style={styles.detailRow}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        event.type === 'anniversary'
                          ? withAlpha(theme.tint, 0.18)
                          : colorScheme === 'dark'
                            ? 'rgba(255,255,255,0.12)'
                            : 'rgba(0,0,0,0.06)',
                    },
                  ]}
                />
                <View style={styles.detailContent}>
                  <View style={styles.detailTop}>
                    <ThemedText numberOfLines={1} type="defaultSemiBold" style={styles.detailSummary}>
                      {event.summary}
                    </ThemedText>
                    <ThemedText style={[styles.detailTime, { color: theme.icon }]}>{formatEventTime(event)}</ThemedText>
                  </View>
                  {event.description ? (
                    <ThemedText numberOfLines={1} style={[styles.detailDescription, { color: theme.icon }]}>
                      {event.description}
                    </ThemedText>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </SafeAreaPage>
  );
}
