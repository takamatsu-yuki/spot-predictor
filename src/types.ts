export type ScheduleRow = {
  // 行の時刻
  time: string;
  // Spot状態
  spots: boolean[];
};

// 1件の観測データ
export interface InputData {
  // Spot番号　1始まり
  spot: number;

  // 観測時刻
  time: string;
}

export interface SaveData {
  // Spot総数
  spotCount: number;

  // Spot表示名
  spotNames: string[];

  // 観測データ
  inputs: InputData[];

  is24Hour: boolean;
}
