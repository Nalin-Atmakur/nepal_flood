"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ItemBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DarkCard from "@/components/ui/DarkCard";
import EmptyState from "@/components/ui/EmptyState";
import Pill, { type PillVariant } from "@/components/ui/Pill";
import { RESPONDENT_TYPES } from "@/lib/config";
import { fmtCadence, fmtDayTime } from "@/lib/format";
import { href, localised, t, type Lang } from "@/lib/i18n";
import { getOwnReports, getOwnUser, type OwnReport, type PlaceRef } from "@/lib/queries";
import { saveContact, withdrawReport } from "@/lib/reports";
import { browserClient, ensureSession, supabaseConfigured } from "@/lib/supabase";

/**
 * /me — "My folder": everything this device has added, with what happened to it (My Folder artboards).
 * Rows come from reports_archive under RLS (own rows only). The raw `text` is never rendered here —
 * only summary_public (PII-free, written by process_data) or the "received" placeholder.
 */

type Phase = "loading" | "ready" | "failed";
type SaveState = "idle" | "saving" | "saved" | "failed";

type TrailPill = { key: string; label: string; variant: PillVariant };

const DONE_ANON = new Set<OwnReport["status"]>(["anonymised", "processed", "matched"]);
const DONE_PROC = new Set<OwnReport["status"]>(["processed", "matched"]);

/** Received → Anonymised → Processed → Matched to X / Not yet matched, or … → Withdrawn. */
export function deriveTrail(r: OwnReport, placeName: string | null, lang: Lang): TrailPill[] {
  const withdrawn = r.status === "withdrawn" || !!r.withdrawn_at;
  const anonDone = !!r.anonymised_at || DONE_ANON.has(r.status);
  const procDone = DONE_PROC.has(r.status);
  const steps: TrailPill[] = [{ key: "received", label: t(lang, "me.trail.received"), variant: "done" }];
  if (withdrawn) {
    if (anonDone) steps.push({ key: "anonymised", label: t(lang, "me.trail.anonymised"), variant: "done" });
    if (procDone) steps.push({ key: "processed", label: t(lang, "me.trail.processed"), variant: "done" });
    steps.push({ key: "withdrawn", label: t(lang, "me.trail.withdrawn"), variant: "withdrawn" });
    return steps;
  }
  steps.push({ key: "anonymised", label: t(lang, "me.trail.anonymised"), variant: anonDone ? "done" : "wait" });
  steps.push({ key: "processed", label: t(lang, "me.trail.processed"), variant: procDone ? "done" : "wait" });
  if (r.status === "matched" && r.place_id) {
    steps.push({ key: "matched", label: t(lang, "me.trail.matched", { place: placeName ?? r.place_id }), variant: "matched" });
  } else {
    steps.push({ key: "not_matched", label: t(lang, "me.trail.not_matched"), variant: "wait" });
  }
  return steps;
}

function reportHref(lang: Lang, r: OwnReport, mode: "add" | "correct"): string {
  const qs = new URLSearchParams({ type: r.respondent_type, supersedes: r.id, mode });
  if (r.place_id) qs.set("place", r.place_id);
  return href(lang, `/report?${qs.toString()}`);
}

