import type { AppointmentDraft } from '@/api/appointments';
import { useSyncExternalStore } from 'react';

export type Appointment = AppointmentDraft & {
  id: string;
  companion?: { service: string; manager: string };
};

// TODO: GET /appointments 연동 후 목업 제거
let appointments: Appointment[] = [
  {
    id: '1', hospital: 'OO병원', date: '11월 4일 (화)', time: '오전 10:00', department: '내과', scale: '소중대',
    companion: { service: '동행 서비스 · 8:30 집 앞', manager: '동행 매니저와 함께' },
  },
  {
    id: '2', hospital: 'OO병원', date: '11월 18일 (화)', time: '오전 10:00', department: '내과', scale: '소중대',
    companion: { service: '동행 서비스 · 8:30 집 앞', manager: '동행 매니저와 함께' },
  },
];
const listeners = new Set<() => void>();

export function addAppointment(draft: AppointmentDraft) {
  const id = String(Date.now());
  appointments = [...appointments, { id, ...draft }];
  listeners.forEach(l => l());
  return id;
}
export function useAppointments() {
  return useSyncExternalStore(
    cb => {
      listeners.add(cb);
      return () => { listeners.delete(cb); };
    },
    () => appointments,
    () => appointments,
  );
}

export function setCompanion(id: string, companion: Appointment['companion']) {
  appointments = appointments.map(a => (a.id === id ? { ...a, companion } : a));
  listeners.forEach(l => l());
}