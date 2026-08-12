/**
 * timeHelpers.ts
 *
 * 時刻・時間計算に関する補助関数をまとめたユーティリティ。
 *
 * ----------------------------------------
 * 1. 逆算処理（reverseCooldown）
 * 2. 25分刻み丸め処理（roundTo25Minutes）
 * 3. 行スナップ処理（snapToGroupRow）
 * 4. クールタイム入力の柔軟パース（parseCooldownInput）
 *
 */

import { timeToMinutes, minutesToTime } from "./time";

/**
 * クールタイム逆算
 *
 * 現在時刻 + 残りクールタイム - 3時間
 * HH:mm 形式の文字列として返す。
 *
 * 例:
 *   now = 12:00
 *   remainingMinutes = 90
 *   → 12:00 + 90分 - 180分 = 10:30
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
 *
 * 例:
 *   10:37 → 10:25
 *   11:49 → 11:25
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

/**
 * 行スナップ処理
 *
 * rows（昇順の時刻配列）の中から、
 * target 以下で最大の時刻を返す。
 *
 * 例:
 *   rows = ["10:00", "10:25", "10:50"]
 *   target = "10:37"
 *   → "10:25"
 */
export function snapToGroupRow(time: string, rows: string[]): string {
  const target = timeToMinutes(time);

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

/**
 * クールタイム入力の柔軟パース
 *
 * 1つの入力欄で、以下の形式をすべて受け付ける。
 *
 * - "90"        → 90分
 * - "1:30"      → 90分
 * - "1h30m"     → 90分
 * - "2h"        → 120分
 * - "45m"       → 45分
 * - "1時間30分" → 90分
 * - "1時間"     → 60分
 * - "30分"      → 30分
 *
 * パースできない場合は null を返す。
 */
export function parseCooldownInput(input: string): number | null {
  if (!input) return null;

  // 全角 → 半角
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/：/g, ":") // 全角コロン
    .replace(/\s+/g, ""); // スペース除去

  // 1) 純粋な数字 → 分
  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  // 2) H:M 形式
  if (/^\d+:\d+$/.test(normalized)) {
    const [h, m] = normalized.split(":").map(Number);
    return h * 60 + m;
  }

  // 3) 小数時間（1.5h）
  if (/^(\d+(\.\d+)?)h$/.test(normalized)) {
    const hours = parseFloat(normalized.replace("h", ""));
    return Math.round(hours * 60);
  }

  // 4) 1h30m / 1h30 / 2h / 45m
  const hMatch = normalized.match(/(\d+(\.\d+)?)h/);
  const mMatch = normalized.match(/(\d+)m/);

  if (hMatch || mMatch) {
    const hours = hMatch ? parseFloat(hMatch[1]) : 0;
    const minutes = mMatch ? Number(mMatch[1]) : 0;
    return Math.round(hours * 60 + minutes);
  }

  // 5) min / hr
  if (/^(\d+)min$/.test(normalized)) {
    return Number(normalized.replace("min", ""));
  }
  if (/^(\d+)hr$/.test(normalized)) {
    return Number(normalized.replace("hr", "")) * 60;
  }

  // 6) 日本語表記（1時間30分 / 1時間半 / 30分）
  const jpH = normalized.match(/(\d+(\.\d+)?)時間/);
  const jpM = normalized.match(/(\d+)分/);

  if (jpH || jpM) {
    let hours = jpH ? parseFloat(jpH[1]) : 0;
    let minutes = jpM ? Number(jpM[1]) : 0;

    // 「半」対応（1時間半 → 1.5h）
    if (/半/.test(normalized)) {
      hours += 0.5;
    }

    return Math.round(hours * 60 + minutes);
  }

  return null;
}
