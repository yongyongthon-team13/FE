// src/components/guardian/styles.ts
import { StyleSheet } from 'react-native';

import { colors } from '@/constants/theme';

/** 보호자 화면 공통: 흰 바탕 + 연한 테두리 + 옅은 그림자 카드 */
export const guardianStyles = StyleSheet.create({
  softCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: '#FFFFFF',
    shadowColor: '#213314',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  pressed: { backgroundColor: '#F3F7EE' },
  smallText: { fontSize: 12, lineHeight: 16 },
  sectionTitle: { marginTop: 20, marginBottom: 8 },
});