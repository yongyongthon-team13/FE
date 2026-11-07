// constants/team.ts
export const palette = {
  green100: '#FFFFFF',
  green200: '#B9C9AC',
  green300: '#95AD83',
  green400: '#729259',
  green500: '#4F7730',
  green600: '#3F5F26',
  green700: '#2F471D',
  green800: '#203013',
  green900: '#10180A',
  white: '#FFFFFF',
} as const;

export const colors = {
  primary: palette.green800,
  primaryPressed: palette.green700,
  primarySoft: palette.green300,
  accent: palette.green500,
  border: palette.green500,
  borderSoft: '#DCE4D6',
  disabled: palette.green200,
  
  heading: palette.green500,
  subtle: palette.green300,
  divider: palette.green500,

  text: palette.green500,
  textSub: palette.green300,
  textOnPrimary: palette.white,

  bg: palette.white,

  warning: '#CC0000',
  endprocess: '#CC0000'
} as const;

export const shadow = {
  card: {
    shadowColor: '#213314',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  button: {
    shadowColor: '#213314',
    shadowOpacity: 0.16,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
} as const;

export const fontFamily = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

export const fontSize = {
  title: 28,
  heading: 24,
  body: 20,
  caption: 16,
  small: 14,
  button: 18,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
} as const;

export const radius = {
  base: 16,
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const touch = {
  minHeight: 56,
} as const;