// src/lib/parseSpeech.ts
// 음성인식 결과(글자)를 값으로 정리

const DIGIT: Record<string, number> = { 영: 0, 공: 0, 일: 1, 이: 2, 삼: 3, 사: 4, 오: 5, 육: 6, 칠: 7, 팔: 8, 구: 9 };
const UNIT: Record<string, number> = { 십: 10, 백: 100, 천: 1000 };

/** '천구백오십이' → 1952 (만 단위 이하) */
function koreanToNumber(text: string): number | null {
  let total = 0;
  let num = 0;
  let seen = false;
  for (const ch of text) {
    if (ch in DIGIT) {
      num = DIGIT[ch];
      seen = true;
    } else if (ch in UNIT) {
      total += (num || 1) * UNIT[ch];
      num = 0;
      seen = true;
    } else if (seen) {
      break;
    }
  }
  return seen ? total + num : null;
}

/** '1952년생', '52년생', '천구백오십이년' → 1952 / 못 알아들으면 '' */
export function parseBirthYear(text: string): string {
  const now = new Date().getFullYear();
  const four = text.match(/(19|20)\d{2}/);
  if (four) return four[0];
  const two = text.match(/(\d{2})\s*년/);
  if (two) return String(1900 + Number(two[1]));
  const kor = koreanToNumber(text.replace(/\s/g, ''));
  if (kor && kor >= 1900 && kor <= now) return String(kor);
  if (kor && kor < 100) return String(1900 + kor);
  return '';
}

/** 앞뒤 공백·마침표 정리 */
export function cleanText(text: string): string {
  return text.trim().replace(/[.。]+$/, '');
}

/** '김영자입니다', '김영자예요' → '김영자' */
export function parseName(text: string): string {
  return cleanText(text).replace(/\s*(입니다|이에요|예요|이요)$/, '').trim();
}
