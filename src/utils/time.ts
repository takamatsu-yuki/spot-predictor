/**
 * time.ts
 *
 * 時刻文字列と分単位数値の変換を担当する。
 *
 * 例:
 *
 * "14:25"
 * ↓
 * 865
 *
 * 逆に
 *
 * 865
 * ↓
 * "14:25"
 */

/**
 * HH:mm形式を分へ変換する。
 *
 * @param time "14:25"
 * @returns 865
 */
export function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);

  return hour * 60 + minute;
}

/**
 * 分をHH:mm形式へ変換する。
 *
 * @param minutes 865
 * @returns "14:25"
 */
export function minutesToTime(minutes: number): string {
  const hour = Math.floor(minutes / 60);

  const minute = minutes % 60;

  return String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
}
