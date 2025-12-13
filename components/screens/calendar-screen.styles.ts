import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
  },
  detailCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  detailTitle: {
    fontSize: 16,
  },
  detailEmpty: {
    fontSize: 14,
  },
  detailList: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
