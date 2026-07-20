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

import type { InputData } from "./types";
import { resizeSpotNames } from "./utils/spotNames";
import SpotSetting from "./components/SpotSetting";

function App() {
  // Spot総数
  const [spotCount, setSpotCount] = useState(5);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(new Date());
  const [joinedTime, setJoinedTime] = useState<string | null>(null);

  /**
   * ユーザーが入力した観測情報。
   *
   * 例:
   *
   * [
   *   {
   *     spot:3,
   *     time:"14:25"
   *   }
   * ]
   */
  const [inputs, setInputs] = useState<InputData[]>([]);

  /**
   * Spot表示名
   *
   * 例:
   * [
   *  "入口",
   *  "中央",
   *  "塔"
   * ]
   */
  const [spotNames, setSpotNames] = useState<string[]>([
    "Spot1",
    "Spot2",
    "Spot3",
    "Spot4",
    "Spot5",
  ]);

  /**
   * 起動時に保存データを復元する。
   */
  useEffect(() => {
    const data = loadData();

    if (data) {
      setSpotCount(data.spotCount);

      setSpotNames(resizeSpotNames(data.spotNames ?? [], data.spotCount));

      setInputs(data.inputs);
    }

    /*
      読み込み完了を知らせる
    */
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
      spotCount,
      spotNames,
      inputs,
    });
  }, [loaded, spotCount, spotNames, inputs]);

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
  const table = buildSchedule(
    spotCount,

    inputs,
  );

  /**
   * 表セルクリック時。
   *
   * 同じSpotが既に存在する場合、
   * 新しい入力を正とする。
   */
  function handleCellClick(time: string, spotIndex: number) {
    const spotNumber = spotIndex + 1;

    setInputs((oldInputs) => [
      /*
          同じSpotの古い情報を削除
        */
      ...oldInputs.filter((input) => input.spot !== spotNumber),

      /*
          新しい情報を追加
        */
      {
        spot: spotNumber,

        time,
      },
    ]);
  }

  function handleSpotNameChange(index: number, name: string) {
    setSpotNames((oldNames) =>
      oldNames.map((oldName, i) => (i === index ? name : oldName)),
    );
  }

  function handleResetSpot(spotIndex: number) {
    const spotNumber = spotIndex + 1;

    setInputs((oldInputs) =>
      oldInputs.filter((input) => input.spot !== spotNumber),
    );
  }

  function handleResetAll() {
    if (!confirm("全スポットの観測データを削除しますか？")) {
      return;
    }

    setInputs([]);
  }

  function handleJoinTime(time: string) {
    setJoinedTime((old) => (old === time ? null : time));
  }

  return (
    <>
      <h1>MHNow Spot Predictor</h1>

      <div>
        <label>スポット数:</label>

        <input
          type="number"
          min="1"
          value={spotCount}
          onChange={(e) => {
            const value = Number(e.target.value);

            setSpotCount(value);
            setSpotNames((old) => resizeSpotNames(old, value));

            // Spot数変更時は現在の観測データを一度リセット。
            setInputs([]);
          }}
        />
      </div>
      <button onClick={handleResetAll}>全スポット入力リセット</button>

      <ScheduleTable
        rows={table}
        spotCount={spotCount}
        spotNames={spotNames}
        onCellClick={handleCellClick}
        onSpotNameChange={handleSpotNameChange}
        onResetSpot={handleResetSpot}
        now={now}
        joinedTime={joinedTime}
        onJoinTime={handleJoinTime}
      />

      <SpotSetting
        spotNames={spotNames}
        onSpotNameChange={handleSpotNameChange}
      />
    </>
  );
}

export default App;
