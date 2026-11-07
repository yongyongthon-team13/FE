// src/components/MicButton.tsx
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

const useNative = Platform.OS !== 'web';

export function MicButton({ active, onPress }: { active: boolean; onPress?: () => void }) {
  const outer = useRef(new Animated.Value(1)).current;
  const middle = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) {
      outer.stopAnimation();
      middle.stopAnimation();
      Animated.parallel([
        Animated.timing(outer, { toValue: 1, duration: 200, useNativeDriver: useNative }),
        Animated.timing(middle, { toValue: 1, duration: 200, useNativeDriver: useNative }),
      ]).start();
      return;
    }

    const pulse = (v: Animated.Value, from: number, to: number, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, { toValue: to, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: useNative }),
          Animated.timing(v, { toValue: from, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: useNative }),
        ]),
      );

    outer.setValue(0.9);
    middle.setValue(0.94);
    const anim = Animated.parallel([pulse(outer, 0.9, 1, 0), pulse(middle, 0.94, 1.04, 200)]);
    anim.start();
    return () => anim.stop();
  }, [active, outer, middle]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="다시 말하기"
      accessibilityState={{ busy: active }}
      style={styles.wrap}
    >
      <Animated.View style={[styles.circle, styles.outer, { transform: [{ scale: outer }] }]} />
      <Animated.View style={[styles.circle, styles.middle, { transform: [{ scale: middle }] }]} />
      <View style={[styles.circle, styles.inner]}>
        <Svg width={38} height={54} viewBox="0 0 38 54" fill="none">
          <Path d="M28 9C28 4.03 23.97 0 19 0C14.03 0 10 4.03 10 9V23C10 27.97 14.03 32 19 32C23.97 32 28 27.97 28 23V9Z" fill="#FFFFFF" />
          <Path d="M2.25 24C2.25 33.25 9.75 40.75 19 40.75C28.25 40.75 35.75 33.25 35.75 24" stroke="#FFFFFF" strokeWidth={4.5} strokeLinecap="round" />
          <Rect x={17} y={42} width={4} height={12} fill="#FFFFFF" />
        </Svg>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outer: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#F3F7EE',
  },
  middle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#E6EEDC',
  },
  inner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#5E8A43',
  },
});