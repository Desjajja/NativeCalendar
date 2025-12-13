import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    gap: 10,
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
  weekdayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  gridRow: {
    gap: 8,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  cellMuted: {
    opacity: 0.35,
  },
  dayText: {
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

