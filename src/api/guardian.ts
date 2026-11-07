export type Guardian = {
  name: string;
  relation: string;
  phone: string; // 숫자만, 예: '01012345678'
};

// TODO: 온보딩에서 입력한 보호자 정보(첫 번째 보호자)로 교체
export async function getPrimaryGuardian(): Promise<Guardian | null> {
  await new Promise(r => setTimeout(r, 200));
  return { name: '김민수', relation: '아들', phone: '01012345678' };
}