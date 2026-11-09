// src/hooks/useSpeechToText.ts
// 폰(웹은 크롬) 기본 음성인식으로 말을 글자로 바꿈. 녹음 파일은 서버로 보내지 않음
import { useCallback, useEffect, useState } from 'react';

// Expo Go에는 음성인식 기능이 없어서, 모듈을 못 불러와도 앱이 죽지 않게 try로 불러옴 (APK에서는 정상 동작)
type SpeechModule = typeof import('expo-speech-recognition').ExpoSpeechRecognitionModule;
let Speech: SpeechModule | null = null;
try {
  Speech = require('expo-speech-recognition').ExpoSpeechRecognitionModule;
} catch {
  Speech = null;
}

export type SpeechError = 'unavailable' | 'not-allowed' | 'no-speech' | 'failed';

/** 화면에 보여줄 안내 문구 */
export const SPEECH_ERROR_TEXT: Record<SpeechError, string> = {
  unavailable: '이 기기에서는 음성 인식을 쓸 수 없어요.\n다음 화면에서 직접 입력해 주세요',
  'not-allowed': '마이크 권한이 필요해요.\n설정에서 마이크를 허용해 주세요',
  'no-speech': '잘 듣지 못했어요.\n버튼을 누르고 다시 말씀해 주세요',
  failed: '음성 인식에 실패했어요.\n버튼을 누르고 다시 말씀해 주세요',
};

export function useSpeechToText({ autoStart = true }: { autoStart?: boolean } = {}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<SpeechError | null>(null);

  useEffect(() => {
    if (!Speech) return;
    const subs = [
      Speech.addListener('start', () => setListening(true)),
      Speech.addListener('end', () => setListening(false)),
      Speech.addListener('result', e => {
        const text = e.results[0]?.transcript ?? '';
        if (text) setTranscript(text);
      }),
      Speech.addListener('error', e => {
        setListening(false);
        if (e.error === 'aborted') return;
        if (e.error === 'not-allowed') setError('not-allowed');
        else if (e.error === 'no-speech' || e.error === 'speech-timeout') setError('no-speech');
        else if (e.error === 'language-not-supported' || e.error === 'service-not-allowed') setError('unavailable');
        else setError('failed');
      }),
    ];
    return () => {
      subs.forEach(s => s.remove());
      Speech?.abort();
    };
  }, []);

  /** 듣기 시작 (다시 말하기에도 사용) */
  const start = useCallback(async () => {
    setError(null);
    if (!Speech || !Speech.isRecognitionAvailable()) {
      setError('unavailable');
      return;
    }
    const perm = await Speech.requestPermissionsAsync();
    if (!perm.granted) {
      setError('not-allowed');
      return;
    }
    setTranscript('');
    Speech.start({ lang: 'ko-KR', interimResults: true, continuous: false });
  }, []);

  const stop = useCallback(() => Speech?.stop(), []);

  useEffect(() => {
    if (autoStart) start();
  }, [autoStart, start]);

  return { listening, transcript, error, start, stop };
}
