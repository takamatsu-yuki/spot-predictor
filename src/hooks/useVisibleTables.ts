import { buildSchedule } from "../utils/scheduleBuilder";
import type { SpotGroup } from "../types";

/**
 * 表示用スケジュールを作成。
 *
 * 計算処理は
 * scheduleBuilder.ts
 * 側で行う。
 */
export function useVisibleTables(groups: SpotGroup[], is24Hour: boolean) {
  return groups
    .filter((g) => !g.hidden)
    .map((g) => ({
      ...g,
      rows: buildSchedule(g.spotCount, g.inputs, is24Hour),
    }));
}
