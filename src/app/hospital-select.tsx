import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { getClinics, SIZE_LABEL, type Clinic } from "@/api/clinics";
import { getElderProfile } from "@/api/elderProfile";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { ScreenLayout } from "@/components/ScreenLayout";
import { colors, palette } from "@/constants/theme";
import { getElderId } from "@/lib/tokenStorage";

/** 어르신 주소에서 동네(구) 뽑기. 예: '용인시 처인구 ...' → '처인구' */
async function getDistrict(): Promise<string | undefined> {
  try {
    const elderId = await getElderId();
    if (!elderId) return undefined;
    const profile = await getElderProfile(elderId);
    return profile.homeAddress?.match(/\S+구/)?.[0];
  } catch {
    return undefined; // 못 받으면 동네 없이 검색
  }
}

/** 진료과 추천: 가까운 병원 고르기 */
export default function HospitalSelectScreen() {
  const { department, symptom, when } = useLocalSearchParams<{
    department: string;
    symptom?: string;
    when?: string;
  }>();

  const [hospitals, setHospitals] = useState<Clinic[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await getClinics(department ?? "", await getDistrict());
        setHospitals(list.slice(0, 3)); // 디자인대로 3곳만
      } catch {
        setFailed(true);
        setHospitals([]);
      }
    })();
  }, [department]);

  const handleDone = () => {
    const hospital = hospitals?.find((h) => h.name === selected);
    if (!hospital) return;
    router.push({
      pathname: "/visit-confirm",
      params: {
        hospital: hospital.name,
        size: SIZE_LABEL[hospital.clinicSize ?? ""] ?? "소",
        department: department ?? "",
        symptom: symptom ?? "",
        when: when ?? "",
        lat: hospital.latitude != null ? String(hospital.latitude) : "",
        lon: hospital.longitude != null ? String(hospital.longitude) : "",
        address: hospital.address ?? "",
      },
    });
  };

  return (
    <ScreenLayout
      onBack={() => router.back()}
      eyebrow="진료과 추천"
      title={`가까운 ${department}예요\n한 곳을 골라 주세요`}
      footer={
        <AppButton
          label="완료하기"
          variant="primary"
          onPress={handleDone}
          disabled={!selected}
        />
      }
    >
      <View style={styles.list}>
        {hospitals === null && <ActivityIndicator color={colors.accent} />}

        {hospitals?.length === 0 && (
          <AppText variant="body" color={palette.green300}>
            {failed
              ? "병원 목록을 불러오지 못했어요.\n잠시 후 다시 시도해 주세요"
              : "가까운 병원을 찾지 못했어요"}
          </AppText>
        )}

        {hospitals?.map((h) => {
          const isSelected = h.name === selected;
          const stop =
            h.stopDistanceM != null ? ` · 정류장 ${h.stopDistanceM}m` : "";
          return (
            <Pressable
              key={h.name}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => setSelected(h.name)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <AppText
                variant="button"
                weight="semibold"
                color={isSelected ? "#FFFFFF" : palette.green600}
              >
                {`${h.name}${stop}`}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 40, gap: 8 },
  option: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#213314",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
});
