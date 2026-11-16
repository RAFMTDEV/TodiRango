import { Accelerometer } from "expo-sensors";
import { useEffect, useRef } from "react";
import { Vibration } from "react-native";

export function useShake(
  onShake: () => void,
  threshold = 2.0,
  cooldownMs = 1500,
) {
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

        // Primeiro vibra, depois executa o sorteio
        Vibration.vibrate(500);

        cb.current();
      }
    });

    return () => sub.remove();
  }, [threshold, cooldownMs]);
}
