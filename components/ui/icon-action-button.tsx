import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

export function IconActionButton({
  name,
  onPress,
  color,
  label,
  backgroundColor,
  size = 20,
}: {
  name: Parameters<typeof IconSymbol>[0]['name'];
  onPress: () => void;
  color: string;
  label: string;
  backgroundColor?: string;
  size?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        backgroundColor ? { backgroundColor } : null,
        pressed ? styles.buttonPressed : null,
      ]}
      hitSlop={8}>
      <IconSymbol name={name} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.72,
  },
});

