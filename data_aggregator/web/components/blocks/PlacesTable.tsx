"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { fmtDayTime, fmtInt, normaliseKey } from "@/lib/format";
import { href, localised, t, tEnum, type Lang } from "@/lib/i18n";
import { placeMatches } from "@/lib/places-search";
import type { PlaceRef, PlaceStatusRow } from "@/lib/queries";
import EmptyState from "@/components/ui/EmptyState";
import { UnknownBadge } from "@/components/ui/Pill";
import { Table, TableBox, Td, Th, THead } from "@/components/ui/Table";

/**
 * Section 04 / /places — the places table. Client island for the search box: filters by any alias in any
 * script (diacritic-insensitive), rows sorted by unknown desc. Desktop = table, mobile = cards, exactly as designed.
 */
export type PlacesTableProps = {
  lang: Lang;
  statuses: PlaceStatusRow[] | null;
  refs: PlaceRef[] | null;
  placeholder?: string;
  /** show the dashed "No reports for a place you know about?" row under the table (/places) */
  emptyRow?: boolean;
  /** hide the search box (used when the parent renders its own head) */
  search?: boolean;
};

type Row = {
  id: string;
  name: string;
  keys: string[];
  reported: number;
  confirmed: number;
  unknown: number;
  last: string;
  phones: string;
  access: string;
  note: string;
};

/** The table's Note cell: the per-place "now" line (place_status.now_*, ≤ 140 chars) when it exists, else the ledger note. */
export function noteFor(s: Pick<PlaceStatusRow, "note" | "now_en" | "now_ne" | "now_hi">, lang: Lang, max = 140): string {
  const now = localised(s as unknown as Record<string, unknown>, "now", lang) || s.now_en || "";
  // drop the short "As of 30 Aug 09:19:" / "30 अगस्ट 09:19 सम्म:" prefix (a time contains a colon of its own)
  const text = (now || s.note || "").replace(/^[^:]{0,40}(?::\d\d)?:\s+/, "").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 30)) + "…";
}

/** Translate the display-oriented phones text ("yes (since 28 Aug)", "no", "partial") word by word. */
function phonesText(lang: Lang, v: string | null): string {
  if (!v) return "—";
  const lower = v.trim().toLowerCase();
  if (lower === "yes" || lower === "no" || lower === "partial") return t(lang, `phones.${lower}`);
  const m = lower.match(/^(yes|no|partial)\b(.*)$/);
  if (m) return `${t(lang, `phones.${m[1]}`)}${m[2]}`;
  return v;
}

