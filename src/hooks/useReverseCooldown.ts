/**
 * useReverseCooldown.ts
 *
 * 逆算機能を一括管理するカスタムフック。
 *
 * ----------------------------------------
 * 1. 逆算ロジック（raw → rounded → snapped）をまとめる
 * 2. 「計算だけ」の結果を preview として保持する
 * 3. 即時登録・計算だけ・計算結果の登録 の3操作を提供する
 * 4. Sidebar は UI のみ、App.tsx は状態管理のみ、という責務分離を守る
 *
 * Sidebar.tsx → ユーザー操作を通知するだけ
 * App.tsx → 状態管理（preview）と登録処理
 * useReverseCooldown → 逆算ロジックと操作の提供
 *
 */

import {
  reverseCooldown,
  roundTo25Minutes,
  snapToGroupRow,
} from "../utils/timeHelpers";
import { useState } from "react";

export function useReverseCooldown(rows: string[]) {
  /**
   * preview:
   * 「計算だけ」ボタンを押したときの結果を保持する。
   *
   * Sidebar に表示される内容はこの preview。
   * 即時登録や確定登録を行うと preview はクリアされる。
   */
  const [preview, setPreview] = useState<{
    raw: string;
    rounded: string;
    snapped: string;
  } | null>(null);

  /**
   * ① 即時登録
   *
   * 入力 → 計算 → 登録 を一気に行う。
   * preview は使わないのでクリアする。
   *
   * registerFn は App.tsx 側の「★登録」関数を受け取る。
   */
  function registerImmediate(
    now: Date,
    minutes: number,
    registerFn: (time: string) => void,
  ) {
    const raw = reverseCooldown(now, minutes);
    const rounded = roundTo25Minutes(raw);
    const snapped = snapToGroupRow(rounded, rows);

    registerFn(snapped);
    setPreview(null); // 即時登録なので preview は不要
  }

  /**
   * ② 計算だけ
   *
   * 入力 → 計算 → preview に保持。
   * Sidebar に結果カードとして表示される。
   */
  function calculateOnly(now: Date, minutes: number) {
    const raw = reverseCooldown(now, minutes);
    const rounded = roundTo25Minutes(raw);
    const snapped = snapToGroupRow(rounded, rows);

    setPreview({ raw, rounded, snapped });
  }

  /**
   * ③ 計算結果を登録
   *
   * preview の snapped を登録する。
   * 登録後は preview をクリアする。
   */
  function registerPreview(registerFn: (time: string) => void) {
    if (!preview) return;

    registerFn(preview.snapped);
    setPreview(null);
  }

  return {
    preview,
    registerImmediate,
    calculateOnly,
    registerPreview,
  };
}
