import { useEffect, useRef, useState } from 'react';

export function useTimer(totalSeconds: number, onFinish?: () => void) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const finishRef = useRef(onFinish);

  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (endsAt === null) return;

    const tick = () => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setEndsAt(null);
        finishRef.current?.();
      }
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endsAt]);

  return {
    remaining,
    running: endsAt !== null,
    finished: remaining === 0,
    start: () => {
      if (remaining > 0) setEndsAt(Date.now() + remaining * 1000);
    },
    pause: () => setEndsAt(null),
    reset: () => {
      setEndsAt(null);
      setRemaining(totalSeconds);
    },
  };
}

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
