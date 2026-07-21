/**
 * storage.ts
 *
 * localStorageとのやり取りを担当する。
 *
 * App.tsxから
 *
 *   saveData(...)
 *   loadData()
 *
 * を呼ぶだけで保存・読込ができる。
 *
 * localStorageの詳細は
 * このファイルだけが知っている。
 */

import type { SaveData } from "../types";

/**
 * localStorageへ保存するキー。
 *
 * ブラウザ内では
 *
 * spotPredictor
 *
 * という名前で保存される。
 */
const STORAGE_KEY = "spotPredictor";

/**
 * データを保存する。
 *
 * @param data 保存するデータ
 */
export function saveData(data: SaveData): void {
  console.log("SAVE:", data);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * 保存済みデータを読み込む。
 *
 * 保存されていなければ
 * nullを返す。
 */
export function loadData(): SaveData | null {
  const saved = localStorage.getItem(STORAGE_KEY);

  console.log("LOAD:", saved);

  if (!saved) {
    return null;
  }

  try {
    const data = JSON.parse(saved);

    return data as SaveData;
  } catch {
    return null;
  }
}
