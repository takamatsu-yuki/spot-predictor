/**
 * AreaAccordion.tsx
 *
 * 1つのエリア設定を折りたたみ表示するコンポーネント。
 *
 * このファイルではデータ管理は行わない。
 *
 * 役割:
 * 1. エリア名を表示する
 * 2. エリア単位で開閉する
 * 3. エリア設定を子要素として表示する
 */

import { useState, type ReactNode } from "react";
import "./AreaAccordion.css";

type Props = {
  title: string;
  children?: ReactNode;
};

export default function AreaAccordion({ title, children }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <section className="area-accordion">
      <button
        type="button"
        className="area-accordion-header"
        onClick={() => setOpen((old) => !old)}
      >
        <span>{title}</span>

        <span>{open ? "▼" : "▶"}</span>
      </button>

      {open && children}
    </section>
  );
}
