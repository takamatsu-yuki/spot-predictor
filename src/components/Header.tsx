/**
 * Header.tsx
 *
 * アプリ上部のヘッダーを表示するコンポーネント。
 *
 * このファイルでは状態管理は行わない。
 *
 * 役割:
 * 1. アプリタイトルを表示する
 * 2. メニューボタンを表示する
 * 3. メニューを開く操作を親(App.tsx)へ通知する
 *
 * メニューの開閉状態や画面全体の管理は
 * App.tsx
 * が担当する。
 */

import "./Header.css";

type Props = {
  onMenuClick: () => void;
};

export default function Header({ onMenuClick }: Props) {
  return (
    <header className="app-header">
      <h1>MHNow Spot Predictor</h1>

      <button
        type="button"
        className="menu-button"
        onClick={onMenuClick}
        aria-label="メニューを開く"
      >
        ☰
      </button>
    </header>
  );
}
