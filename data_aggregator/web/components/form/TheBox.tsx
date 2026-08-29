"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import DarkCard from "@/components/ui/DarkCard";
import { RATE_LIMIT, SPEECH_LANG, type RespondentType } from "@/lib/config";
import { fmtCadence } from "@/lib/format";
import { LANG_NAMES, localised, t, type Lang } from "@/lib/i18n";
import type { PlaceRef } from "@/lib/queries";
import { checkRateLimit, insertReport, logSubmission, recordSend } from "@/lib/reports";
import { browserClient, ensureSession } from "@/lib/supabase";
import PlacePicker, { PLACE_INPUT_CLASS, type PlaceValue } from "./PlacePicker";

/**
 * THE box (Report v2 screens 2 + 3 + desktop): one textarea + mic, prompt chips that insert text,
 * two optional fields (place, contact), Send. One component for both breakpoints — the aside with
 * Where / Your contact sits between the chips and Send on mobile and in the right column on md+.
 */

export type BoxMode = "add" | "correct" | null;

type Props = {
  lang: Lang;
  type: RespondentType;
  places: PlaceRef[];
  initialText?: string;
  initialPlaceId?: string | null;
  supersedes?: string | null;
  mode?: BoxMode;
  onBack: () => void;
  onSent: (id: string, placeId?: string | null) => void;
};

/** Chip sets per respondent, in design order (messages: chips.<type>.<key>). */
const CHIPS: Record<RespondentType, string[]> = {
  family: ["who", "where", "when", "said", "with", "phone", "plans", "reported"],
  survivor: ["where_you", "with_you", "saw", "went", "still", "now"],
  rescuer: ["place", "when", "how", "evacuated", "remaining", "not_reached", "access"],
  agency: ["group", "how_many", "itinerary", "last_contact", "accounted", "unaccounted", "roster"],
};

// ---- Web Speech API (prefixed in Chrome / Safari; absent in Firefox) ----
type SpeechAlt = { transcript: string };
type SpeechRes = { isFinal: boolean; length: number; [i: number]: SpeechAlt };
type SpeechResultEvt = { resultIndex: number; results: { length: number; [i: number]: SpeechRes } };
type SpeechErrorEvt = { error: string };
type Recogniser = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechResultEvt) => void) | null;
  onerror: ((e: SpeechErrorEvt) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
type RecogniserCtor = new () => Recogniser;

function getRecogniser(): RecogniserCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecogniserCtor; webkitSpeechRecognition?: RecogniserCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const noopSubscribe = () => () => {};
/** true / false on the client, null during SSR and hydration (so the server markup never claims support). */
function useMicSupported(): boolean | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => getRecogniser() !== null,
    () => null,
  );
}

const DESKTOP = "(min-width: 768px)";
function subscribeDesktop(cb: () => void) {
  const m = window.matchMedia(DESKTOP);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
/** Only used to pick between the mobile and desktop placeholder strings — layout itself is CSS. */
function useDesktop(): boolean {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP).matches,
    () => false,
  );
}

function joinSpeech(base: string, more: string): string {
  const add = more.trim();
  if (!add) return base;
  if (!base) return add;
  return /\s$/.test(base) ? base + add : `${base} ${add}`;
}

function MicIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}

