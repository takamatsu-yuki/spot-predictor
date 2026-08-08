/**
 * useDateReset
 *
 * アプリ起動時の「保存データ復元」と、
 * 日付変更時の「リセット通知・データ初期化」を担当するカスタムフック。
 *
 * 役割:
 * 1. 起動時に localStorage から保存データを復元する
 * 2. React 18 Strict Mode の二重実行を防ぎ、復元処理を1回だけ行う
 * 3. 復元完了後に「日付が変わったか」を判定する
 * 4. 日付が変わっていれば confirm を表示し、必要なら全データをリセットする
 * 5. lastResetDate を今日の日付に更新する（OK/Cancel に関わらず）
 * 6. groups / joinedMarks / lastResetDate / is24Hour の変更を保存する
 *
 * このフックを使うことで App.tsx は
 * 「UI とイベントハンドラ」に専念できるようになり、
 * 保存・復元・日付判定の複雑なロジックを完全に分離できる。
 */

import { useEffect, useRef } from "react";
import { loadData, saveData } from "../utils/storage";
import type { SpotGroup, JoinedMark } from "../types";

type Params = {
  groups: SpotGroup[];
  setGroups: React.Dispatch<React.SetStateAction<SpotGroup[]>>;
  joinedMarks: JoinedMark[];
  setJoinedMarks: React.Dispatch<React.SetStateAction<JoinedMark[]>>;
  lastResetDate: string;
  setLastResetDate: React.Dispatch<React.SetStateAction<string>>;
  loaded: boolean;
  setLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  is24Hour: boolean;
};

export function useDateReset({
  groups,
  setGroups,
  joinedMarks,
  setJoinedMarks,
  lastResetDate,
  setLastResetDate,
  loaded,
  setLoaded,
  is24Hour,
}: Params) {
  const didInit = useRef(false);

  /**
   * ① 起動時：保存データを復元（Strict Mode 対策で1回だけ）
   * - localStorage からデータを読み込む
   * - groups / is24Hour / joinedMarks / lastResetDate を復元する
   * - loaded を true にする（復元完了）
   */
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const data = loadData();

    if (data && Array.isArray(data.groups)) {
      setGroups(data.groups);
      setJoinedMarks(data.joinedMarks ?? []);
      setLastResetDate(data.lastResetDate ?? "");
    }

    setLoaded(true);
  }, []);

  /**
   * ② loaded 後：日付変更チェック
   * - lastResetDate が空なら今日で初期化（初回起動）
   * - lastResetDate と今日の日付が違えば通知を出す
   * - OKなら全グループの観測データをリセット
   * - OK/Cancel に関わらず lastResetDate を今日に更新
   */
  useEffect(() => {
    if (!loaded) return;

    const today = new Date().toISOString().slice(0, 10);

    if (!lastResetDate) {
      // 初回起動 → 今日で初期化
      setLastResetDate(today);
      return;
    }

    if (lastResetDate !== today) {
      const ok = confirm(
        "日付が変わりました。全エリアの観測データをリセットしますか？",
      );

      if (ok) {
        setGroups((old) =>
          old.map((g) => ({
            ...g,
            inputs: [],
          })),
        );
        setJoinedMarks([]);
      }

      setLastResetDate(today);
    }
  }, [loaded]);

  /**
   * ③ 状態変更時：保存
   * - groups / is24Hour / joinedMarks / lastResetDate が変わるたびに保存
   * - loaded が false の間は保存しない（復元中の上書きを防ぐ）
   */
  useEffect(() => {
    if (!loaded) return;

    saveData({
      groups,
      joinedMarks,
      lastResetDate,
      is24Hour,
    });
  }, [groups, joinedMarks, lastResetDate, is24Hour, loaded]);
}
