/**
 * ScheduleTable.tsx
 *
 * 計算済みのスケジュールデータを
 * HTMLの表(table)として表示するコンポーネント。
 *
 * このファイルでは計算を行わない。
 *
 * 役割:
 *
 * scheduler.ts
 *      ↓
 * ScheduleRow[]
 *      ↓
 * ScheduleTable.tsx
 *      ↓
 * HTML table表示
 *
 * Pythonで例えると、
 * 計算済みデータを受け取って表示する
 * print_table() のような役割。
 */

import type { ScheduleRow } from "../types";

import "./ScheduleTable.css";
import { timeToMinutes } from "../utils/time";

/**
 * ScheduleTableが受け取るデータ定義。
 *
 * Reactでは、コンポーネントへ渡す値を
 * Props（プロップス）と呼ぶ。
 *
 * Pythonでいう関数の引数に近い。
 *
 * 例:
 *
 * ScheduleTable(
 *   rows=data,
 *   spotCount=20
 * )
 */
type Props = {
  // 表示するスケジュール
  rows: ScheduleRow[];
  // スポット数
  spotCount: number;
  spotNames: string[];
  now: Date;
  joinedTime: string | null;

  // セルをクリックした時に親(App.tsx)へ通知する関数
  onCellClick: (time: string, spotIndex: number) => void;
  onSpotNameChange: (index: number, name: string) => void;
  onResetSpot: (spotIndex: number) => void;
  onJoinTime: (time: string) => void;
};

/**
 * スケジュール表を表示するReactコンポーネント。
 *
 * @param rows 表示する時刻データ
 * @param spotCount スポット総数
 */
export default function ScheduleTable({
  rows,
  spotCount,
  spotNames,
  now,
  joinedTime,
  onCellClick,
  onSpotNameChange,
  onResetSpot,
  onJoinTime,
}: Props) {
  function isCurrentRow(time: string): boolean {
    const current = now.getHours() * 60 + now.getMinutes();

    const row = timeToMinutes(time);

    return current >= row && current < row + 25;
  }

  function isJoinTargetRow(time: string): boolean {
    const targets = getJoinTargetTimes();

    const row = timeToMinutes(time);

    return targets.some((target) => {
      return row <= target && target < row + 25;
    });
  }

  function getJoinTargetTimes(): number[] {
    if (!joinedTime) {
      return [];
    }

    const targets: number[] = [];

    let target = timeToMinutes(joinedTime) + 180;

    const end = 24 * 60;

    while (target <= end) {
      targets.push(target);

      target += 180;
    }

    return targets;
  }

  return (
    <table className="schedule-table">
      {/* 表のヘッダー部分 */}
      <thead>
        <tr>
          {/* 左端は時刻列 */}
          <th>時刻</th>

          {/*
            スポット数分だけ列を作る。

            例:
            spotCount = 5

            ↓

            Spot1
            Spot2
            Spot3
            Spot4
            Spot5

            を自動生成する。

            Pythonなら:

            for i in range(5):
                print(i)

            に近い。
          */}
          {Array.from({ length: spotCount }).map((_, i) => (
            <th key={i}>
              <input
                type="text"
                value={spotNames[i]}
                onChange={(e) => onSpotNameChange(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
              />

              <button onClick={() => onResetSpot(i)}>×</button>
            </th>
          ))}
        </tr>
      </thead>

      {/* 表の本体部分 */}
      <tbody>
        {/*
          rowsを1行ずつ表示する。

          Python:

          for row in rows:
              ...

          と同じ考え方。

        */}
        {rows.map((row, index) => (
          <tr
            key={`${row.time}-${index}`}
            className={
              isJoinTargetRow(row.time)
                ? "join-target-row"
                : isCurrentRow(row.time)
                  ? "current-row"
                  : ""
            }
          >
            {/* 時刻表示 */}
            <td>{row.time}</td>

            {/*
              各スポット状態を表示。

              row.spotsの中身:

              [
                false,
                false,
                true,
                false
              ]

              の場合、

              Spot3だけ●になる。
            */}
            {row.spots.map((active, i) => (
              <td
                key={i}
                className={
                  active
                    ? isJoinTargetRow(row.time)
                      ? "active-cell join-target-cell"
                      : "active-cell"
                    : ""
                }
                onClick={() => onCellClick(row.time, i)}
                onDoubleClick={() => {
                  if (active) {
                    onJoinTime(row.time);
                  }
                }}
              >
                {active ? (joinedTime === row.time ? "★" : "●") : ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
