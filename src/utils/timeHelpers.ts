import { timeToMinutes, minutesToTime } from "./time";

/**
 * クールタイム逆算
 * 現在時刻 + 残りクールタイム - 3時間
 */
export function reverseCooldown(now: Date, remainingMinutes: number): string {
  const cooldownMinutes = 180; // 3時間
  const joined = new Date(
    now.getTime() + remainingMinutes * 60000 - cooldownMinutes * 60000,
  );

  const hh = joined.getHours().toString().padStart(2, "0");
  const mm = joined.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * 時刻を最も近い 25分刻みに丸める
 */
export function roundTo25Minutes(time: string): string {
  const total = timeToMinutes(time);
  const rounded = Math.floor(total / 25) * 25;

  console.log("丸め処理:", {
    入力: time,
    分換算: total,
    切り捨て後の分: rounded,
    出力: minutesToTime(rounded),
  });

  return minutesToTime(rounded);
}

export function snapToGroupRow(time: string, rows: string[]): string {
  const target = timeToMinutes(time);

  // rows は昇順なので、target 以下の最大値を選ぶ
  let best = rows[0];

  for (const row of rows) {
    const rowMin = timeToMinutes(row);
    if (rowMin <= target) {
      best = row;
    } else {
      break;
    }
  }

  return best;
}
