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

import { useEffect, useState } from "react";
import ScheduleTable from "./components/ScheduleTable";
import { buildSchedule } from "./utils/scheduleBuilder";
import { saveData, loadData } from "./utils/storage";
import type { SpotGroup, JoinedMark } from "./types";
import { resizeSpotNames } from "./utils/spotNames";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
// import AreaSettings from "./components/AreaSettings";

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

  // 現在時刻
  const [now, setNow] = useState(new Date());

  const [menuOpen, setMenuOpen] = useState(false);

  /*
    Spot数入力欄で、入力途中の文字列を保持する。
    例: 「6」を入力する途中で、一時的に空欄にできる。
  */
  const [spotCountDrafts, setSpotCountDrafts] = useState<
    Record<string, string>
  >({});

  /**
   * 起動時に保存データを復元する。
   */
  useEffect(() => {
    const data = loadData();

    /*
      新形式の保存データだけ復元する。
      ver 0.10以前のデータは無視し、初期状態から始める。
    */
    if (data && Array.isArray(data.groups)) {
      setGroups(data.groups);
      setIs24Hour(data.is24Hour ?? false);
      setJoinedMarks(data.joinedMarks ?? []);
    }

    setLoaded(true);
  }, []);

  /**
   * 状態変更時に保存する。
   */
  useEffect(() => {
    /*
      まだ復元前なら保存しない
    */
    if (!loaded) {
      return;
    }

    saveData({
      groups,
      is24Hour,
      joinedMarks,
    });
  }, [loaded, groups, is24Hour, joinedMarks]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  /**
   * 表示用スケジュールを作成。
   *
   * 計算処理は
   * scheduleBuilder.ts
   * 側で行う。
   */
  const visibleTables = groups
    .filter((group) => !group.hidden)
    .map((group) => ({
      ...group,
      rows: buildSchedule(group.spotCount, group.inputs, is24Hour),
    }));

  /**
   * 表セルクリック時。
   *
   * 同じSpotが既に存在する場合、
   * 新しい入力を正とする。
   */
  function handleCellClick(groupId: string, time: string, spotIndex: number) {
    const spotNumber = spotIndex + 1;

    setGroups((oldGroups) =>
      oldGroups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }

        // このSpotは既に登録済み？
        const existing = group.inputs.find(
          (input) => input.spot === spotNumber,
        );

        // 別の時刻なら無視
        if (existing && existing.time !== time) {
          return group;
        }

        return {
          ...group,
          inputs: [
            ...group.inputs.filter((input) => input.time !== time),
            {
              spot: spotNumber,
              time,
            },
          ],
        };
      }),
    );
  }

  function handleSpotNameChange(groupId: string, index: number, name: string) {
    setGroups((oldGroups) =>
      oldGroups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }

        return {
          ...group,
          spotNames: group.spotNames.map((oldName, i) =>
            i === index ? name : oldName,
          ),
        };
      }),
    );
  }

  function handleResetSpot(groupId: string, spotIndex: number) {
    const spotNumber = spotIndex + 1;

    setGroups((oldGroups) =>
      oldGroups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }

        return {
          ...group,
          inputs: group.inputs.filter((input) => input.spot !== spotNumber),
        };
      }),
    );
  }

  function handleAddGroup() {
    setGroups((oldGroups) => {
      const nextNumber = oldGroups.length + 1;

      return [
        ...oldGroups,
        {
          id: crypto.randomUUID(),
          name: `イベント${nextNumber}`,
          spotCount: 5,
          spotNames: ["Spot1", "Spot2", "Spot3", "Spot4", "Spot5"],
          inputs: [],
          hidden: false,
        },
      ];
    });
  }

  function handleGroupNameChange(groupId: string, name: string) {
    setGroups((oldGroups) =>
      oldGroups.map((group) =>
        group.id === groupId ? { ...group, name } : group,
      ),
    );
  }

  function handleSpotCountChange(groupId: string, value: number) {
    const spotCount = Math.max(1, Math.floor(value));

    setGroups((oldGroups) =>
      oldGroups.map((group) => {
        if (group.id !== groupId || group.spotCount === spotCount) {
          return group;
        }

        return {
          ...group,
          spotCount,
          spotNames: resizeSpotNames(group.spotNames, spotCount),
          inputs: [],
        };
      }),
    );

    // Spot数変更時は参加履歴もリセット
    setJoinedMarks([]);
  }

  function handleDeleteGroup(groupId: string) {
    if (groups.length <= 1) {
      alert("最後の1グループは削除できません。");
      return;
    }

    if (!confirm("このグループを削除しますか？")) {
      return;
    }

    setGroups((oldGroups) => oldGroups.filter((group) => group.id !== groupId));
  }

  function handleResetAll() {
    if (!confirm("全グループの観測データを削除しますか？")) {
      return;
    }

    setGroups((oldGroups) =>
      oldGroups.map((group) => ({
        ...group,
        inputs: [],
      })),
    );

    setJoinedMarks([]);
  }

  function handleToggleJoined(time: string) {
    setJoinedMarks((old) => {
      const exists = old.some((mark) => mark.time === time);

      // 同じ時刻なら参加記録を削除
      if (exists) {
        return old.filter((mark) => mark.time !== time);
      }

      // 時刻単位で参加記録を追加
      return [
        ...old,
        {
          time,
        },
      ];
    });
  }

  function handleVisibleChange(groupId: string, visible: boolean) {
    setGroups((old) =>
      old.map((group) =>
        group.id === groupId
          ? {
              ...group,
              hidden: !visible,
            }
          : group,
      ),
    );
  }

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
