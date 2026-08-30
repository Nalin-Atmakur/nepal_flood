"use client";

import { useEffect, useRef, useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import ShareBar from "./ShareBar";

/**
 * The header's Share button: a small popover with the share pills (WhatsApp / X / LinkedIn / Telegram / copy).
 * Always the pills — on phones too: WhatsApp through wa.me carries the hook text and gets a link preview, which the
 * native share sheet does not give a text+URL share (docs/19 #10). The sheet is still there as "More…".
 */
export default function ShareMenu({ lang, size = "md" }: { lang: Lang; size?: "md" | "sm" }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /** Always the pills: WhatsApp via wa.me gets the hook *and* a preview; the native sheet is "More…" in the pills (docs/19 #10). */
  function onClick() {
    setOpen((v) => !v);
  }

  const cls =
    size === "sm"
      ? "inline-flex items-center justify-center min-h-[40px] px-3 rounded-r2 b-ink-2 bg-card font-bold text-[12.5px] text-ink cursor-pointer hover:bg-ground"
      : "inline-flex items-center justify-center min-h-[44px] px-4 rounded-r2 b-ink-2 bg-card font-bold text-[14px] text-ink cursor-pointer hover:bg-ground";

  return (
    <div ref={boxRef} className="relative">
      <button type="button" onClick={onClick} aria-expanded={open} aria-haspopup="dialog" className={cls} data-testid="share-menu">
        ↗ {t(lang, "nav.share")}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label={t(lang, "share.title")}
          className="fixed md:absolute left-3 right-3 bottom-[84px] md:left-auto md:right-0 md:bottom-auto md:top-[calc(100%+8px)] z-40 md:min-w-[300px] bg-card b-ink rounded-r2 shadow-hard-3 p-3"
          data-testid="share-popover"
        >
          <div className="flex items-center justify-between mb-2 md:hidden">
            <span className="font-extrabold text-[14px]">{t(lang, "share.title")}</span>
            <button type="button" onClick={() => setOpen(false)} className="inline-grid place-items-center w-8 h-8 rounded-full b-ink-2 bg-card font-extrabold cursor-pointer" aria-label={t(lang, "corridor.disarm")}>
              ×
            </button>
          </div>
          <ShareBar lang={lang} path="/" variant="compact" />
        </div>
      ) : null}
    </div>
  );
}
