import { fmtCadence, hostOf } from "@/lib/format";
import { localised, t, type Lang } from "@/lib/i18n";
import type { EventTimelineRow } from "@/lib/queries";
import { isAlarmKind, isEventKind, splitTimeline } from "@/lib/story";
import { eventKindColors } from "@/lib/tokens";
import EmptyState from "@/components/ui/EmptyState";
import SectionHead from "@/components/ui/SectionHead";

/**
 * Section 03 — The first hours: the reconstructed event timeline from `event_timeline` ⋈ `places`.
 * One DOM, two layouts: a vertical ledger with a left rail on mobile, a horizontal strip with a top rail
 * on desktop (scrolls sideways). Events on the event day come first; anything dated later sits under a
 * small "Later" divider. Time labels are Press Start 2P — amber on dark for trigger/warning, ink otherwise.
 * Dot colour = kind (lib/tokens.ts eventKindColors). See web/docs/13-story-and-digest.md.
 */
export default function FirstHours({ lang, events }: { lang: Lang; events: EventTimelineRow[] | null }) {
  const { first, later } = splitTimeline(events);
  const any = first.length + later.length > 0;

  return (
    <section data-block="first-hours" data-n="03" className="max-w-[1280px] mx-auto px-4 md:px-7 mt-7" aria-labelledby="sec-first-hours">
      <SectionHead n="03" title={<span id="sec-first-hours">{t(lang, "sec.first_hours")}</span>} sub={<span className="num">{t(lang, "sec.first_hours_sub")}</span>} />
      {any ? (
        <>
          <Strip lang={lang} rows={first} />
          {later.length ? (
            <>
              <div className="flex items-center gap-3 mt-2 md:mt-4">
                <span className="font-bold text-[12px] text-muted">{t(lang, "sec.first_hours_later")}</span>
                <span className="flex-1 h-[2px] bg-rule" aria-hidden="true" />
              </div>
              <Strip lang={lang} rows={later} />
            </>
          ) : null}
        </>
      ) : (
        <div className="mt-4">
          <EmptyState>{t(lang, "sec.first_hours_empty", { cadence: fmtCadence(lang) })}</EmptyState>
        </div>
      )}
    </section>
  );
}

function Strip({ lang, rows }: { lang: Lang; rows: EventTimelineRow[] }) {
  return (
    <ol className="list-none m-0 p-0 mt-4 md:flex md:items-stretch md:pb-[6px] scroll-x">
      {rows.map((e, i) => {
        const last = i === rows.length - 1;
        const kind = isEventKind(e.kind) ? e.kind : null;
        const dot = eventKindColors[e.kind] ?? eventKindColors.event;
        const alarm = isAlarmKind(e.kind);
        const place = localised(e as unknown as Record<string, unknown>, "place_name", lang);
        const what = localised(e as unknown as Record<string, unknown>, "what", lang);
        return (
          <li key={e.id} data-event={e.id} data-kind={e.kind} className="relative pl-[26px] pb-4 md:pl-0 md:pb-0 md:pt-[24px] md:pr-3 md:flex-none md:w-[236px]">
            {/* rail: vertical on mobile, horizontal on desktop; the last item ends at its dot */}
            {!last ? (
              <span
                aria-hidden="true"
                className="absolute left-[5px] top-[14px] -bottom-2 w-[2px] bg-ink md:left-3 md:right-0 md:top-[5px] md:bottom-auto md:w-auto md:h-[2px]"
              />
            ) : null}
            <span
              className="absolute left-0 top-[8px] md:top-0 inline-block rounded-full b-ink-1 w-3 h-3"
              style={{ background: dot }}
              role="img"
              aria-label={kind ? t(lang, `event.kind.${kind}`) : e.kind}
            />
            <article className="bg-card b-ink-2 rounded-r2 shadow-hard-2 px-3 pt-[10px] pb-[9px] md:h-full md:flex md:flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={["arcade num rounded-r2 px-[6px] pt-[4px] pb-[2px] flex-none", alarm ? "bg-board text-amber" : "bg-ground text-ink"].join(" ")}
                  style={{ fontSize: 8, lineHeight: 1 }}
                >
                  {e.at_label}
                </span>
                {place ? <span className="font-bold text-[12px] lh-snug text-muted-2 [text-wrap:balance]">{place}</span> : null}
              </div>
              <p className="font-medium text-[13px] lh-body mt-[6px] mb-0 [text-wrap:pretty]">{what}</p>
              {e.source_url ? (
                <a
                  href={e.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[10.5px] text-amber-link hover:text-amber-text mt-[6px] md:mt-auto md:pt-[6px] block"
                >
                  {e.source ?? hostOf(e.source_url)}
                </a>
              ) : e.source ? (
                <span className="font-semibold text-[10.5px] text-muted mt-[6px] md:mt-auto md:pt-[6px] block">{e.source}</span>
              ) : null}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
