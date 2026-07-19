/**
 * scheduler.ts
 *
 * ゲームの時間計算だけを担当する。
 *
 * Reactや画面表示は知らない。
 *
 * 役割:
 * 1スポット分のアクティブ時刻を計算する。
 */

import {
  timeToMinutes,
  minutesToTime
} from "./time";
import type { ScheduleRow } from "../types";


/**
 * 1スポットのアクティブ時間
 */
const ACTIVE_DURATION = 25;


/**
 * ゲーム開始
 */
const START_TIME = "06:15";


/**
 * ゲーム終了
 */
const END_TIME = "23:20";



/**
 * 1つのスポットの時間一覧を作成する。
 *
 * 例:
 *
 * 基準:
 * Spot3
 * 14:25
 *
 * 結果:
 *
 * 06:15
 * 07:30
 * 08:45
 * ...
 *
 *
 * @param spotCount スポット総数
 * @param baseTime 観測した時刻
 *
 * @returns
 * そのスポットがアクティブになる時刻配列
 */
export function calculateSpotColumn(
  spotCount: number,
  baseTime: string
): string[] {


  const rows: string[] = [];


  const baseMinutes =
    timeToMinutes(baseTime);


  const startMinutes =
    timeToMinutes(START_TIME);


  const endMinutes =
    timeToMinutes(END_TIME);



  /*
    スポット単体なので、

    周期 =
    スポット数 × 25分

    で戻ってくる
  */
  const cycle =
    spotCount * ACTIVE_DURATION;



  /*
    基準時刻から過去へ戻る
  */
  let current =
    baseMinutes;


  while (
    current >= startMinutes
  ) {

    rows.push(
      minutesToTime(current)
    );

    current -= cycle;

  }



  /*
    基準時刻から未来へ進む
  */
  current =
    baseMinutes + cycle;



  while (
    current <= endMinutes
  ) {

    rows.push(
      minutesToTime(current)
    );

    current += cycle;

  }



  return rows.sort(
    (a,b)=>
      timeToMinutes(a)
      -
      timeToMinutes(b)
  );

}

/**
 * 空の表を作成する。
 *
 * 初期表示用。
 *
 * 例:
 *
 * 06:15  false false false
 * 06:40  false false false
 *
 * @param spotCount スポット数
 */
export function createEmptySchedule(
  spotCount: number
): ScheduleRow[] {


  const rows: ScheduleRow[] = [];


  let current =
    timeToMinutes(START_TIME);


  const end =
    timeToMinutes(END_TIME);



  while (
    current <= end
  ) {


    rows.push({

      time:
        minutesToTime(current),


      spots:
        Array.from(
          {
            length: spotCount
          },
          () => false
        )

    });



    current += ACTIVE_DURATION;

  }


  return rows;

}