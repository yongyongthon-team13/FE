// src/lib/call.ts
import { Alert, Linking, Platform } from "react-native";

/** 전화 걸기 (번호가 없으면 안내) */
/** 전화를 걸었으면 true */
export function callPhone(
  phone: string | null | undefined,
  name = "어르신",
): boolean {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) {
    const title = "전화번호가 아직 없어요";
    const message = `${name} 앱에서 다시 로그인하면 번호가 등록돼요.`;
    if (Platform.OS === "web") window.alert(`${title}\n${message}`);
    else Alert.alert(title, message);
    return false;
  }
  Linking.openURL(`tel:${digits}`);
  return true;
}
