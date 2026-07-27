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

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: Props) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>メニュー</h2>

        <button className="sidebar-close" onClick={onClose}>
          ×
        </button>
      </div>
    </aside>
  );
}
