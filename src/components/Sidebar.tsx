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

import { useState } from "react";
import "./Sidebar.css";
import AreaSettings from "./AreaSettings";
import type { SpotGroup } from "../types";
import Accordion from "./Accordion";
import { parseCooldownInput } from "../utils/timeHelpers";

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

  reversePreview: {
    raw: string;
    rounded: string;
    snapped: string;
  } | null;

  onReverseImmediate: (minutes: number) => void;
  onReverseCalculate: (minutes: number) => void;
  onReverseRegister: () => void;
};

function Section({
  title,
  info,
  children,
}: {
  title: string;
  info?: string;
  children: React.ReactNode;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="sidebar-section">
      <div className="sidebar-section-header">
        <h3 className="sidebar-section-title">{title}</h3>

        {info && (
          <div
            className="section-info-wrapper"
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <span className="section-info-icon">ℹ️</span>

            <div className={`section-tooltip ${showTooltip ? "visible" : ""}`}>
              {info}
            </div>
          </div>
        )}
      </div>

      {children}
    </div>
  );
}

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
  reversePreview,
  onReverseImmediate,
  onReverseCalculate,
  onReverseRegister,
}: Props) {
  const [remainingCooldown, setRemainingCooldown] = useState("");

  return (
    <>
      {/* サイドバーの外側を覆う背景 */}
      <div
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />

      {/* サイドバー本体 */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* 固定ヘッダー */}
        <div className="sidebar-header">
          <h2>メニュー</h2>
          <button type="button" className="sidebar-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* スクロール領域 */}
        <div className="sidebar-content">
          {/* 全体設定 */}
          <Section title="全体設定">
            <label className="event-options">
              <input
                type="checkbox"
                checked={is24Hour}
                onChange={(e) => setIs24Hour(e.target.checked)}
              />
              24時間開催イベント中
            </label>

            <button onClick={handleResetAll}>全スポット入力リセット</button>
          </Section>

          {/* クールタイム逆算 */}
          <Section
            title="クールタイム逆算"
            info="例: 90、1:30、1h30m、1時間30分、1時間半"
          >
            <div className="cooldown-field">
              <label>残りクールタイム</label>
              <input
                type="text"
                value={remainingCooldown}
                onChange={(e) => setRemainingCooldown(e.target.value)}
                placeholder="例: 90 / 1:30 / 1時間30分"
              />
            </div>

            {/* ボタン1：即時登録 */}
            <button
              onClick={() => {
                const minutes = parseCooldownInput(remainingCooldown);

                if (minutes === null) {
                  alert(
                    "入力形式が正しくありません（例: 90, 1:30, 1h30m, 1時間30分）",
                  );
                  return;
                }

                onReverseImmediate(minutes);
                // 登録後に入力を消す
                setRemainingCooldown("");
              }}
            >
              即時登録
            </button>

            {/* ボタン2：計算だけ */}
            <button
              onClick={() => {
                const minutes = parseCooldownInput(remainingCooldown);

                if (minutes === null) {
                  alert(
                    "入力形式が正しくありません（例: 90, 1:30, 1h30m, 1時間30分）",
                  );
                  return;
                }

                onReverseCalculate(minutes);
              }}
            >
              計算する
            </button>

            {/* ボタン3：計算結果を登録 */}
            <button
              disabled={!reversePreview}
              onClick={() => {
                onReverseRegister();
                // 登録後に入力を消す
                setRemainingCooldown("");
              }}
            >
              計算結果を登録
            </button>

            {/* 計算結果の表示 */}
            {reversePreview && (
              <div className="reverse-result">
                逆算: {reversePreview.raw} ⇒ 参加時刻列:{" "}
                {reversePreview.snapped}
              </div>
            )}
          </Section>

          {/* エリア管理 */}
          <Section title="エリア管理">
            <Accordion title="エリア一覧">
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
          </Section>
        </div>
      </aside>
    </>
  );
}
