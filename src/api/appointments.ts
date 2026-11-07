export type AppointmentDraft = {
  hospital: string;
  date: string;
  time: string;
  department: string;
  scale: string;
};

// TODO: POST /appointment-extractions 연동
export async function extractAppointment(message: string): Promise<AppointmentDraft> {
  await new Promise(r => setTimeout(r, 1000));
  return {
    hospital: 'OO병원',
    date: '11월 4일(화)',
    time: '오전 10 : 00',
    department: '내과',
    scale: '소중대',
  };
}

export const isDraftComplete = (d: AppointmentDraft) =>
  Object.values(d).every(v => v.trim() !== '');