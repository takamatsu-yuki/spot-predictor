/**
 * AreaSettings.tsx
 *
 * エリア設定を表示するコンポーネント。
 *
 * このファイルでは状態管理や計算は行わない。
 *
 * 役割:
 * 1. エリア一覧を表示する
 * 2. Spot数を設定する
 * 3. エリアの表示/非表示を切り替える
 * 4. エリアの追加・削除を行う
 *
 * データ管理や状態更新は
 * App.tsx
 * が担当する。
 */

import type { SpotGroup } from "../types";
// import type { Dispatch, SetStateAction } from "react";

type Props = {
  groups: SpotGroup[];

  spotCountDrafts: Record<string, string>;

  setSpotCountDrafts: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;

  onSpotCountChange: (groupId: string, value: number) => void;

  onVisibleChange: (groupId: string, visible: boolean) => void;

  onDeleteGroup: (groupId: string) => void;

  onAddGroup: () => void;
};

export default function AreaSettings({
  groups,
  spotCountDrafts,
  setSpotCountDrafts,
  onSpotCountChange,
  onVisibleChange,
  onDeleteGroup,
  onAddGroup,
}: Props) {
  return (
    <section>
      {groups.map((group) => (
        <div key={group.id} className="group-setting-row">
          <span className="group-setting-label">エリア名:</span>

          <strong className="group-setting-name">
            {group.name || "名称未設定"}
          </strong>

          <label className="group-spot-count">
            Spot数:
            <input
              type="number"
              min="1"
              // 入力途中の文字列があればそれを表示する。なければ、確定済みのSpot数を表示する。
              value={spotCountDrafts[group.id] ?? String(group.spotCount)}
              // 入力中は、まだSpot数を確定しない。そのため、一度すべて消して「6」と入力できる。
              onChange={(e) => {
                setSpotCountDrafts((old) => ({
                  ...old,
                  [group.id]: e.target.value,
                }));
              }}
              // 入力欄からカーソルが外れた時点でSpot数を確定する。空欄・0・不正な値なら1に戻す。
              onBlur={() => {
                const text =
                  spotCountDrafts[group.id] ?? String(group.spotCount);
                const value = Number(text);

                onSpotCountChange(
                  group.id,
                  Number.isInteger(value) && value >= 1 ? value : 1,
                );

                // 入力途中の文字列を削除し、確定したSpot数を再表示する。
                setSpotCountDrafts((old) => {
                  const next = { ...old };
                  delete next[group.id];
                  return next;
                });
              }}
              // Enterキーでも入力を確定する。
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={!group.hidden}
              onChange={(e) => onVisibleChange(group.id, e.target.checked)}
            />
            {group.hidden ? "🙈" : "👁️"}
          </label>

          <button
            type="button"
            onClick={() => onDeleteGroup(group.id)}
            disabled={groups.length === 1}
          >
            削除
          </button>
        </div>
      ))}

      <button type="button" onClick={onAddGroup}>
        ＋ エリア追加
      </button>
    </section>
  );
}
