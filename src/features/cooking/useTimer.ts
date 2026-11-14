import { useEffect, useState } from 'react';

export function useTimer(initialSeconds: number) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { setRunning(false); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  return {
    remaining, running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: (s = initialSeconds) => { setRunning(false); setRemaining(s); },
  };
}
