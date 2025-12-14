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
    gap: 10,
  },
  viewMode: {
    marginBottom: 2,
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
    alignItems: 'flex-start',
    gap: 10,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  detailContent: {
    flex: 1,
    gap: 4,
  },
  detailTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  detailSummary: {
    flex: 1,
  },
  detailTime: {
    fontSize: 13,
  },
  detailDescription: {
    fontSize: 14,
  },
});
