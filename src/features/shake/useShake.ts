import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export function useShake(onShake: () => void, threshold = 2.0, cooldownMs = 1500) {
  const last = useRef(0);
  const cb = useRef(onShake);

  useEffect(() => {
    cb.current = onShake;
  }, [onShake]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    Accelerometer.setUpdateInterval(100);

    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const g = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (g > threshold && now - last.current > cooldownMs) {
        last.current = now;
        cb.current();
      }
    });

    return () => sub.remove();
  }, [threshold, cooldownMs]);
}
