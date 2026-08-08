/**
 * App.tsx
 *
 * アプリ全体を管理する場所。
 *
 * 役割:
 *
 * 1. スポット数を管理する
 * 2. ユーザー入力を管理する
 * 3. 保存・復元を行う
 * 4. 表示用データを作成する
 * 5. ScheduleTableへ渡す
 *
 *
 * 計算:
 *   scheduler.ts
 *
 * 表生成:
 *   scheduleBuilder.ts
 *
 * 保存:
 *   storage.ts
 *
 * 表示:
 *   ScheduleTable.tsx
 *
 * が担当する。
 */

import { useState } from "react";
import ScheduleTable from "./components/ScheduleTable";
import type { SpotGroup, JoinedMark } from "./types";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useDateReset } from "./hooks/useDateReset";
import { useGroups } from "./hooks/useGroups";
import { useNow } from "./hooks/useNow";
import { useVisibleTables } from "./hooks/useVisibleTables";

function App() {
  // イベントグループ一覧
  const [groups, setGroups] = useState<SpotGroup[]>([
    {
      id: "default",
      name: "イベント1",
      spotCount: 5,
      spotNames: ["Spot1", "Spot2", "Spot3", "Spot4", "Spot5"],
      inputs: [],
      hidden: false,
    },
  ]);
  // 全グループ共通設定
  const [is24Hour, setIs24Hour] = useState(false);

  // ★マーク一覧
  const [joinedMarks, setJoinedMarks] = useState<JoinedMark[]>([]);

  // 保存復元完了
  const [loaded, setLoaded] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const [lastResetDate, setLastResetDate] = useState("");

  /*
    Spot数入力欄で、入力途中の文字列を保持する。
    例: 「6」を入力する途中で、一時的に空欄にできる。
  */
  const [spotCountDrafts, setSpotCountDrafts] = useState<
    Record<string, string>
  >({});

  // ① 日付リセットロジック（カスタムフック）
  useDateReset({
    groups,
    setGroups,
    joinedMarks,
    setJoinedMarks,
    lastResetDate,
    setLastResetDate,
    loaded,
    setLoaded,
    is24Hour,
  });

  const {
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
  } = useGroups({
    groups,
    setGroups,
    setJoinedMarks,
  });

  const now = useNow();
  const visibleTables = useVisibleTables(groups, is24Hour);

  return (
    <>
      <Header onMenuClick={() => setMenuOpen(true)} />
      <Sidebar
        // Sidebar の開閉は menuOpen で管理
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        // 全体設定の3つ
        is24Hour={is24Hour}
        setIs24Hour={setIs24Hour}
        handleResetAll={handleResetAll}
        // エリア管理のハンドラ
        groups={groups}
        spotCountDrafts={spotCountDrafts}
        setSpotCountDrafts={setSpotCountDrafts}
        onSpotCountChange={handleSpotCountChange}
        onVisibleChange={handleVisibleChange}
        onDeleteGroup={handleDeleteGroup}
        onAddGroup={handleAddGroup}
      />

      <ScheduleTable
        groups={visibleTables}
        now={now}
        joinedMarks={joinedMarks}
        onToggleJoined={handleToggleJoined}
        onCellClick={handleCellClick}
        onSpotNameChange={handleSpotNameChange}
        onResetSpot={handleResetSpot}
        onGroupNameChange={handleGroupNameChange}
      />
      <footer>ver 0.3.0</footer>
    </>
  );
}

export default App;
