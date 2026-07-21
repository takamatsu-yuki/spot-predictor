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
import type { SpotGroup } from "./types";
import { resizeSpotNames } from "./utils/spotNames";

function App() {
  // イベントグループ一覧
  const [groups, setGroups] = useState<SpotGroup[]>([
    {
      id: "default",
      name: "イベント1",
      spotCount: 5,
      spotNames: ["Spot1", "Spot2", "Spot3", "Spot4", "Spot5"],
      inputs: [],
    },
  ]);
  // 全グループ共通設定
  const [is24Hour, setIs24Hour] = useState(false);

  // 全グループ共通参加時刻
  const [joinedTime, setJoinedTime] = useState<string | null>(null);

  // 保存復元完了
  const [loaded, setLoaded] = useState(false);

  // 現在時刻
  const [now, setNow] = useState(new Date());

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
      setJoinedTime(data.joinedTime ?? null);
      setIs24Hour(data.is24Hour ?? false);
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
      joinedTime,
      is24Hour,
    });
  }, [loaded, groups, joinedTime, is24Hour]);

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
  const tables = groups.map((group) => ({
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

        return {
          ...group,
          inputs: [
            ...group.inputs.filter((input) => input.spot !== spotNumber),
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
  }

  function handleJoinTime(time: string) {
    setJoinedTime((old) => (old === time ? null : time));
  }

  return (
    <>
      <h1>MHNow Spot Predictor</h1>
      <section>
        {/* <h2>エリア設定</h2> */}

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
                /*
                  入力途中の文字列があればそれを表示する。
                  なければ、確定済みのSpot数を表示する。
                */
                value={spotCountDrafts[group.id] ?? String(group.spotCount)}
                /*
                  入力中は、まだSpot数を確定しない。  
                  そのため、一度すべて消して「6」と入力できる。
                */
                onChange={(e) => {
                  setSpotCountDrafts((old) => ({
                    ...old,
                    [group.id]: e.target.value,
                  }));
                }}
                /*
                  入力欄からカーソルが外れた時点でSpot数を確定する。
                  空欄・0・不正な値なら1に戻す。
                */
                onBlur={() => {
                  const text =
                    spotCountDrafts[group.id] ?? String(group.spotCount);
                  const value = Number(text);

                  handleSpotCountChange(
                    group.id,
                    Number.isInteger(value) && value >= 1 ? value : 1,
                  );

                  /*
                    入力途中の文字列を削除し、
                    確定したSpot数を再表示する。
                  */
                  setSpotCountDrafts((old) => {
                    const next = { ...old };
                    delete next[group.id];
                    return next;
                  });
                }}
                /*
                  Enterキーでも入力を確定する。
                */
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
              />
            </label>

            <button
              type="button"
              onClick={() => handleDeleteGroup(group.id)}
              disabled={groups.length === 1}
            >
              削除
            </button>
          </div>
        ))}

        <button type="button" onClick={handleAddGroup}>
          ＋ エリア追加
        </button>
      </section>

      <label className="event-options">
        <input
          type="checkbox"
          checked={is24Hour}
          onChange={(e) => setIs24Hour(e.target.checked)}
        />
        24時間開催イベント中
      </label>
      <button onClick={handleResetAll}>全スポット入力リセット</button>
      <ScheduleTable
        groups={tables}
        now={now}
        joinedTime={joinedTime}
        onCellClick={handleCellClick}
        onSpotNameChange={handleSpotNameChange}
        onResetSpot={handleResetSpot}
        onJoinTime={handleJoinTime}
        onGroupNameChange={handleGroupNameChange}
      />
      {/* {tables.map((group) => (
        <SpotSetting
          key={group.id}
          spotNames={group.spotNames}
          onSpotNameChange={handleSpotNameChange}
        />
      ))} */}
      <footer>ver 0.2.0</footer>
    </>
  );
}

export default App;
