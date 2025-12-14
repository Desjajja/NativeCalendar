import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
  },
  row: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    gap: 10,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateText: {
    fontSize: 16,
  },
  countText: {
    fontSize: 13,
  },
  eventList: {
    gap: 8,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  eventContent: {
    flex: 1,
    gap: 4,
  },
  eventTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  eventTitle: {
    flex: 1,
    fontSize: 15,
  },
  eventTime: {
    fontSize: 13,
  },
  eventDescription: {
    fontSize: 13,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  emptyText: {
    fontSize: 13,
  },
  moreText: {
    fontSize: 13,
    marginLeft: 18,
  },
});
