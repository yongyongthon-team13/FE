import type { AppointmentDraft } from "@/api/appointments";
import { useSyncExternalStore } from "react";

export type Appointment = AppointmentDraft & {
  id: string;
  companion?: { service: string; manager: string };
};

let appointments: Appointment[] = []; // 서버에서 불러옴 (loadMyAppointments)
const listeners = new Set<() => void>();

export function addAppointment(draft: AppointmentDraft, serverId?: string) {
  const id = serverId ?? String(Date.now());
  appointments = [...appointments, { id, ...draft }];
  listeners.forEach((l) => l());
  return id;
}
export function useAppointments() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => appointments,
    () => appointments,
  );
}

export function setCompanion(id: string, companion: Appointment["companion"]) {
  appointments = appointments.map((a) =>
    a.id === id ? { ...a, companion } : a,
  );
  listeners.forEach((l) => l());
}

/** 서버에서 불러온 목록으로 바꾸기 */
export function setAppointments(list: Appointment[]) {
  appointments = list;
  listeners.forEach((l) => l());
}
