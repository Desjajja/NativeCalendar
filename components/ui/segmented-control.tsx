import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { withAlpha } from '@/utils/colorUtils';

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  accessibilityLabel?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)';
  const backgroundColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)';
  const selectedBackground = withAlpha(theme.tint, colorScheme === 'dark' ? 0.18 : 0.12);

  return (
    <View style={[styles.container, { borderColor, backgroundColor }, style]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segment,
              selected ? { backgroundColor: selectedBackground } : null,
              pressed ? { opacity: 0.76 } : null,
            ]}>
            <ThemedText type="defaultSemiBold" style={{ color: selected ? theme.text : theme.icon }}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 2,
    gap: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

