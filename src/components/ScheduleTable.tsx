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
  /**
   * 表示するスケジュール
   */
  rows: ScheduleRow[];

  /**
   * スポット数
   */
  spotCount: number;

  spotNames: string[];

  /**
   * セルをクリックした時に
   * 親(App.tsx)へ通知する関数
   */
  onCellClick: (time: string, spotIndex: number) => void;
  onSpotNameChange: (index: number, name: string) => void;
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
  onCellClick,
  onSpotNameChange,
}: Props) {
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
          <tr key={`${row.time}-${index}`}>
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
                className={active ? "active-cell" : ""}
                onClick={() => onCellClick(row.time, i)}
              >
                {active ? "●" : ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