export default function MyFolder({ lang, places }: { lang: Lang; places: PlaceRef[] }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [reports, setReports] = useState<OwnReport[]>([]);
  const [contact, setContact] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [withdrawFailed, setWithdrawFailed] = useState<string | null>(null);

  const cadence = fmtCadence(lang);
  const placeNames = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of places) m.set(p.id, localised(p, "name", lang) || p.name_en);
    return m;
  }, [places, lang]);

  useEffect(() => {
    if (!supabaseConfigured) return;
    let cancelled = false;
    const load = async () => {
      const sb = browserClient();
      const uid = sb ? await ensureSession(sb, lang) : null;
      if (cancelled) return;
      if (!sb || !uid) {
        setPhase("failed");
        return;
      }
      const [rows, user] = await Promise.all([getOwnReports(sb), getOwnUser(sb, uid)]);
      if (cancelled) return;
      setUserId(uid);
      setReports(rows ?? []);
      setContact(user?.contact ?? "");
      setPhase("ready");
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  async function onWithdraw(r: OwnReport) {
    const sb = browserClient();
    if (!sb || withdrawing) return;
    if (!window.confirm(t(lang, "me.withdraw_confirm", { cadence }))) return;
    setWithdrawFailed(null);
    setWithdrawing(r.id);
    const ok = await withdrawReport(sb, r.id);
    setWithdrawing(null);
    if (!ok) {
      setWithdrawFailed(r.id);
      return;
    }
    const at = new Date().toISOString();
    setReports((prev) => prev.map((x) => (x.id === r.id ? { ...x, withdrawn_at: at, status: "withdrawn" } : x)));
  }

  async function onSaveContact(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const sb = browserClient();
    if (!sb || !userId || saveState === "saving") return;
    setSaveState("saving");
    const ok = await saveContact(sb, userId, contact);
    setSaveState(ok ? "saved" : "failed");
  }

  // Oldest first, numbered 1…n (the artboards).
  const ordered = useMemo(() => [...reports].sort((a, b) => a.created_at.localeCompare(b.created_at)), [reports]);
  const n = reports.length;
  const deviceLabel = n === 1 ? t(lang, "me.device_1") : t(lang, "me.device_n", { n });
  const ready = phase === "ready";

  return (
    <div data-page="me">
      <header className="bg-card b-ink-b">
        <div className="max-w-[1280px] mx-auto px-4 md:px-7 py-3 flex items-center gap-3 md:gap-4">
          <Link href={href(lang, "/")} aria-label={t(lang, "nav.home")} className="inline-grid place-items-center min-w-[44px] min-h-[44px] -ml-3 font-extrabold text-[17px] md:text-[18px] text-ink no-underline hover:text-ink">
            <span aria-hidden="true">←</span>
          </Link>
          <h1 className="font-extrabold text-[15px] md:text-[17px]">{t(lang, "me.title")}</h1>
          <span className="ml-auto font-semibold text-[11px] md:text-[12px] text-muted text-right">
            <span className="md:hidden">{t(lang, "me.device")}</span>
            <span className="hidden md:inline">{ready ? deviceLabel : t(lang, "me.device")}</span>
          </span>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 pt-[18px] pb-[26px] md:grid md:grid-cols-[1fr_360px] md:gap-7 md:p-7 md:items-start">
        <section aria-label={t(lang, "me.title")} className="flex flex-col gap-[14px] md:gap-4">
          <p className="md:hidden font-medium text-[13px] text-muted-2 lh-body m-0">{t(lang, "me.lead")}</p>

          {!supabaseConfigured || phase === "failed" ? (
            <EmptyState>{t(lang, "me.unconfigured")}</EmptyState>
          ) : phase === "loading" ? (
            <p role="status" className="font-semibold text-[13px] text-muted m-0">
              {t(lang, "me.loading")}
            </p>
          ) : ordered.length === 0 ? (
            <EmptyState action={t(lang, "me.empty_action")} href={href(lang, "/report")}>
              {t(lang, "me.empty")}
            </EmptyState>
          ) : (
            ordered.map((r, i) => {
              const colours = RESPONDENT_TYPES.find((x) => x.id === r.respondent_type) ?? RESPONDENT_TYPES[0];
              const placeName = r.place_id ? (placeNames.get(r.place_id) ?? r.place_id) : null;
              const withdrawn = r.status === "withdrawn" || !!r.withdrawn_at;
              const trail = deriveTrail(r, placeName, lang);
              return (
                <Card key={r.id} as="article" shadow={3} padding="p-[14px] md:p-5" className={["md:shadow-hard-4", withdrawn ? "opacity-70" : ""].join(" ")}>
                  <div className="flex items-baseline gap-2 md:gap-[10px] flex-wrap">
                    <ItemBadge n={i + 1} bg={colours.bg} fg={colours.fg} />
                    <h2 className="font-extrabold text-[14.5px] md:text-[16px] m-0">{t(lang, `type.${r.respondent_type}`)}</h2>
                    <span className="font-semibold text-[12px] md:text-[13px] text-muted">· {placeName ?? t(lang, "me.place_none")}</span>
                    <span className="ml-auto font-medium text-[11px] md:text-[12px] text-muted num whitespace-nowrap">
                      <span className="md:hidden">{fmtDayTime(r.created_at, lang)}</span>
                      <span className="hidden md:inline">{t(lang, "me.submitted", { t: fmtDayTime(r.created_at, lang) })}</span>
                    </span>
                  </div>

                  <p className="font-medium text-[13px] md:text-[14px] text-muted-2 lh-body mt-[6px] m-0">{r.summary_public?.trim() || t(lang, "me.received_placeholder")}</p>
                  {r.supersedes ? <p className="font-medium text-[11px] text-muted mt-1 m-0">{t(lang, "me.supersedes")}</p> : null}
                  {withdrawn ? (
                    <p className="font-semibold text-[12px] text-muted mt-1 m-0">{t(lang, "me.withdrawn_line", { t: fmtDayTime(r.withdrawn_at, lang), cadence })}</p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-[6px] md:gap-[7px] mt-[10px] md:mt-3">
                    {trail.map((p, j) => (
                      <span key={p.key} className="inline-flex items-center gap-[6px] md:gap-[7px]">
                        {j > 0 ? (
                          <span aria-hidden="true" className="font-bold text-[11px] md:text-[12px] text-dashed">
                            →
                          </span>
                        ) : null}
                        <Pill variant={p.variant} className="min-h-[28px] md:min-h-[30px] text-[11px] md:text-[12px]">
                          {p.label}
                        </Pill>
                      </span>
                    ))}
                  </div>

                  {withdrawn ? null : (
                    <div className="flex flex-wrap items-center gap-2 md:gap-[10px] mt-3 md:mt-[14px]">
                      <Button href={reportHref(lang, r, "add")} variant="secondary" size="sm" className="flex-1 md:flex-none min-h-[40px]">
                        {t(lang, "me.add_detail")}
                      </Button>
                      <Button href={reportHref(lang, r, "correct")} variant="secondary" size="sm" className="flex-1 md:flex-none min-h-[40px]">
                        {t(lang, "me.correct")}
                      </Button>
                      <button
                        type="button"
                        onClick={() => void onWithdraw(r)}
                        disabled={withdrawing === r.id}
                        className="ml-auto min-h-[44px] px-2 font-bold text-[12px] text-muted underline bg-transparent cursor-pointer disabled:opacity-50"
                      >
                        {t(lang, withdrawing === r.id ? "me.withdrawing" : "me.withdraw")}
                      </button>
                      {withdrawFailed === r.id ? (
                        <span role="alert" className="w-full font-bold text-[12px] text-amber-text bg-amber-fill b-ink-2 rounded-r2 px-3 py-[6px]">
                          {t(lang, "me.withdraw_failed")}
                        </span>
                      ) : null}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </section>

        <aside className="flex flex-col gap-[14px] mt-4 md:mt-0">
          <Button href={href(lang, "/report")} variant="primary" size="md" shadow={3} block className="md:press-4 md:min-h-[52px] md:text-[16px]">
            {ordered.length ? t(lang, "me.another") : t(lang, "nav.add_short")}
          </Button>

          {ready && userId ? (
            <div className="bg-card b-dashed rounded-r2 px-4 py-[14px] md:px-[18px] md:py-4">
              <div className="font-bold text-[13px] md:text-[14px]">{t(lang, "me.keep")}</div>
              <div className="font-medium text-[12px] md:text-[12.5px] text-muted lh-body mt-[3px]">{t(lang, "me.keep_sub")}</div>
              <form onSubmit={onSaveContact} className="flex gap-2 mt-[10px]" noValidate>
                <label htmlFor="me-contact" className="sr-only">
                  {t(lang, "me.keep_ph")}
                </label>
                <input
                  id="me-contact"
                  type="text"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (saveState !== "idle") setSaveState("idle");
                  }}
                  placeholder={t(lang, "me.keep_ph")}
                  autoComplete="tel email"
                  maxLength={200}
                  className="flex-1 min-w-0 px-3 pt-[10px] pb-2 font-medium text-[13px] b-ink-2 rounded-r2 bg-card text-ink placeholder:text-hint"
                />
                <Button type="submit" variant="dark" size="sm" shadow={0} disabled={saveState === "saving"} className="min-h-[44px]">
                  {t(lang, "me.save")}
                </Button>
              </form>
              {saveState === "saved" ? (
                <p role="status" className="font-semibold text-[12px] text-confirmed mt-2 m-0">
                  {t(lang, "me.saved")}
                </p>
              ) : saveState === "failed" ? (
                <p role="alert" className="font-bold text-[12px] text-amber-text mt-2 m-0">
                  {t(lang, "me.save_failed")}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="hidden md:block">
            <DarkCard label={t(lang, "me.privacy_label")}>{t(lang, "me.privacy")}</DarkCard>
          </div>
          <p className="md:hidden font-medium text-[11.5px] text-muted lh-body m-0">{t(lang, "me.privacy_short")}</p>
        </aside>
      </div>
    </div>
  );
}
