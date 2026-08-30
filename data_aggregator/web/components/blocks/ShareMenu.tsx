"use client";

import { useEffect, useRef, useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import ShareBar from "./ShareBar";

/**
 * The header's Share button: a small popover with the share pills (WhatsApp / X / LinkedIn / Telegram / copy).
 * Uses `navigator.share` directly when the device has it (phones), so one tap opens the native sheet.
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

  async function onClick() {
    const nav = navigator as Navigator & { share?: (d: { title?: string; text?: string; url?: string }) => Promise<void> };
    if (typeof nav.share === "function" && window.matchMedia("(max-width: 767px)").matches) {
      try {
        await nav.share({ title: t(lang, "site.name"), text: t(lang, "share.text"), url: window.location.origin + `/${lang}` });
        return;
      } catch {
        /* cancelled → show the pills */
      }
    }
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
        <div role="dialog" aria-label={t(lang, "share.title")} className="absolute right-0 top-[calc(100%+8px)] z-30 min-w-[280px] bg-card b-ink rounded-r2 shadow-hard-3 p-3">
          <ShareBar lang={lang} path="/" variant="compact" />
        </div>
      ) : null}
    </div>
  );
}