export default function TheBox({ lang, type, places, initialText = "", initialPlaceId = null, supersedes = null, mode = null, onBack, onSent }: Props) {
  const uid = useId();
  const taRef = useRef<HTMLTextAreaElement>(null);
  const caretRef = useRef<number | null>(null);
  const recRef = useRef<Recogniser | null>(null);

  const [text, setText] = useState(initialText);
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState<"denied" | null>(null);
  const [place, setPlace] = useState<PlaceValue | null>(() => {
    if (!initialPlaceId) return null;
    const p = places.find((x) => x.id === initialPlaceId);
    return p ? { id: p.id, label: localised(p, "name", lang) || p.name_en } : null;
  });
  const [contact, setContact] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const micSupported = useMicSupported();
  const desktop = useDesktop();
  const cadence = fmtCadence(lang);
  const chips = useMemo(() => CHIPS[type].map((k) => ({ key: k, label: t(lang, `chips.${type}.${k}`) })), [type, lang]);

  // Place the caret after a chip insertion once the new text has rendered.
  useEffect(() => {
    const pos = caretRef.current;
    if (pos === null) return;
    caretRef.current = null;
    const ta = taRef.current;
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(pos, pos);
  }, [text]);

  // Stop the recogniser if the box unmounts mid-dictation.
  useEffect(() => {
    return () => {
      const rec = recRef.current;
      if (rec) {
        rec.onresult = null;
        rec.onend = null;
        rec.onerror = null;
        try {
          rec.abort();
        } catch {
          // already stopped
        }
      }
    };
  }, []);

  function insertChip(label: string) {
    const ins = `${label}: `;
    const ta = taRef.current;
    const pos = ta ? ta.selectionStart : text.length;
    const before = text.slice(0, pos);
    const after = text.slice(pos);
    const needsNewline = text.length > 0 && before.length > 0 && !before.endsWith("\n");
    const inserted = (needsNewline ? "\n" : "") + ins;
    caretRef.current = before.length + inserted.length;
    setText(before + inserted + after);
  }

  function stopMic() {
    const rec = recRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      // ignore
    }
  }

  function toggleMic() {
    if (listening) {
      stopMic();
      return;
    }
    const Ctor = getRecogniser();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = SPEECH_LANG[lang];
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let finals = "";
      let partial = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const alt = r[0];
        if (!alt) continue;
        if (r.isFinal) finals += `${alt.transcript} `;
        else partial += alt.transcript;
      }
      if (finals.trim()) setText((prev) => joinSpeech(prev, finals));
      setInterim(partial.trim());
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed" || e.error === "audio-capture") setMicError("denied");
    };
    rec.onend = () => {
      recRef.current = null;
      setListening(false);
      setInterim("");
    };
    recRef.current = rec;
    setMicError(null);
    try {
      rec.start();
      setListening(true);
    } catch {
      recRef.current = null;
      setMicError("denied");
    }
  }

  async function send() {
    if (sending) return;
    setError(null);
    stopMic();
    if (honeypot.trim()) {
      // Bot filled the hidden field: pretend success, store nothing.
      onSent("", null);
      return;
    }
    const body = text.trim();
    if (body.length < 3) {
      setError(t(lang, "report.err_empty"));
      return;
    }
    const rl = checkRateLimit(Date.now());
    if (!rl.ok) {
      setError("hourly" in rl ? t(lang, "report.err_rate_hour", { n: RATE_LIMIT.perHour }) : t(lang, "report.err_rate", { s: rl.waitSeconds }));
      return;
    }
    const sb = browserClient();
    if (!sb) {
      setError(t(lang, "report.err_unconfigured"));
      return;
    }
    setSending(true);
    try {
      const userId = await ensureSession(sb, lang);
      if (!userId) {
        setError(t(lang, "report.err_unconfigured"));
        return;
      }
      const res = await insertReport(sb, {
        userId,
        lang,
        respondentType: type,
        text: body,
        placeId: place?.id ?? null,
        contact: contact.trim() || null,
        supersedes: supersedes || null,
      });
      if ("error" in res) {
        setError(t(lang, "report.err_failed"));
        return;
      }
      recordSend(Date.now());
      void logSubmission(sb, type, lang);
      onSent(res.id, place?.id ?? null);
    } catch {
      setError(t(lang, "report.err_failed"));
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void send();
  }

  const boxText = "font-medium text-[15px] md:text-[16px] leading-[1.75] md:leading-[1.8] px-[14px] pt-[14px] pb-[56px] md:px-[18px] md:pt-[18px] md:pb-[64px]";
  const fieldHint = "font-medium text-[11px] md:text-[11.5px] text-muted mt-[3px] md:mt-[5px]";
  const contactId = `${uid}-contact`;
  const contactHintId = `${uid}-contact-hint`;
  const micDisabled = micSupported === false;
  const asideCard = "md:bg-card md:b-ink md:rounded-r2 md:shadow-hard-3 md:p-4";

  return (
    <form onSubmit={onSubmit} noValidate data-step="box" className="flex flex-col md:grid md:grid-cols-[1fr_380px] md:gap-8 md:items-start">
      {/* ---- left column, part 1: title, box, chips ---- */}
      <div className="order-1 md:col-start-1 md:row-start-1">
        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={onBack}
            aria-label={t(lang, "nav.back")}
            className="inline-grid place-items-center min-w-[44px] min-h-[44px] -ml-3 font-extrabold text-[18px] text-ink cursor-pointer rounded-r2"
          >
            <span aria-hidden="true">←</span>
          </button>
          <h1 className="font-extrabold text-[24px] md:text-[32px] lh-tight">{t(lang, "report.title")}</h1>
        </div>
        <p className="font-medium text-[14px] md:text-[15px] text-muted lh-body mt-1 md:mt-[6px]">
          <span className="md:hidden">{t(lang, "report.sub")}</span>
          <span className="hidden md:inline">{t(lang, "report.sub_desktop")}</span>
        </p>
        {supersedes ? (
          <p className="font-semibold text-[12px] text-muted mt-3 md:mt-4">{t(lang, mode === "correct" ? "report.correcting" : "report.superseding")}</p>
        ) : null}

        {/* the box */}
        <div
          data-listening={listening || undefined}
          className={[
            "relative bg-card rounded-r2 border-[2.5px] border-solid mt-[14px] md:mt-[18px]",
            "has-[textarea:focus-visible]:outline-[3px] has-[textarea:focus-visible]:outline-ultra has-[textarea:focus-visible]:outline-offset-2",
            listening ? "border-live shadow-live-3" : "border-ink shadow-hard-3 md:shadow-hard-4",
          ].join(" ")}
        >
          <div className="grid">
            {/* Sizing ghost: keeps the box growing with the text, and shows the interim transcript greyed after it. */}
            <div aria-hidden="true" className={["[grid-area:1/1/2/2] whitespace-pre-wrap break-words text-transparent min-h-[160px] md:min-h-[200px]", boxText].join(" ")}>
              <span>{text}</span>
              {listening && interim ? (
                <span className="text-hint">
                  {text && !/\s$/.test(text) ? " " : ""}
                  {interim}…
                </span>
              ) : null}
              {" "}
            </div>
            <textarea
              ref={taRef}
              data-testid="the-box"
              aria-label={t(lang, "report.box_label")}
              placeholder={t(lang, "report.placeholder")}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={20000}
              rows={1}
              className={["[grid-area:1/1/2/2] w-full block bg-transparent text-ink resize-none overflow-hidden outline-none min-h-[160px] md:min-h-[200px]", boxText].join(" ")}
            />
          </div>

          <button
            type="button"
            onClick={toggleMic}
            disabled={micDisabled}
            aria-disabled={micDisabled || undefined}
            aria-pressed={listening}
            aria-label={t(lang, listening ? "report.mic_stop" : "report.mic_start")}
            className={[
              "absolute right-3 bottom-3 md:right-[14px] md:bottom-[14px] w-11 h-11 md:w-12 md:h-12 rounded-full b-ink grid place-items-center",
              listening ? "bg-live animate-micring" : "bg-board",
              micDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            ].join(" ")}
          >
            <MicIcon size={desktop ? 22 : 20} />
          </button>

          <div className="absolute left-[14px] bottom-4 md:left-[18px] md:bottom-5 pointer-events-none">
            {listening ? (
              <span className="flex items-center gap-[7px]">
                <span className="w-2 h-2 rounded-full bg-live animate-ledpulse-fast" aria-hidden="true" />
                {/* Latin only — Press Start 2P has no Devanagari, so this label is never translated (same rule as LIVE). */}
                <span className="arcade text-live" style={{ fontSize: 7, lineHeight: 1 }}>
                  LISTENING
                </span>
                <span className="font-semibold text-[11px] text-muted">{t(lang, "report.listening_hint", { lang: LANG_NAMES[lang] })}</span>
              </span>
            ) : (
              <span className="font-medium text-[11px] md:text-[12px] text-hint num">{t(lang, "report.bs_hint")}</span>
            )}
          </div>
        </div>

        {micSupported === false ? (
          <p className="font-medium text-[12px] text-muted mt-2">{t(lang, "report.mic_unsupported")}</p>
        ) : micError === "denied" ? (
          <p role="status" className="font-medium text-[12px] text-muted mt-2">
            {t(lang, "report.mic_denied")}
          </p>
        ) : null}

        <div className="font-bold text-[12.5px] md:text-[13px] mt-4 md:mt-[18px]">{t(lang, "report.chips_title")}</div>
        <div className="flex flex-wrap gap-2 md:gap-[9px] mt-2 md:mt-[9px]">
          {chips.map((c) => (
            <Chip key={c.key} active={text.includes(`${c.label}:`)} onClick={() => insertChip(c.label)}>
              {c.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* ---- aside: Where / Your contact / How it works (right column on md+, in flow on mobile) ---- */}
      <aside className="order-2 md:col-start-2 md:row-start-1 md:row-span-2 flex flex-col gap-[10px] md:gap-[14px] mt-[18px] md:mt-0">
        <div className={asideCard}>
          <div className="hidden md:block font-bold text-[14px] mb-2">{t(lang, "report.where_label")}</div>
          <PlacePicker
            places={places}
            lang={lang}
            value={place}
            onChange={setPlace}
            placeholder={t(lang, desktop ? "report.where_ph_desktop" : "report.where_ph")}
            hint={desktop ? t(lang, "report.where_hint_desktop", { n: places.length }) : t(lang, "report.where_hint")}
          />
        </div>
        <div className={asideCard}>
          <label htmlFor={contactId} className="hidden md:block font-bold text-[14px] mb-2">
            {t(lang, "report.contact_label")}
          </label>
          <label htmlFor={contactId} className="sr-only md:hidden">
            {t(lang, "report.contact_label")}
          </label>
          <input
            id={contactId}
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t(lang, desktop ? "report.contact_ph_desktop" : "report.contact_ph")}
            autoComplete="tel email"
            aria-describedby={contactHintId}
            maxLength={200}
            className={PLACE_INPUT_CLASS}
          />
          <div id={contactHintId} className={fieldHint}>
            {t(lang, "report.contact_hint")}
          </div>
        </div>
        <div className="hidden md:block">
          <DarkCard label={t(lang, "report.how_label")}>{t(lang, "report.how_body", { cadence })}</DarkCard>
        </div>
      </aside>

      {/* ---- left column, part 2: error, Send, footnote ---- */}
      <div className="order-3 md:col-start-1 md:row-start-2">
        {/* Honeypot: invisible to people, tempting to bots. */}
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="absolute left-[-9999px]"
        />
        {error ? (
          <p role="alert" className="font-bold text-[13px] text-amber-text bg-amber-fill b-ink-2 rounded-r2 px-3 py-2 mt-4 md:mt-5 lh-body">
            {error}
          </p>
        ) : null}
        <Button type="submit" variant="primary" size="lg" shadow={4} block disabled={sending} className="mt-4 md:mt-6 md:w-auto md:px-16" data-testid="send">
          {t(lang, sending ? "report.sending" : "report.send")}
        </Button>
        <p className="font-medium text-[11.5px] text-muted text-center lh-body mt-[10px] md:hidden">{t(lang, "report.footnote", { cadence })}</p>
      </div>
    </form>
  );
}
