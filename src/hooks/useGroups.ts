/**
 * useGroups
 *
 * エリア操作ロジックを App.tsx から分離するためのカスタムフック。
 *
 * 役割:
 * - Spot入力の追加・更新
 * - Spot名変更
 * - Spotリセット
 * - エリア追加・削除
 * - エリア名変更
 * - Spot数変更（Spot名リサイズ含む）
 * - 全リセット
 * - ★マーク（joinedMarks）の追加・削除
 * - 表示/非表示切り替え
 *
 */

import { resizeSpotNames } from "../utils/spotNames";
import type { SpotGroup, JoinedMark } from "../types";
import {
  reverseCooldown,
  roundTo25Minutes,
  snapToGroupRow,
} from "../utils/timeHelpers";

type Params = {
  groups: SpotGroup[];
  setGroups: React.Dispatch<React.SetStateAction<SpotGroup[]>>;
  setJoinedMarks: React.Dispatch<React.SetStateAction<JoinedMark[]>>;
};

export function useGroups({ groups, setGroups, setJoinedMarks }: Params) {
  /**
   * セルクリック（Spot入力）
   *
   * 同じSpotが既に存在する場合、
   * 新しい入力を正とする。
   */
  function handleCellClick(groupId: string, time: string, spotIndex: number) {
    const spotNumber = spotIndex + 1;

    setGroups((oldGroups) =>
      oldGroups.map((group) => {
        if (group.id !== groupId) return group;

        // このSpotは既に登録済みか
        const existing = group.inputs.find((i) => i.spot === spotNumber);

        if (existing && existing.time !== time) return group;

        return {
          ...group,
          inputs: [
            ...group.inputs.filter((i) => i.time !== time),
            { spot: spotNumber, time },
          ],
        };
      }),
    );
  }

  /**
   * Spot名変更
   */
  function handleSpotNameChange(groupId: string, index: number, name: string) {
    setGroups((oldGroups) =>
      oldGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              spotNames: group.spotNames.map((old, i) =>
                i === index ? name : old,
              ),
            }
          : group,
      ),
    );
  }

  /**
   * Spotリセット
   */
  function handleResetSpot(groupId: string, spotIndex: number) {
    const spotNumber = spotIndex + 1;

    setGroups((oldGroups) =>
      oldGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              inputs: group.inputs.filter((i) => i.spot !== spotNumber),
            }
          : group,
      ),
    );
  }

  /**
   * エリア追加
   */
  function handleAddGroup() {
    setGroups((oldGroups) => {
      const nextNumber = oldGroups.length + 1;

      return [
        ...oldGroups,
        {
          id: crypto.randomUUID(),
          name: `エリア${nextNumber}`,
          spotCount: 5,
          spotNames: ["Spot1", "Spot2", "Spot3", "Spot4", "Spot5"],
          inputs: [],
          hidden: false,
        },
      ];
    });
  }

  /**
   * エリア名変更
   */
  function handleGroupNameChange(groupId: string, name: string) {
    setGroups((oldGroups) =>
      oldGroups.map((group) =>
        group.id === groupId ? { ...group, name } : group,
      ),
    );
  }

  /**
   * Spot数変更（Spot名リサイズ＋入力リセット）
   */
  function handleSpotCountChange(groupId: string, value: number) {
    const spotCount = Math.max(1, Math.floor(value));

    setGroups((oldGroups) =>
      oldGroups.map((group) => {
        if (group.id !== groupId || group.spotCount === spotCount) return group;

        return {
          ...group,
          spotCount,
          spotNames: resizeSpotNames(group.spotNames, spotCount),
          inputs: [],
        };
      }),
    );

    // Spot数変更時は参加履歴リセット
    setJoinedMarks([]);
  }

  /**
   * エリア削除
   */
  function handleDeleteGroup(groupId: string) {
    if (groups.length <= 1) {
      alert("最後の1エリアは削除できません。");
      return;
    }

    if (!confirm("このエリアを削除しますか？")) return;

    setGroups((oldGroups) => oldGroups.filter((g) => g.id !== groupId));
  }

  /**
   * 全リセット
   */
  function handleResetAll() {
    if (!confirm("全エリアの観測データをリセットしますか？")) return;

    setGroups((oldGroups) =>
      oldGroups.map((group) => ({
        ...group,
        inputs: [],
      })),
    );

    setJoinedMarks([]);
  }

  /**
   * ★マークの追加・削除
   * - 同じ時刻なら参加記録を削除
   * - 時刻単位で参加記録を追加
   */
  function handleToggleJoined(time: string) {
    setJoinedMarks((old) => {
      const exists = old.some((m) => m.time === time);
      return exists ? old.filter((m) => m.time !== time) : [...old, { time }];
    });
  }

  /**
   * 表示/非表示切り替え
   */
  function handleVisibleChange(groupId: string, visible: boolean) {
    setGroups((old) =>
      old.map((group) =>
        group.id === groupId ? { ...group, hidden: !visible } : group,
      ),
    );
  }

  function handleReverseCooldown(
    now: Date,
    remainingMinutes: number,
    rows: string[],
  ) {
    const raw = reverseCooldown(now, remainingMinutes);
    const rounded = roundTo25Minutes(raw);
    const snapped = snapToGroupRow(rounded, rows);

    setJoinedMarks((old) => {
      if (old.some((m) => m.time === snapped)) return old;
      return [...old, { time: snapped }];
    });
  }

  return {
    handleCellClick,
    handleSpotNameChange,
    handleResetSpot,
    handleAddGroup,
    handleGroupNameChange,
    handleSpotCountChange,
    handleDeleteGroup,
    handleResetAll,
    handleToggleJoined,
    handleVisibleChange,
    handleReverseCooldown,
  };
}
