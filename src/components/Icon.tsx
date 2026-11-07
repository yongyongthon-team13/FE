// components/Icon.tsx
import { colors } from '@/constants/theme';
import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import Alarm from '@/assets/icons/alarm.svg';
import ArrowDown from '@/assets/icons/arrow-down.svg';
import ArrowLeft from '@/assets/icons/arrow-left.svg';
import ArrowRight from '@/assets/icons/arrow-right.svg';
import ArrowUp from '@/assets/icons/arrow-up.svg';
import Back from '@/assets/icons/back.svg';
import Bell from '@/assets/icons/bell.svg';
import Bus from '@/assets/icons/bus.svg';
import CalendarCheck from '@/assets/icons/calendar-check.svg';
import CalendarClock from '@/assets/icons/calendar-clock.svg';
import Cane from '@/assets/icons/cane.svg';
import Car from '@/assets/icons/car.svg';
import Chat from '@/assets/icons/chat.svg';
import ClipboardCheck from '@/assets/icons/clipboard-check.svg';
import Clipboard from '@/assets/icons/clipboard.svg';
import Companion from '@/assets/icons/companion.svg';
import Dot from '@/assets/icons/dot.svg';
import Edit from '@/assets/icons/edit.svg';
import FaceBad from '@/assets/icons/face-bad.svg';
import FaceGood from '@/assets/icons/face-good.svg';
import FaceGreat from '@/assets/icons/face-great.svg';
import HeatAlert from '@/assets/icons/heat-alert.svg';
import HeavySnowAlert from '@/assets/icons/heavy-snow-alert.svg';
import Home from '@/assets/icons/home.svg';
import Location from '@/assets/icons/location.svg';
import Memo from '@/assets/icons/memo.svg';
import Night from '@/assets/icons/night.svg';
import Person from '@/assets/icons/person.svg';
import Phone from '@/assets/icons/phone.svg';
import Play from '@/assets/icons/play.svg';
import PlusSquare from '@/assets/icons/plus-square.svg';
import ProfileList from '@/assets/icons/profile-list.svg';
import RainAlert from '@/assets/icons/rain-alert.svg';
import Settings from '@/assets/icons/settings.svg';
import SnowAlert from '@/assets/icons/snow-alert.svg';
import Stairs from '@/assets/icons/stairs.svg';
import Van from '@/assets/icons/van.svg';
import Walk from '@/assets/icons/walk.svg';
import Wheelchair from '@/assets/icons/wheelchair.svg';
import WindAlert from '@/assets/icons/wind-alert.svg';

const icons = {
  alarm: [Alarm, 45],
  arrowDown: [ArrowDown, 100],
  arrowLeft: [ArrowLeft, 100],
  arrowRight: [ArrowRight, 100],
  arrowUp: [ArrowUp, 100],
  back: [Back, 30],
  bell: [Bell, 100],
  bus: [Bus, 30],
  calendarClock: [CalendarClock, 30],
  calendarCheck: [CalendarCheck, 50],
  cane: [Cane, 40],
  car: [Car, 30],
  chat: [Chat, 18],
  clipboardCheck: [ClipboardCheck, 25],
  clipboard: [Clipboard, 22],
  companion: [Companion, 30],
  dot: [Dot, 20],
  edit: [Edit, 16],
  heatAlert: [ HeatAlert, 60 ],
  heavySnowAlert: [HeavySnowAlert, 60],
  home: [Home, 30],
  location: [Location, 30],
  memo: [Memo, 20],
  night: [Night, 45],
  person: [Person, 20],
  phone: [Phone, 20],
  play: [Play, 20],
  plusSquare: [PlusSquare, 20],
  profileList: [ProfileList, 30],
  rainAlert: [RainAlert, 60],
  settings: [Settings, 30],
  snowAlert: [SnowAlert, 60],
  stairs: [Stairs, 30],
  van: [Van, 20],
  walk: [Walk, 30],
  wheelchair: [Wheelchair, 30],
  windAlert: [WindAlert, 60],

  // 버튼용 아이콘
  faceGreat: [FaceGreat, 50],
  faceGood: [FaceGood, 50],
  faceBad: [FaceBad, 50],
} as const satisfies Record<string, readonly [FC<SvgProps>, number]>;

export type IconName = keyof typeof icons;

export function Icon({
  name,
  size,
  color = colors.accent,
}: {
  name: IconName;
  size?: number; // 생략하면 피그마 기본 크기
  color?: string;
}) {
  const [Svg, defaultSize] = icons[name];
  const px = size ?? defaultSize;
  return <Svg width={px} height={px} color={color} />;
}