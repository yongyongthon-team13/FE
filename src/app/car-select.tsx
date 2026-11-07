import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';

import { getPrimaryGuardian, type Guardian } from '@/api/guardian';
import MascotHeart from '@/assets/images/mascot-heart.svg';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { Icon, type IconName } from '@/components/Icon';
import { ScreenLayout } from '@/components/ScreenLayout';
import { colors, palette } from '@/constants/theme';

type CarOption = 'taxi' | 'guardian' | 'special';

// 용인시 교통약자 이동지원센터 (용인누리) 콜센터
const SPECIAL_TRANSPORT_TEL = '16660420';

// TODO: 카카오T 딥링크 실제 동작 확인
const TAXI_APP_URL = 'kakaot://taxi';
const TAXI_STORE_URL =
  Platform.OS === 'ios'
    ? 'https://apps.apple.com/kr/app/id981110422'
    : 'https://play.google.com/store/apps/details?id=com.kakao.taxi';

export default function CarSelectScreen() {
  const [selected, setSelected] = useState<CarOption | null>(null);
  const [guardian, setGuardian] = useState<Guardian | null>(null);

  useEffect(() => {
    getPrimaryGuardian().then(setGuardian);
  }, []);

  const options: { key: CarOption; icon: IconName; title: string; summary: string }[] = [
    { key: 'taxi', icon: 'car', title: '택시 부르기', summary: '집 앞으로 바로 와요' },
    {
      key: 'guardian',
      icon: 'companion',
      title: '보호자에게 부탁하기',
      summary: guardian ? `${guardian.name} (${guardian.relation}) 에게 알림` : ' ',
    },
    { key: 'special', icon: 'wheelchair', title: '특별교통수단', summary: '휠체어 이용시 · 미리 예약 필요' },
  ];

  const callTaxi = async () => {
    try {
      await Linking.openURL(TAXI_APP_URL);
    } catch {
      await Linking.openURL(TAXI_STORE_URL);
    }
  };

  const askGuardian = async () => {
    if (!guardian) return;
    const body = '오늘 병원 가는 날인데 날씨가 안 좋아서 차로 데려다줄 수 있을까?';
    const sep = Platform.OS === 'ios' ? '&' : '?';
    try {
      await Linking.openURL(`sms:${guardian.phone}${sep}body=${encodeURIComponent(body)}`);
    } catch {
      Alert.alert('문자를 보낼 수 없어요', `${guardian.name}님께 직접 연락해주세요.`);
    }
  };

  const callSpecial = async () => {
    try {
      await Linking.openURL(`tel:${SPECIAL_TRANSPORT_TEL}`);
    } catch {
      Alert.alert('전화를 걸 수 없어요', '1666-0420 으로 직접 전화해주세요.');
    }
  };

  const handleSelect = async () => {
    if (selected === 'taxi') await callTaxi();
    if (selected === 'guardian') await askGuardian();
    if (selected === 'special') await callSpecial();
    router.replace({ pathname: '/today-condition', params: { car: selected } });
  };

  return (
    <ScreenLayout
      scroll
      bodyPaddingTop={22}
      footer={
        <AppButton
          label="선택하기"
          variant="primary"
          disabled={!selected || (selected === 'guardian' && !guardian)}
          onPress={handleSelect}
        />
      }
    >
      <View style={styles.mascot}>
        <MascotHeart width={100} height={111} />
      </View>

      <AppText variant="body" weight="bold" color={palette.green600} style={styles.title}>
        어떤 차를 부를까요?
      </AppText>

      <View style={styles.list}>
        {options.map(opt => {
          const isSelected = selected === opt.key;
          return (
            <Pressable
              key={opt.key}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setSelected(opt.key)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
            >
              <View style={styles.titleRow}>
                <Icon name={opt.icon} size={30} color={isSelected ? colors.textOnPrimary : colors.accent} />
                <AppText
                  variant="body"
                  weight="bold"
                  color={isSelected ? colors.textOnPrimary : palette.green600}
                  style={styles.titleText}
                >
                  {opt.title}
                </AppText>
              </View>
              <AppText variant="button" color={isSelected ? colors.textOnPrimary : palette.green300}>
                {opt.summary}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  mascot: { alignItems: 'center' },
  title: { marginTop: 18 },
  list: { marginTop: 22, gap: 20 },
  card: {
    minHeight: 105,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 14,
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardSelected: {
    backgroundColor: palette.green400,
    borderColor: palette.green600,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titleText: { flexShrink: 1 },
});