export default function PlacesTable({ lang, statuses, refs, placeholder, emptyRow = false, search = true }: PlacesTableProps) {
  const [q, setQ] = useState("");
  const inputId = useId();

  const rows = useMemo<Row[]>(() => {
    const byId = new Map((refs ?? []).map((r) => [r.id, r]));
    return (statuses ?? [])
      .map((s) => {
        const ref = byId.get(s.place_id);
        const names = [s.name_en, s.name_ne, s.name_hi, ref?.name_zh, ...(ref?.aliases ?? []), s.place_id.replace(/_/g, " ")].filter(
          (x): x is string => typeof x === "string" && x.length > 0,
        );
        return {
          id: s.place_id,
          name: localised(s as unknown as Record<string, unknown>, "name", lang) || s.name_en,
          keys: Array.from(new Set(names.map(normaliseKey))),
          reported: Number(s.expected ?? 0),
          confirmed: Number(s.confirmed_reached ?? 0),
          unknown: Number(s.unknown ?? 0),
          last: s.last_contact_at ? fmtDayTime(s.last_contact_at, lang) : "—",
          phones: phonesText(lang, s.phones),
          access: tEnum(lang, "access", s.access),
          note: noteFor(s, lang),
        };
      })
      .sort((a, b) => b.unknown - a.unknown);
  }, [statuses, refs, lang]);

  const visible = rows.filter((r) => placeMatches(r.keys, q));
  const none = rows.length === 0;

  return (
    <div>
      {search ? (
        <div className="md:flex md:justify-end mt-[10px] md:mt-0">
          <label htmlFor={inputId} className="sr-only">
            {t(lang, "sec.places_search_label")}
          </label>
          <input
            id={inputId}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder ?? t(lang, "sec.places_search_ph")}
            autoComplete="off"
            className="w-full md:w-[320px] box-border px-[14px] pt-[12px] pb-[10px] md:pt-[10px] md:pb-2 font-medium text-[14px] b-ink rounded-r2 bg-card outline-none min-h-[44px]"
          />
        </div>
      ) : null}

      {none ? (
        <div className="mt-3">
          <EmptyState action={t(lang, "sec.places_empty_action")} href={href(lang, "/report")}>
            {t(lang, "sec.places_empty")}
          </EmptyState>
        </div>
      ) : (
        <>
          {/* desktop table */}
          <TableBox className="hidden md:block mt-[14px]">
            <Table>
              <THead>
                <Th>{t(lang, "col.place")}</Th>
                <Th align="right">{t(lang, "col.reported")}</Th>
                <Th align="right">{t(lang, "col.confirmed")}</Th>
                <Th align="right">{t(lang, "col.unknown")}</Th>
                <Th>{t(lang, "col.last_contact")}</Th>
                <Th>{t(lang, "col.phones")}</Th>
                <Th>{t(lang, "col.access")}</Th>
                <Th>{t(lang, "col.note")}</Th>
              </THead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id}>
                    <Td className="font-extrabold text-[14.5px]">
                      <Link href={href(lang, `/places/${r.id}`)} className="text-ink hover:text-ultra no-underline hover:underline">
                        {r.name}
                      </Link>
                    </Td>
                    <Td align="right">{fmtInt(r.reported)}</Td>
                    <Td align="right" className="text-confirmed-text font-bold">
                      {fmtInt(r.confirmed)}
                    </Td>
                    <Td align="right" className="py-[9px]">
                      <UnknownBadge>{fmtInt(r.unknown)}</UnknownBadge>
                    </Td>
                    <Td className="whitespace-nowrap num">{r.last}</Td>
                    <Td>{r.phones}</Td>
                    <Td>{r.access}</Td>
                    <Td className="text-muted text-[12.5px]">{r.note}</Td>
                  </tr>
                ))}
                {visible.length === 0 ? (
                  <tr>
                    <Td colSpan={8} className="text-muted font-semibold text-center py-4">
                      {t(lang, "sec.places_no_match", { q })}
                    </Td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </TableBox>

          {/* mobile cards */}
          <ul className="md:hidden flex flex-col gap-[10px] mt-3 list-none m-0 p-0">
            {visible.map((r) => (
              <li key={r.id}>
                <Link href={href(lang, `/places/${r.id}`)} className="block bg-card b-ink rounded-r2 px-[14px] py-3 text-ink hover:text-ink no-underline press-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-extrabold text-[15px]">{r.name}</span>
                    <span className="ml-auto">
                      <UnknownBadge size="lg">{fmtInt(r.unknown)}</UnknownBadge>
                    </span>
                  </div>
                  <div className="font-medium text-[12.5px] mt-[5px] num">
                    {fmtInt(r.reported)} {t(lang, "word.reported")} · <span className="text-confirmed-text font-bold">{fmtInt(r.confirmed)} {t(lang, "word.confirmed")}</span> · {t(lang, "word.last")} {r.last}
                  </div>
                  <div className="font-medium text-[11px] text-muted mt-[2px]">
                    {t(lang, "word.phones")}: {r.phones} · {r.access}
                    {r.note ? ` · ${r.note}` : ""}
                  </div>
                </Link>
              </li>
            ))}
            {visible.length === 0 ? (
              <li>
                <EmptyState>{t(lang, "sec.places_no_match", { q })}</EmptyState>
              </li>
            ) : null}
          </ul>
        </>
      )}

      {emptyRow && !none ? (
        <div className="mt-[14px]">
          <EmptyState center action={t(lang, "sec.places_empty_row_action")} href={href(lang, "/report")}>
            {t(lang, "sec.places_empty_row")}
          </EmptyState>
        </div>
      ) : null}
    </div>
  );
}
