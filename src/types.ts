// types.ts

export type ScheduleRow = {
  // 行の時刻
  time: string;

  // Spot状態
  spots: boolean[];
};

// 1回分の観測データ
export interface InputData {
  // Spot番号（1始まり）
  spot: number;

  // 観測時刻
  time: string;
}

// 1つのイベントグループ
export interface SpotGroup {
  // グループ識別用ID
  id: string;

  // グループ名
  name: string;

  // Spot総数
  spotCount: number;

  // Spot表示名一覧
  spotNames: string[];

  // 観測データ
  inputs: InputData[];

  hidden: boolean;
}

// 保存データ
export interface SaveData {
  // グループ一覧
  groups: SpotGroup[];

  // 24時間イベントか（全体共通）
  is24Hour: boolean;

  // 参加基準時刻（全体で1つ）
  joinedTime: string | null;
}
