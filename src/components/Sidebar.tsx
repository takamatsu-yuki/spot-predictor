/**
 * Sidebar.tsx
 *
 * アプリのサイドメニューを表示するコンポーネント。
 *
 * このファイルでは状態管理や計算は行わない。
 *
 * 役割:
 * 1. エリア設定を表示する
 * 2. 各種設定項目を表示する
 * 3. ユーザー操作を親(App.tsx)へ通知する
 *
 * メニューの開閉状態やデータ管理は
 * App.tsx
 * が担当する。
 */

import "./Sidebar.css";
import AreaSettings from "./AreaSettings";
import type { SpotGroup } from "../types";
import Accordion from "./Accordion";

type Props = {
  open: boolean;
  onClose: () => void;

  // 全体設定のための3つ
  is24Hour: boolean;
  setIs24Hour: (value: boolean) => void;
  handleResetAll: () => void;

  // エリア管理用
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

export default function Sidebar({
  open,
  onClose,

  is24Hour,
  setIs24Hour,
  handleResetAll,

  groups,
  spotCountDrafts,
  setSpotCountDrafts,
  onSpotCountChange,
  onVisibleChange,
  onDeleteGroup,
  onAddGroup,
}: Props) {
  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* サイドバー上部 */}
        <div className="sidebar-header">
          <h2>メニュー</h2>

          <button type="button" className="sidebar-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* 全体設定 */}
        <div className="sidebar-global-settings">
          <label className="event-options">
            <input
              type="checkbox"
              checked={is24Hour}
              onChange={(e) => setIs24Hour(e.target.checked)}
            />
            24時間開催イベント中
          </label>

          <button type="button" onClick={handleResetAll}>
            全スポット入力リセット
          </button>
        </div>

        {/* エリア管理 */}
        <Accordion title="エリア管理">
          <AreaSettings
            groups={groups}
            spotCountDrafts={spotCountDrafts}
            setSpotCountDrafts={setSpotCountDrafts}
            onSpotCountChange={onSpotCountChange}
            onVisibleChange={onVisibleChange}
            onDeleteGroup={onDeleteGroup}
            onAddGroup={onAddGroup}
          />
        </Accordion>
      </aside>
    </>
  );
}
