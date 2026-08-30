import type { Metadata } from "next";
import { fmtDayTime } from "@/lib/format";
import { asLang, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getLiveCounts, getPlaces, getPlaceStatuses } from "@/lib/queries";
import PlacesTable from "@/components/blocks/PlacesTable";
import YourPart from "@/components/blocks/YourPart";
import SectionHead from "@/components/ui/SectionHead";
import { splitDistricts } from "@/lib/places-split";

/** /places — the same table as Home §04 on its own page, with search and the dashed empty-state row. */
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return pageMetadata(lang, { title: t(lang, "sec.places"), path: "/places" });
}

export default async function PlacesPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const [statuses, refs, live] = await Promise.all([getPlaceStatuses(), getPlaces(), getLiveCounts()]);
  const updated = live?.last_processed_at ?? null;
  const { places: placeRows, districts } = splitDistricts(statuses);
  return (
    <main data-page="places" className="pt-2 md:pt-3 pb-[30px]">
      <YourPart lang={lang} live={live} />
      <div className="max-w-[1280px] mx-auto px-4 md:px-7 pt-[22px]">
      <SectionHead
        title={<span id="places-title">{t(lang, "sec.places")}</span>}
        sub={<span className="hidden md:inline">{updated ? t(lang, "sec.places_updated", { t: fmtDayTime(updated, lang) }) : t(lang, "sec.places_sub")}</span>}
        align="center"
      />
      <PlacesTable lang={lang} statuses={placeRows} refs={refs} placeholder={t(lang, "sec.places_search_ph2")} emptyRow />
      {districts.length ? (
        <section className="mt-8" data-block="districts">
          <SectionHead title={t(lang, "sec.by_district")} sub={<span>{t(lang, "sec.by_district_sub")}</span>} align="center" />
          <PlacesTable lang={lang} statuses={districts} refs={refs} placeholder={t(lang, "sec.places_search_ph2")} search={false} />
        </section>
      ) : null}
      </div>
    </main>
  );
}
