/**
 * Accordion.tsx
 *
 * 開閉可能なセクションを表示するコンポーネント。
 *
 * このファイルではデータ管理や計算は行わない。
 *
 * 役割:
 * 1. タイトルを表示する
 * 2. 開閉状態を切り替える
 * 3. 展開中のみ子要素を表示する
 *
 * 開閉状態の管理方法は、
 * 将来的な用途に応じて変更できるよう設計する。
 */

import { useState, type ReactNode } from "react";
import "./Accordion.css";

type Props = {
  title: string;
  children?: ReactNode;
};

export default function Accordion({ title, children }: Props) {
  const [open, setOpen] = useState(true);
  return (
    <section className="accordion">
      <button
        type="button"
        className="accordion-header"
        onClick={() => setOpen((old) => !old)}
      >
        <span>{title}</span>

        <span>{open ? "▼" : "▶"}</span>
      </button>

      {open && children}
    </section>
  );
}
