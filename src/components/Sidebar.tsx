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
import type { Dispatch, SetStateAction } from "react";
import Accordion from "./Accordion";

type Props = {
  open: boolean;
  onClose: () => void;

  groups: SpotGroup[];
  spotCountDrafts: Record<string, string>;
  setSpotCountDrafts: Dispatch<SetStateAction<Record<string, string>>>;

  onSpotCountChange: (groupId: string, value: number) => void;
  onVisibleChange: (groupId: string, visible: boolean) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddGroup: () => void;
};

export default function Sidebar({
  open,
  onClose,

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
        <div className="sidebar-header">
          <h2>メニュー</h2>

          <button type="button" className="sidebar-close" onClick={onClose}>
            ×
          </button>
        </div>

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
