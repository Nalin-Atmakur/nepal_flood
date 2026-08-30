"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { href, t, type Lang } from "@/lib/i18n";
import ShareBar from "./ShareBar";

/**
 * "More" on phones (web/docs/17-information-architecture.md): one button in the header row that opens a small
 * sheet with Sources · About · My folder and the share pills — so the phone header stays logo + LIVE + language + More
 * while the bottom bar carries Home · Numbers · Add · Places · Latest.
 */
export default function MoreMenu({ lang }: { lang: Lang }) {
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

  const item = "flex items-center min-h-[44px] px-3 rounded-r2 font-bold text-[14px] text-ink no-underline hover:bg-ground";

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex items-center justify-center min-h-[40px] px-3 rounded-r2 b-ink-2 bg-card font-bold text-[12.5px] text-ink cursor-pointer hover:bg-ground"
        data-testid="more-menu"
      >
        ⋯ {t(lang, "tabs.more")}
      </button>
      {open ? (
        <div role="dialog" aria-label={t(lang, "tabs.more")} className="absolute right-0 top-[calc(100%+8px)] z-30 min-w-[260px] bg-card b-ink rounded-r2 shadow-hard-3 p-2">
          <Link href={href(lang, "/sources")} className={item} onClick={() => setOpen(false)}>
            {t(lang, "nav.sources")}
          </Link>
          <Link href={href(lang, "/about")} className={item} onClick={() => setOpen(false)}>
            {t(lang, "nav.about")}
          </Link>
          <Link href={href(lang, "/me")} className={item} onClick={() => setOpen(false)}>
            {t(lang, "nav.me")}
          </Link>
          <div className="border-t-[2px] border-rule mt-2 pt-2 px-1">
            <div className="font-bold text-[12px] text-muted mb-2">{t(lang, "share.title")}</div>
            <ShareBar lang={lang} path="/" variant="compact" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
