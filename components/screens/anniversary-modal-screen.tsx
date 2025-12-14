import React from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { SafeAreaPage } from '@/components/safe-area-page';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useCalendarEvents } from '@/context/calendar-events-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fromDateKey, isSameDay, startOfDay } from '@/utils/calendarUtils';
import { CalendarEvent } from '@/utils/icalUtils';

import { styles } from './anniversary-modal-screen.styles';

const pad2 = (value: number) => String(value).padStart(2, '0');

const formatTime = (date: Date) => `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

const parseTime = (value: string): { hours: number; minutes: number } | null => {
  const trimmed = value.trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23) return null;
  if (minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
};

const deriveAllDay = (event: CalendarEvent): boolean => {
  if (typeof event.allDay === 'boolean') return event.allDay;
  if (event.type !== 'anniversary') return false;
  return event.start.getHours() === 0 && event.start.getMinutes() === 0 && !event.end;
};

const toDraft = (event: CalendarEvent | null) => {
  if (!event) {
    return { summary: '', description: '', allDay: true, startTime: '', endTime: '' };
  }

  const allDay = deriveAllDay(event);
  return {
    summary: event.summary ?? '',
    description: event.description ?? '',
    allDay,
    startTime: allDay ? '' : formatTime(event.start),
    endTime: !allDay && event.end ? formatTime(event.end) : '',
  };
};

export default function AnniversaryModalScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const { events, upsertAnniversary, deleteEvent } = useCalendarEvents();
  const params = useLocalSearchParams<{ date?: string | string[] }>();

  const targetDate = React.useMemo(() => {
    const dateParam = Array.isArray(params.date) ? params.date[0] : params.date;
    if (dateParam && typeof dateParam === 'string') return startOfDay(fromDateKey(dateParam));
    return startOfDay(new Date());
  }, [params.date]);

  const anniversariesForDate = React.useMemo(
    () =>
      events
        .filter((event) => event.type === 'anniversary' && isSameDay(event.start, targetDate))
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    [events, targetDate]
  );

  const firstAnniversaryId = anniversariesForDate[0]?.id ?? null;
  const targetDateTime = targetDate.getTime();
  const [editingId, setEditingId] = React.useState<string | null>(firstAnniversaryId);

  React.useEffect(() => {
    setEditingId(firstAnniversaryId);
  }, [firstAnniversaryId, targetDateTime]);

  const editingEvent = React.useMemo(
    () => (editingId ? anniversariesForDate.find((event) => event.id === editingId) ?? null : null),
    [anniversariesForDate, editingId]
  );

  const [summary, setSummary] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [allDay, setAllDay] = React.useState(true);
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');

  const editingDraft = React.useMemo(() => toDraft(editingEvent), [editingEvent]);

  React.useEffect(() => {
    setSummary(editingDraft.summary);
    setDescription(editingDraft.description);
    setAllDay(editingDraft.allDay);
    setStartTime(editingDraft.startTime);
    setEndTime(editingDraft.endTime);
  }, [editingDraft]);

  const cardBorderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
  const cardBackgroundColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)';
  const placeholderTextColor = colorScheme === 'dark' ? 'rgba(236,237,238,0.45)' : 'rgba(17,24,39,0.45)';

  const primaryBackgroundColor = theme.tint;
  const primaryTextColor = colorScheme === 'dark' ? Colors.dark.background : '#fff';

  const validateTimed = (): boolean => {
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    if (!start || !end) {
      Alert.alert('请输入有效时间', '时间格式为 HH:MM，例如 09:30');
      return false;
    }

    const startDate = new Date(targetDate);
    startDate.setHours(start.hours, start.minutes, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(end.hours, end.minutes, 0, 0);

    if (endDate.getTime() <= startDate.getTime()) {
      Alert.alert('结束时间需晚于开始时间');
      return false;
    }

    return true;
  };

  const handleSave = () => {
    const nextSummary = summary.trim();
    if (!nextSummary) {
      Alert.alert('请输入纪念日标题');
      return;
    }

    if (!allDay && !validateTimed()) return;

    upsertAnniversary({
      id: editingEvent?.id,
      date: targetDate,
      summary: nextSummary,
      description,
      allDay,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
    });
    router.back();
  };

  const handleDelete = () => {
    if (!editingEvent) return;

    Alert.alert('删除纪念日？', '该条纪念日将被移除。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          deleteEvent(editingEvent.id);
          router.back();
        },
      },
    ]);
  };

  const handleNew = () => {
    setEditingId(null);
    const draft = toDraft(null);
    setSummary(draft.summary);
    setDescription(draft.description);
    setAllDay(draft.allDay);
    setStartTime(draft.startTime);
    setEndTime(draft.endTime);
  };

  const renderTimeLabel = (event: CalendarEvent) => {
    const isAllDay = deriveAllDay(event);
    if (isAllDay) return '全天';
    const start = formatTime(event.start);
    const end = event.end ? formatTime(event.end) : '';
    return end ? `${start}–${end}` : start;
  };

  return (
    <SafeAreaPage style={styles.container} includeBottom={false}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="title" style={styles.title}>
            纪念日
          </ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            {targetDate.toLocaleDateString()}
          </ThemedText>
        </View>

        <Pressable onPress={handleNew} style={[styles.smallButton, { backgroundColor: cardBackgroundColor }]}>
          <ThemedText type="defaultSemiBold">新增</ThemedText>
        </Pressable>
      </View>

      {anniversariesForDate.length ? (
        <View style={[styles.listCard, { borderColor: cardBorderColor, backgroundColor: cardBackgroundColor }]}>
          {anniversariesForDate.map((event) => {
            const selected = event.id === editingId;
            return (
              <Pressable
                key={event.id}
                onPress={() => setEditingId(event.id)}
                style={[
                  styles.listRow,
                  selected ? { borderColor: theme.tint, backgroundColor: `${theme.tint}14` } : { borderColor: cardBorderColor },
                ]}>
                <View style={styles.listRowTop}>
                  <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.listTitle}>
                    {event.summary}
                  </ThemedText>
                  <ThemedText style={{ color: theme.icon }}>{renderTimeLabel(event)}</ThemedText>
                </View>
                {event.description ? (
                  <ThemedText numberOfLines={1} style={{ color: theme.icon }}>
                    {event.description}
                  </ThemedText>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : (
        <ThemedText style={{ color: theme.icon }}>该日期暂无纪念日，点击“新增”创建。</ThemedText>
      )}

      <View style={[styles.form, { borderColor: cardBorderColor, backgroundColor: cardBackgroundColor }]}>
        <TextInput
          value={summary}
          onChangeText={setSummary}
          placeholder="标题"
          placeholderTextColor={placeholderTextColor}
          autoFocus
          selectionColor={theme.tint}
          style={[styles.input, { borderColor: cardBorderColor, color: theme.text }]}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="备注（可选）"
          placeholderTextColor={placeholderTextColor}
          selectionColor={theme.tint}
          style={[styles.input, styles.inputMultiline, { borderColor: cardBorderColor, color: theme.text }]}
          multiline
        />

        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => {
              setAllDay(true);
              setStartTime('');
              setEndTime('');
            }}
            style={[styles.toggle, allDay ? { backgroundColor: theme.tint } : { borderColor: cardBorderColor }]}>
            <ThemedText type="defaultSemiBold" style={{ color: allDay ? primaryTextColor : theme.text }}>
              全天
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setAllDay(false)}
            style={[styles.toggle, !allDay ? { backgroundColor: theme.tint } : { borderColor: cardBorderColor }]}>
            <ThemedText type="defaultSemiBold" style={{ color: !allDay ? primaryTextColor : theme.text }}>
              时间段
            </ThemedText>
          </Pressable>
        </View>

        <View style={[styles.timeRow, allDay ? { opacity: 0.45 } : null]}>
          <TextInput
            value={startTime}
            onChangeText={setStartTime}
            placeholder="开始 HH:MM"
            placeholderTextColor={placeholderTextColor}
            selectionColor={theme.tint}
            editable={!allDay}
            style={[styles.input, styles.timeInput, { borderColor: cardBorderColor, color: theme.text }]}
          />
          <TextInput
            value={endTime}
            onChangeText={setEndTime}
            placeholder="结束 HH:MM"
            placeholderTextColor={placeholderTextColor}
            selectionColor={theme.tint}
            editable={!allDay}
            style={[styles.input, styles.timeInput, { borderColor: cardBorderColor, color: theme.text }]}
          />
        </View>
      </View>

      <View style={styles.actions}>
        {editingEvent ? (
          <Pressable onPress={handleDelete} style={[styles.button, { backgroundColor: '#b42318' }]}>
            <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
              删除
            </ThemedText>
          </Pressable>
        ) : null}
        <Pressable onPress={handleSave} style={[styles.button, { backgroundColor: primaryBackgroundColor }]}>
          <ThemedText type="defaultSemiBold" style={{ color: primaryTextColor }}>
            保存
          </ThemedText>
        </Pressable>
      </View>
    </SafeAreaPage>
  );
}
