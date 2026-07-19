export type ScheduleRow = {
    time: string;
    spots: boolean[];
  }

/**
 * 1件の観測データ
 */
export interface InputData {

  /**
   * Spot番号
   *
   * 1始まり
   */
  spot: number;

  /**
   * 観測時刻
   */
  time: string;

}


/**
 * 保存データ
 */
export interface SaveData {

  /**
   * Spot総数
   */
  spotCount: number;

  /**
   * 観測一覧
   */
  inputs: InputData[];

}

export interface SaveData {

  /**
   * Spot総数
   */
  spotCount:number;


  /**
   * Spot表示名
   */
  spotNames:string[];


  /**
   * 観測データ
   */
  inputs:InputData[];

}