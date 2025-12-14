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
  dayCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  dayTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  dayNumber: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '700',
  },
  weekdayText: {
    fontSize: 14,
    letterSpacing: 0.6,
  },
  markerRow: {
    height: 6,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  marker: {
    width: 12,
    height: 4,
    borderRadius: 4,
  },
});

