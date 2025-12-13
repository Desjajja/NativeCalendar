import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';

export function SafeAreaPage({
  children,
  style,
  includeBottom = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  includeBottom?: boolean;
}) {
  // Requires <SafeAreaProvider> at the app root (see `app/_layout.tsx`).
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={[
        { flex: 1, paddingTop: insets.top, paddingBottom: includeBottom ? insets.bottom : 0 },
        style,
      ]}>
      {children}
    </ThemedView>
  );
}
