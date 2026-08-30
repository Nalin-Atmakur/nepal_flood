import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CORRIDOR_LENGTH_KM } from "@/lib/config";
import { statusTone } from "@/lib/corridor";
import { fmtAsOf, fmtDay, fmtDayTime, fmtInt, fmtWhen } from "@/lib/format";
import { asLang, href, LANGS, localised, t, tEnum, type Lang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getArticlesForPlace, getPlace, getPlaces, getPlaceStatus, getPlaceTimeline, type PlaceRef } from "@/lib/queries";
import { dotColors } from "@/lib/tokens";
import LiveChip from "@/components/ui/LiveChip";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DarkCard from "@/components/ui/DarkCard";
import EmptyState from "@/components/ui/EmptyState";
import { StatusPill } from "@/components/ui/Badge";

/**
 * /places/[id] — the place page (Places.dc.html): name + NE/HI, status pill, "district · km N · elev m",
 * four big cards, "What is happening now" (place_status.now_*), "Status, day by day", headlines mentioning the place,
 * facts, CTA, "ON THE CORRIDOR".
 * Statically generated for every gazetteer place; revalidates every 5 minutes; unknown ids → 404.
 */
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const places = (await getPlaces()) ?? [];
  return LANGS.flatMap((lang) => places.map((p) => ({ lang, id: p.id })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }): Promise<Metadata> {
  const { lang: raw, id } = await params;
  const lang = asLang(raw);
  const place = await getPlace(id);
  const name = place ? localised(place as unknown as Record<string, unknown>, "name", lang) || place.name_en : t(lang, "sec.places");
  return pageMetadata(lang, { title: name, path: `/places/${id}` });
}

function otherNames(place: PlaceRef, lang: Lang): string {
  const shown = localised(place as unknown as Record<string, unknown>, "name", lang) || place.name_en;
  return [place.name_ne, place.name_hi, place.name_en].filter((x): x is string => !!x && x !== shown).filter((x, i, a) => a.indexOf(x) === i).join(" · ");
}

