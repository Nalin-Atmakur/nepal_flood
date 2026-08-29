"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Pill from "@/components/ui/Pill";
import { t, type Lang } from "@/lib/i18n";
import { buildPlaceIndex, searchPlaces, type SearchablePlace } from "@/lib/places-search";
import type { PlaceRef } from "@/lib/queries";

/** A chosen place: a gazetteer id, or "other" (id null) when the place is described in the box instead. */
export type PlaceValue = { id: string | null; label: string };

type Props = {
  places: PlaceRef[];
  lang: Lang;
  value: PlaceValue | null;
  onChange: (v: PlaceValue | null) => void;
  placeholder: string;
  hint?: string;
  /** Visible label. When omitted a visually-hidden label (report.where_label) is rendered for assistive tech. */
  label?: string;
  className?: string;
};

export const PLACE_INPUT_CLASS =
  "w-full px-[14px] pt-[11px] pb-[9px] font-medium text-[14px] b-ink-2 rounded-r2 bg-card text-ink placeholder:text-hint";

/**
 * Searchable place input over the gazetteer (any script, any spelling) with a keyboard-operable listbox.
 * The last option is always "other — describe in the box" (place_id = null). A selected place collapses
 * into an amber "matched" pill with a 44px clear button.
 */
export default function PlacePicker({ places, lang, value, onChange, placeholder, hint, label, className = "" }: Props) {
  const uid = useId();
  const inputId = `${uid}-place`;
  const listId = `${uid}-list`;
  const hintId = `${uid}-hint`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const index = useMemo(() => buildPlaceIndex(places, lang), [places, lang]);
  const results = useMemo(() => searchPlaces(index, q, 8), [index, q]);
  const otherLabel = t(lang, "report.other_place");
  const options = useMemo<SearchablePlace[]>(() => [...results, { id: "", label: otherLabel, sub: "", keys: [] }], [results, otherLabel]);
  const show = open && q.trim().length > 0;
  const activeIdx = Math.min(active, options.length - 1);

  function pick(o: SearchablePlace) {
    onChange(o.id ? { id: o.id, label: o.label } : { id: null, label: o.label });
    setQ("");
    setOpen(false);
    setActive(0);
  }

  function clear() {
    onChange(null);
    setQ("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!show) {
      if (e.key === "ArrowDown" && q.trim()) {
        e.preventDefault();
        setOpen(true);
        setActive(0);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (i - 1 + options.length) % options.length);
        break;
      case "Enter":
        e.preventDefault();
        pick(options[activeIdx]);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  if (value) {
    return (
      <div className={className}>
        {label ? <div className="font-bold text-[14px] mb-2">{label}</div> : null}
        <div className="flex items-center gap-2 flex-wrap" role="status">
          <span className="sr-only">{t(lang, "report.place_selected")}:</span>
          <Pill variant="matched" className="min-h-[36px] text-[13px]">
            {value.label}
          </Pill>
          <button
            type="button"
            onClick={clear}
            aria-label={t(lang, "report.place_clear")}
            className="inline-grid place-items-center w-11 h-11 rounded-full b-ink-2 bg-card text-ink font-extrabold text-[18px] leading-none cursor-pointer hover:bg-ground"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        {hint ? <div className="font-medium text-[11px] md:text-[11.5px] text-muted mt-[3px] md:mt-[5px]">{hint}</div> : null}
      </div>
    );
  }

  return (
    <div className={["relative", className].join(" ")}>
      <label htmlFor={inputId} className={label ? "block font-bold text-[14px] mb-2" : "sr-only"}>
        {label ?? t(lang, "report.where_label")}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={show}
        aria-controls={listId}
        aria-activedescendant={show ? `${listId}-${activeIdx}` : undefined}
        aria-describedby={hint ? hintId : undefined}
        className={PLACE_INPUT_CLASS}
      />
      {hint ? (
        <div id={hintId} className="font-medium text-[11px] md:text-[11.5px] text-muted mt-[3px] md:mt-[5px]">
          {hint}
        </div>
      ) : null}
      <ul
        id={listId}
        role="listbox"
        aria-label={t(lang, "report.where_label")}
        hidden={!show}
        className="absolute left-0 right-0 top-full mt-1 z-20 list-none m-0 p-1 bg-card b-ink-2 rounded-r2 shadow-hard-3 max-h-[300px] overflow-y-auto"
      >
        {show && results.length === 0 ? (
          <li role="presentation" className="px-3 py-2 font-semibold text-[12.5px] text-muted lh-body">
            {t(lang, "report.no_place_match")}
          </li>
        ) : null}
        {show
          ? options.map((o, i) => {
              const isOther = o.id === "";
              const selected = i === activeIdx;
              return (
                <li
                  key={isOther ? "__other" : o.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={selected}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(o)}
                  onMouseEnter={() => setActive(i)}
                  className={[
                    "flex flex-col justify-center min-h-[44px] px-3 py-[6px] rounded-r2 cursor-pointer",
                    selected ? "bg-amber-fill" : "bg-card",
                    isOther && results.length ? "border-t-2 border-rule mt-1 pt-2" : "",
                  ].join(" ")}
                >
                  <span className={["text-[14px] lh-snug", isOther ? "font-semibold text-muted-2" : "font-semibold text-ink"].join(" ")}>{o.label}</span>
                  {o.sub ? <span className="font-medium text-[11.5px] text-muted lh-snug">{o.sub}</span> : null}
                </li>
              );
            })
          : null}
      </ul>
    </div>
  );
}
