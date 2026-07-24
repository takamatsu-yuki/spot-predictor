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

import type { ScheduleRow, SpotGroup } from "../types";

import "./ScheduleTable.css";
import { useEffect, useRef } from "react";
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
  groups: (SpotGroup & { rows: ScheduleRow[] })[];
  now: Date;
  joinedTime: string | null;
  // セルをクリックした時に親(App.tsx)へ通知する関数
  onCellClick: (groupId: string, time: string, spotIndex: number) => void;
  onSpotNameChange: (groupId: string, index: number, name: string) => void;
  onResetSpot: (groupId: string, spotIndex: number) => void;
  onJoinTime: (time: string) => void;
  onGroupNameChange: (groupId: string, name: string) => void;
};

/**
 * スケジュール表を表示するReactコンポーネント。
 *
 * @param rows 表示する時刻データ
 * @param spotCount スポット総数
 */
export default function ScheduleTable({
  groups,
  now,
  joinedTime,
  onCellClick,
  onSpotNameChange,
  onResetSpot,
  onJoinTime,
  onGroupNameChange,
}: Props) {
  const currentRowRef = useRef<HTMLTableRowElement | null>(null);

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

  useEffect(() => {
    setTimeout(() => {
      if (currentRowRef.current) {
        const y = currentRowRef.current.offsetTop - 30;

        window.scrollTo({
          top: y,
          behavior: "smooth",
        });
      }
    }, 100);
  }, []);

  return (
    <table className="schedule-table">
      {/* 表のヘッダー部分 */}
      <thead>
        {/* 1行目 */}
        <tr>
          <th rowSpan={2}>時刻</th>

          {groups.map((group, groupIndex) => (
            <th
              key={group.id}
              colSpan={group.spotCount}
              className={groupIndex > 0 ? "group-start" : ""}
            >
              <input
                type="text"
                value={group.name}
                aria-label="イベント名"
                onChange={(e) => onGroupNameChange(group.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
              />
            </th>
          ))}
        </tr>

        {/* 2行目 */}
        <tr>
          {groups.map((group, groupIndex) =>
            group.spotNames.map((spotName, i) => (
              <th
                key={`${group.id}-${i}`}
                className={groupIndex > 0 && i === 0 ? "group-start" : ""}
              >
                <input
                  type="text"
                  value={spotName}
                  onChange={(e) =>
                    onSpotNameChange(group.id, i, e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                />

                <button onClick={() => onResetSpot(group.id, i)}>×</button>
              </th>
            )),
          )}
        </tr>
      </thead>

      {/* 表の本体部分 */}
      <tbody>
        {groups[0]?.rows.map((row, index) => (
          <tr
            key={row.time}
            ref={(el) => {
              if (isCurrentRow(row.time)) {
                currentRowRef.current = el;
              }
            }}
            className={[
              isJoinTargetRow(row.time) ? "join-target-row" : "",
              isCurrentRow(row.time) ? "current-row" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <td>{row.time}</td>

            {groups.map((group, groupIndex) =>
              group.rows[index].spots.map((active, i) => (
                <td
                  key={`${group.id}-${i}`}
                  className={[
                    active
                      ? isJoinTargetRow(row.time)
                        ? "active-cell join-target-cell"
                        : "active-cell"
                      : "",

                    groupIndex > 0 && i === 0 ? "group-start" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onCellClick(group.id, row.time, i)}
                  onDoubleClick={() => {
                    if (active) onJoinTime(row.time);
                  }}
                >
                  {active ? (joinedTime === row.time ? "★" : "●") : ""}
                </td>
              )),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
