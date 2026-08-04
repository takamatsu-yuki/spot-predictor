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

import type { ScheduleRow, SpotGroup, JoinedMark } from "../types";

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
  // セルをクリックした時に親(App.tsx)へ通知する関数
  onCellClick: (groupId: string, time: string, spotIndex: number) => void;
  onSpotNameChange: (groupId: string, index: number, name: string) => void;
  onResetSpot: (groupId: string, spotIndex: number) => void;
  onGroupNameChange: (groupId: string, name: string) => void;

  joinedMarks: JoinedMark[];
  onToggleJoined: (time: string) => void;
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
  joinedMarks,
  onToggleJoined,
  onCellClick,
  onSpotNameChange,
  onResetSpot,
  onGroupNameChange,
}: Props) {
  const currentRowRef = useRef<HTMLDivElement | null>(null);
  const spotCount = groups.reduce((sum, g) => sum + g.spotCount, 0);

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

  function isJoined(time: string): boolean {
    return joinedMarks.some((mark) => mark.time === time);
  }

  function getJoinTargetTimes(): number[] {
    if (joinedMarks.length === 0) {
      return [];
    }

    const latest = joinedMarks.reduce((latest, current) =>
      timeToMinutes(current.time) > timeToMinutes(latest.time)
        ? current
        : latest,
    );

    const targets: number[] = [];

    let target = timeToMinutes(latest.time) + 180;

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
        const headerHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--header-height",
          ),
        );

        const y = currentRowRef.current.offsetTop - headerHeight - 150;

        window.scrollTo({
          top: y,
          behavior: "smooth",
        });
      }
    }, 100);
  }, []);

  return (
    <div
      className="grid-table"
      style={
        {
          "--spot-count": spotCount,
          "--row-count": groups[0]?.rows.length ?? 0,
        } as React.CSSProperties
      }
    >
      {/* 左上の交点セル */}
      <div
        className="grid-cell sticky-corner"
        style={{ gridRow: "1 / span 2", gridColumn: 1 }}
      >
        時刻
      </div>

      {/* 1行目：イベント名（colSpan） */}
      {groups.map((g, groupIndex) => {
        const startColumn =
          2 +
          groups
            .slice(0, groupIndex)
            .reduce((sum, gg) => sum + gg.spotCount, 0);

        return (
          <div
            key={g.id}
            className={
              "grid-cell sticky-top-1" + (groupIndex > 0 ? " group-start" : "")
            }
            style={{
              gridRow: 1,
              gridColumn: `${startColumn} / span ${g.spotCount}`,
            }}
          >
            <input
              type="text"
              value={g.name}
              aria-label="イベント名"
              onChange={(e) => onGroupNameChange(g.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
          </div>
        );
      })}

      {/* 2行目：Spot 名（グループごとに列位置をずらす） */}
      {groups.map((g, groupIndex) =>
        g.spotNames.map((name, spotIndex) => (
          <div
            key={`${g.id}-${spotIndex}`}
            className={
              "grid-cell sticky-top-2" +
              (groupIndex > 0 && spotIndex === 0 ? " group-start" : "")
            }
            style={{
              gridRow: 2,
              gridColumn:
                2 +
                groups
                  .slice(0, groupIndex)
                  .reduce((sum, gg) => sum + gg.spotCount, 0) +
                spotIndex,
            }}
          >
            <input
              type="text"
              value={name}
              onChange={(e) =>
                onSpotNameChange(g.id, spotIndex, e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
            <button onClick={() => onResetSpot(g.id, spotIndex)}>×</button>
          </div>
        )),
      )}

      {/* 本体（行 3 以降） */}
      {groups[0].rows.map((row, rowIndex) => {
        const r = 3 + rowIndex;

        const rowClass =
          "grid-cell" +
          (isCurrentRow(row.time) ? " current-row" : "") +
          (isJoinTargetRow(row.time) ? " join-target-row" : "");

        return (
          <>
            <div
              ref={(el) => {
                if (isCurrentRow(row.time)) {
                  currentRowRef.current = el;
                }
              }}
              className={rowClass + " sticky-left"}
              style={{ gridRow: r, gridColumn: 1 }}
            >
              {row.time}
            </div>

            {groups.map((g, groupIndex) =>
              g.rows[rowIndex].spots.map((active, spotIndex) => (
                <div
                  key={`${g.id}-${spotIndex}-${row.time}`}
                  className={
                    rowClass +
                    (active
                      ? isJoinTargetRow(row.time)
                        ? " active-cell join-target-cell"
                        : " active-cell"
                      : "") +
                    (groupIndex > 0 && spotIndex === 0 ? " group-start" : "")
                  }
                  style={{
                    gridRow: r,
                    gridColumn:
                      2 +
                      groups
                        .slice(0, groupIndex)
                        .reduce((sum, gg) => sum + gg.spotCount, 0) +
                      spotIndex,
                  }}
                  onClick={() => onCellClick(g.id, row.time, spotIndex)}
                  onDoubleClick={() => onToggleJoined(row.time)}
                >
                  {active ? (isJoined(row.time) ? "★" : "●") : ""}
                </div>
              )),
            )}
          </>
        );
      })}
    </div>
  );
}
