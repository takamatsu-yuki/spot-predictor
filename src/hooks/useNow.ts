import { useEffect, useState } from "react";

/**
 * 現在時刻を1分ごとに更新する。
 *
 * 役割：
 * - now を更新し、ScheduleTable の「現在行」表示を動かす
 */
export function useNow() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return now;
}
