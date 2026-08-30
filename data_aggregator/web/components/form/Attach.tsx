"use client";

import { useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { t, type Lang } from "@/lib/i18n";
import { ACCEPT, MAX_BYTES, MAX_FILES, fileKind, fmtBytes, rejectReason, type FileKind } from "@/lib/uploads";

/**
 * "Attach anything that helps" — the drop zone under the box (docs/06-report-flow.md §Attachments).
 * Files are only held in memory here; TheBox uploads them after the report row exists. On phones the two
 * buttons open the camera / the picker directly; on desktop the zone accepts drops. Encouraging, not mandatory.
 */
type Props = {
  lang: Lang;
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  /** while sending: files done / total */
  progress?: { done: number; total: number } | null;
};

const ICON: Record<FileKind, string> = { image: "🖼️", video: "🎬", audio: "🎙️", document: "📄" };

export default function Attach({ lang, files, onChange, disabled = false, progress = null }: Props) {
  const inputId = useId();
  const cameraId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function add(list: FileList | File[] | null) {
    if (!list) return;
    const next = [...files];
    let rejected: string | null = null;
    for (const f of Array.from(list)) {
      const why = rejectReason(f, next.length);
      if (why) {
        rejected = why === "too_big" ? t(lang, "attach.too_big", { mb: String(Math.round(MAX_BYTES / 1024 / 1024)) }) : t(lang, "attach.too_many", { n: String(MAX_FILES) });
        continue;
      }
      if (next.some((x) => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified)) continue;
      next.push(f);
    }
    setNote(rejected);
    onChange(next);
  }

  function onInput(e: ChangeEvent<HTMLInputElement>) {
    add(e.target.files);
    e.target.value = "";
  }
  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setOver(false);
    if (!disabled) add(e.dataTransfer.files);
  }

  return (
    <div className="mt-4 md:mt-5" data-testid="attach">
      <div className="font-bold text-[13px] md:text-[14px]">{t(lang, "attach.title")}</div>
      <div className="font-medium text-[12px] text-muted lh-body mt-[2px]">{t(lang, "attach.sub")}</div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={[
          "mt-2 rounded-r2 border-[2.5px] border-dashed px-3 py-3 md:px-4 md:py-4 flex flex-wrap items-center gap-2 md:gap-3 transition-colors",
          over ? "border-ultra bg-amber-fill/40" : "border-ink bg-card",
          disabled ? "opacity-60" : "",
        ].join(" ")}
      >
        <label
          htmlFor={inputId}
          className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-r2 b-ink-2 bg-board text-white font-extrabold text-[14px] cursor-pointer shadow-hard-2 press-2"
        >
          ＋ {t(lang, "attach.add")}
        </label>
        <input ref={inputRef} id={inputId} type="file" multiple accept={ACCEPT} onChange={onInput} disabled={disabled} className="sr-only" data-testid="attach-input" />
        {/* camera / mic shortcuts (mobile pickers honour `capture`; desktop just opens the picker) */}
        <label htmlFor={cameraId} className="md:hidden inline-flex items-center justify-center min-h-[44px] px-4 rounded-r2 b-ink-2 bg-card font-bold text-[14px] cursor-pointer">
          📷 {t(lang, "attach.camera")}
        </label>
        <input id={cameraId} type="file" accept="image/*,video/*" capture="environment" onChange={onInput} disabled={disabled} className="sr-only" />
        <span className="hidden md:inline font-medium text-[12px] text-muted">{t(lang, "attach.drop_hint")}</span>
      </div>

      {files.length ? (
        <ul className="list-none m-0 p-0 mt-2 flex flex-col gap-[6px]" aria-label={t(lang, "attach.title")}>
          {files.map((f, i) => {
            const kind = fileKind(f.name, f.type);
            return (
              <li key={`${f.name}-${f.size}-${i}`} className="flex items-center gap-2 bg-card b-ink-2 rounded-r2 px-3 py-[6px] min-h-[40px]">
                <span aria-hidden="true">{ICON[kind]}</span>
                <span className="font-semibold text-[13px] truncate flex-1">{f.name}</span>
                <span className="font-medium text-[11px] text-muted num whitespace-nowrap">{fmtBytes(f.size)}</span>
                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => onChange(files.filter((_, j) => j !== i))}
                    aria-label={t(lang, "attach.remove", { name: f.name })}
                    className="inline-grid place-items-center w-8 h-8 rounded-full b-ink-2 bg-card font-extrabold cursor-pointer hover:bg-ground"
                  >
                    ×
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {progress ? (
        <p role="status" className="font-semibold text-[12px] text-muted mt-2 num">
          {t(lang, "attach.uploading", { done: String(progress.done), total: String(progress.total) })}
        </p>
      ) : null}
      {note ? (
        <p role="alert" className="font-semibold text-[12px] text-amber-text mt-2">
          {note}
        </p>
      ) : null}
    </div>
  );
}
