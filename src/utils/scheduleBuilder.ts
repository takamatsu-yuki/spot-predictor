/**
 * scheduleBuilder.ts
 *
 * 複数Spotの入力情報から
 * 表示用スケジュールを作成する。
 *
 * このファイルは
 *
 * 入力データ
 *      ↓
 * 各Spot計算
 *      ↓
 * 表形式データ
 *
 * への変換を担当する。
 *
 * ReactやlocalStorageは知らない。
 *
 * Pythonでいうと、
 *
 * schedule_builder.py
 *
 * のような役割。
 */

import { createEmptySchedule, calculateSpotColumn } from "./scheduler";

import type { InputData, ScheduleRow } from "../types";

/**
 * 入力された観測データから
 * 1日のスケジュール表を作成する。
 *
 * @param spotCount Spot総数
 * @param inputs 観測済みSpot一覧
 *
 * @returns 表示用ScheduleRow[]
 *
 *
 * 例:
 *
 * inputs:
 *
 * [
 *   {
 *     spot:3,
 *     time:"14:25"
 *   }
 * ]
 *
 * ↓
 *
 * Spot3の周期を計算
 *
 * ↓
 *
 * 表のSpot3列へ反映
 */
export function buildSchedule(
  spotCount: number,
  inputs: InputData[],
  is24Hour: boolean,
): ScheduleRow[] {
  /**
   * まず空の表を作る。
   *
   * 時刻だけ存在し、
   * 全Spotはfalse状態。
   */
  let table = createEmptySchedule(spotCount, is24Hour);

  /**
   * 登録されているSpotを
   * 1列ずつ処理する。
   *
   * Python:
   *
   * for input in inputs:
   *
   */
  inputs.forEach((input) => {
    /**
     * このSpotが
     * アクティブになる時刻一覧。
     */
    const activeTimes = calculateSpotColumn(spotCount, input.time, is24Hour);

    /**
     * 表へ反映。
     *
     * 該当Spot列だけtrueにする。
     */
    table = table.map((row) => {
      /**
       * アクティブ時間なら更新
       */
      if (activeTimes.includes(row.time)) {
        return {
          ...row,

          spots: row.spots.map((_, index) => index + 1 === input.spot),
        };
      }

      return row;
    });
  });

  return table;
}
