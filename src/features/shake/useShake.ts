import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

/** Chama onShake quando o celular é chacoalhado (e vibra). */
export function useShake(onShake: () => void, threshold = 2.0, cooldownMs = 1500) {
  const last = useRef(0);
  const cb = useRef(onShake);
  cb.current = onShake;

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const g = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (g > threshold && now - last.current > cooldownMs) {
        last.current = now;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        cb.current();
      }
    });
    return () => sub.remove();
  }, [threshold, cooldownMs]);
}
