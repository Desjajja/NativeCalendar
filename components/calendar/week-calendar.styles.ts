import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  dayCell: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  weekday: {
    fontSize: 12,
    letterSpacing: 0.6,
  },
  dayNumber: {
    fontSize: 16,
    lineHeight: 18,
  },
  markerRow: {
    height: 6,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  marker: {
    width: 10,
    height: 4,
    borderRadius: 4,
  },
});

