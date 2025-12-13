import React from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { SafeAreaPage } from '@/components/safe-area-page';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useCalendarEvents } from '@/context/calendar-events-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fromDateKey, isSameDay, startOfDay } from '@/utils/calendarUtils';

import { styles } from './anniversary-modal-screen.styles';

export default function AnniversaryModalScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const { events, upsertAnniversary, deleteAnniversary } = useCalendarEvents();
  const params = useLocalSearchParams<{ date?: string | string[] }>();

  const targetDate = React.useMemo(() => {
    const dateParam = Array.isArray(params.date) ? params.date[0] : params.date;
    if (dateParam && typeof dateParam === 'string') return startOfDay(fromDateKey(dateParam));
    return startOfDay(new Date());
  }, [params.date]);

  const existing = React.useMemo(
    () => events.find((event) => event.type === 'anniversary' && isSameDay(event.start, targetDate)),
    [events, targetDate]
  );

  const [summary, setSummary] = React.useState(existing?.summary ?? '');
  const [description, setDescription] = React.useState(existing?.description ?? '');

  React.useEffect(() => {
    setSummary(existing?.summary ?? '');
    setDescription(existing?.description ?? '');
  }, [existing?.description, existing?.summary]);

  const cardBorderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
  const inputBackgroundColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)';
  const placeholderTextColor = colorScheme === 'dark' ? 'rgba(236,237,238,0.45)' : 'rgba(17,24,39,0.45)';

  const primaryBackgroundColor = theme.tint;
  const primaryTextColor = colorScheme === 'dark' ? Colors.dark.background : '#fff';

  const handleSave = () => {
    const nextSummary = summary.trim();
    if (!nextSummary) {
      Alert.alert('请输入纪念日标题');
      return;
    }

    upsertAnniversary(targetDate, { summary: nextSummary, description });
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('删除纪念日？', '该日期的纪念日将被移除。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          deleteAnniversary(targetDate);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaPage style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        纪念日
      </ThemedText>
      <ThemedText type="subtitle" style={styles.subtitle}>
        {targetDate.toLocaleDateString()}
      </ThemedText>

      <View style={styles.form}>
        <TextInput
          value={summary}
          onChangeText={setSummary}
          placeholder="标题"
          placeholderTextColor={placeholderTextColor}
          autoFocus
          selectionColor={theme.tint}
          style={[styles.input, { borderColor: cardBorderColor, backgroundColor: inputBackgroundColor, color: theme.text }]}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="备注（可选）"
          placeholderTextColor={placeholderTextColor}
          selectionColor={theme.tint}
          style={[
            styles.input,
            styles.inputMultiline,
            { borderColor: cardBorderColor, backgroundColor: inputBackgroundColor, color: theme.text },
          ]}
          multiline
        />
      </View>

      <View style={styles.actions}>
        {existing ? (
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