export default async function PlacePage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: raw, id } = await params;
  const lang = asLang(raw);
  const place = await getPlace(id);
  if (!place) notFound();

  const [status, timeline, news, all] = await Promise.all([getPlaceStatus(id), getPlaceTimeline(id), getArticlesForPlace(id, 8), getPlaces()]);
  const name = localised(place as unknown as Record<string, unknown>, "name", lang) || place.name_en;
  const tone = statusTone(status);
  const km = status?.km ?? place.km;
  const elev = place.elev_m;
  const meta =
    km !== null && km !== undefined
      ? t(lang, "place.meta", { district: place.district ?? "—", km: fmtInt(km), elev: elev !== null ? fmtInt(elev) : "—" })
      : t(lang, "place.meta_nokm", { district: place.district ?? "—", elev: elev !== null ? fmtInt(elev) : "—" });

  // neighbours by km
  const onCorridor = (all ?? []).filter((p) => p.km !== null && p.km !== undefined).sort((a, b) => (a.km as number) - (b.km as number));
  // Nearest neighbours strictly up- and downstream (many places share a chainage, e.g. km 4 around Timure).
  const prev = km !== null && km !== undefined ? [...onCorridor].reverse().find((p) => (p.km as number) < km && p.id !== id) ?? null : null;
  const next = km !== null && km !== undefined ? onCorridor.find((p) => (p.km as number) > km && p.id !== id) ?? null : null;
  const nm = (p: PlaceRef) => localised(p as unknown as Record<string, unknown>, "name", lang) || p.name_en;
  let corridorBody = t(lang, "place.corridor_off");
  if (km !== null && km !== undefined) {
    const vars = { km: fmtInt(km), total: CORRIDOR_LENGTH_KM } as Record<string, string | number>;
    if (prev && next) corridorBody = t(lang, "place.corridor_body", { ...vars, prev: nm(prev), prevkm: fmtInt(prev.km as number), next: nm(next), nextkm: fmtInt(next.km as number) });
    else if (next) corridorBody = t(lang, "place.corridor_first", { ...vars, next: nm(next), nextkm: fmtInt(next.km as number) });
    else if (prev) corridorBody = t(lang, "place.corridor_last", { ...vars, prev: nm(prev), prevkm: fmtInt(prev.km as number) });
    else corridorBody = t(lang, "place.corridor_off");
  }

  const facts = [
    { k: t(lang, "place.facts.phones"), v: status?.phones ?? "—" },
    { k: t(lang, "place.facts.access"), v: tEnum(lang, "access", status?.access) },
    { k: t(lang, "place.facts.gauge"), v: status?.nearest_gauge ?? "—" },
    { k: t(lang, "place.facts.shelter"), v: status?.shelter ?? "—" },
  ];
  const asOf = status?.as_of ?? null;
  const last = status?.last_contact_at ?? null;
  const nowLine = status ? localised(status as unknown as Record<string, unknown>, "now", lang) || status.now_en || "" : "";
  const nowSources = Array.isArray(status?.now_sources) ? status.now_sources.join(" · ") : (status?.now_sources ?? "");

  return (
    <main data-page="place">
      <div className="bg-card b-ink-b">
        <div className="max-w-[1280px] mx-auto px-4 md:px-7 py-3 flex items-center gap-[10px] md:gap-4">
          <Link href={href(lang, "/places")} className="font-extrabold text-[17px] md:text-[18px] text-ink hover:text-ink no-underline min-w-[44px] min-h-[44px] inline-flex items-center" aria-label={t(lang, "nav.all_places")}>
            ←
          </Link>
          <Link href={href(lang, "/places")} className="font-bold text-[12px] md:text-[13px] text-muted hover:text-ink no-underline">
            {t(lang, "nav.all_places")}
          </Link>
          <LiveChip className="ml-auto hidden md:inline-flex" />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-7 pt-5 md:pt-[26px] pb-[26px] md:pb-8">
        <div className="md:flex md:flex-wrap md:items-baseline md:gap-[14px]">
          <h1 className="font-extrabold text-[30px] md:text-[36px] lh-tight">{name}</h1>
          {otherNames(place, lang) ? <div className="font-semibold text-[17px] md:text-[22px] text-muted lh-body">{otherNames(place, lang)}</div> : null}
          <div className="mt-2 md:mt-0">
            <StatusPill tone={tone} label={t(lang, `place.status.${tone === "unknown" ? "mostly_unknown" : tone === "reached" ? "mostly_reached" : "no_data"}`)} />
          </div>
          <div className="font-medium text-[13px] text-muted mt-2 md:mt-0 num">{meta}</div>
        </div>

        {status ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-[18px] mt-4 md:mt-5">
            <BigCard value={fmtInt(status.expected)} label={t(lang, "place.reported_there")} sub={t(lang, "place.reported_src", { t: fmtDayTime(asOf, lang) })} />
            <BigCard value={fmtInt(status.confirmed_reached)} label={t(lang, "place.confirmed")} sub={t(lang, "place.confirmed_src", { t: fmtDayTime(asOf, lang) })} color="text-confirmed" />
            <BigCard value={fmtInt(status.unknown)} label={t(lang, "place.unknown")} sub={t(lang, "place.unknown_src")} amber />
            <BigCard value={last ? fmtDayTime(last, lang) : "—"} label={t(lang, "place.last_out")} sub={t(lang, "place.last_src")} small />
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState action={t(lang, "place.no_status_action")} href={href(lang, `/report?place=${id}`)}>
              {t(lang, "place.no_status")}
            </EmptyState>
          </div>
        )}
        {status ? <div className="md:hidden font-medium text-[10.5px] text-muted mt-2 num">{t(lang, "place.all_src", { t: fmtDayTime(asOf, lang) })}</div> : null}

        {/* What is happening now — process_data ⑩ (place_status.now_*), 36 h window */}
        <div data-testid="place-now" className="mt-[14px] md:mt-5">
        <Card padding="px-4 py-[14px] md:px-5 md:py-[18px]">
          <h2 className="font-extrabold text-[15px] md:text-[17px]">{t(lang, "place.now_title")}</h2>
          {nowLine ? (
            <>
              <p className="font-medium text-[14px] md:text-[15px] lh-body mt-2 mb-0">{nowLine}</p>
              <div className="font-medium text-[11px] text-muted mt-2 num">
                {status?.now_as_of ? t(lang, "place.now_asof", { t: fmtDayTime(status.now_as_of, lang) }) : null}
                {nowSources ? ` · ${t(lang, "place.now_sources", { s: nowSources })}` : null}
              </div>
            </>
          ) : (
            <div className="mt-3">
              <EmptyState action={t(lang, "place.no_status_action")} href={href(lang, `/report?place=${id}`)}>
                {t(lang, "place.now_empty")}
              </EmptyState>
            </div>
          )}
        </Card>
        </div>

        <div className="md:grid md:grid-cols-[1fr_380px] md:gap-6 mt-[14px] md:mt-6">
          {/* left: facts (mobile first), timeline, headlines */}
          <div className="contents md:block">
            <Card padding="px-4 py-[14px] md:hidden" className="order-1">
              <Facts facts={facts} />
            </Card>
            <Card padding="px-4 py-[14px] md:px-5 md:py-[18px]" className="order-2 mt-[14px] md:mt-0">
              <h2 className="font-extrabold text-[15px] md:text-[17px]">{t(lang, "place.timeline")}</h2>
              {timeline && timeline.length ? (
                <ol className="list-none m-0 p-0">
                  {timeline.map((row, i) => (
                    <li key={row.day + row.what_en} className="flex gap-3 md:gap-[14px] mt-3 md:mt-[14px]">
                      <div className="flex flex-col items-center flex-none">
                        <span className="w-3 h-3 md:w-[14px] md:h-[14px] rounded-full b-ink-2 mt-[3px] md:mt-0" style={{ background: dotColors[row.dot] ?? dotColors.neutral }} aria-hidden="true" />
                        {i < timeline.length - 1 ? <span className="hidden md:block w-[2px] flex-1 bg-rule mt-1" aria-hidden="true" /> : null}
                      </div>
                      <div className="pb-[6px]">
                        <div className="font-extrabold text-[12.5px] md:text-[13.5px] num">{fmtDay(row.day, lang)}</div>
                        <div className="font-medium text-[12px] md:text-[13px] lh-body text-muted-2">
                          {localised(row as unknown as Record<string, unknown>, "what", lang) || row.what_en}
                          {row.source_url ? (
                            <>
                              {"\u00a0"}
                              <a href={row.source_url} target="_blank" rel="noopener noreferrer" className="text-[11px] whitespace-nowrap" aria-label={t(lang, "word.source")}>
                                ↗
                              </a>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="mt-3">
                  <EmptyState>{t(lang, "place.timeline_empty")}</EmptyState>
                </div>
              )}
            </Card>
            <Card padding="px-4 py-[14px] md:px-5 md:py-[18px]" className="order-4 md:order-3 mt-[14px] md:mt-[18px]">
              <h2 className="font-extrabold text-[15px] md:text-[17px]">{t(lang, "place.headlines", { place: name })}</h2>
              {news && news.length ? (
                <ul className="list-none m-0 p-0">
                  {news.map((a) => (
                    <li key={a.id} className="flex gap-3 items-baseline py-2 b-rule">
                      <span className="font-bold text-[11px] text-muted flex-none num">{fmtWhen(a.published_at, lang)}</span>
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[13.5px] lh-body text-ink hover:text-ultra no-underline hover:underline" lang={a.lang ?? undefined}>
                        {a.title}
                      </a>
                      <span className="font-medium text-[11px] text-muted ml-auto flex-none">{a.publisher ?? a.source_id}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3">
                  <EmptyState>{t(lang, "place.headlines_empty")}</EmptyState>
                </div>
              )}
            </Card>
            <div className="order-3 md:hidden mt-4">
              <Button href={href(lang, `/report?place=${id}`)} variant="primary" size="lg" shadow={3} block>
                {t(lang, "place.add_about", { place: name })}
              </Button>
            </div>
          </div>

          {/* right column (desktop) */}
          <div className="hidden md:flex flex-col gap-[14px]">
            <Card padding="px-[18px] py-4">
              <Facts facts={facts} />
            </Card>
            <Button href={href(lang, `/report?place=${id}`)} variant="primary" size="lg" block className="text-[16px]">
              {t(lang, "place.add_about", { place: name })}
            </Button>
            <DarkCard label={t(lang, "place.corridor_label")}>{corridorBody}</DarkCard>
          </div>
        </div>
        <div className="md:hidden mt-4">
          <DarkCard label={t(lang, "place.corridor_label")}>{corridorBody}</DarkCard>
        </div>
        {status ? <div className="hidden md:block font-medium text-[10.5px] text-muted mt-3 num">{fmtAsOf(asOf, lang)}</div> : null}
      </div>
    </main>
  );
}

function BigCard({ value, label, sub, color = "text-ink", amber = false, small = false }: { value: string; label: string; sub: string; color?: string; amber?: boolean; small?: boolean }) {
  return (
    <div className={["b-ink rounded-r2 shadow-hard-3 md:shadow-hard-4 p-[14px] md:px-5 md:py-[18px]", amber ? "bg-amber-fill" : "bg-card"].join(" ")}>
      <div className={["font-extrabold num", small ? "text-[19px] md:text-[30px] leading-[1.2] md:leading-[1.1]" : "text-[34px] md:text-[44px] leading-none", amber ? "text-amber-text" : color].join(" ")}>{value}</div>
      <div className="font-semibold text-[12px] md:text-[13px] mt-1 md:mt-[6px]">{label}</div>
      <div className={["hidden md:block font-medium text-[10.5px] num", amber ? "text-amber-text" : "text-muted"].join(" ")}>{sub}</div>
    </div>
  );
}

function Facts({ facts }: { facts: { k: string; v: string }[] }) {
  return (
    <dl className="m-0">
      {facts.map((f) => (
        <div key={f.k} className="flex gap-[10px] py-[6px] md:py-[7px] b-rule font-medium text-[12.5px] md:text-[13px]">
          <dt className="text-muted w-[100px] md:w-[110px] flex-none">{f.k}</dt>
          <dd className="m-0 font-bold">{f.v}</dd>
        </div>
      ))}
    </dl>
  );
}
