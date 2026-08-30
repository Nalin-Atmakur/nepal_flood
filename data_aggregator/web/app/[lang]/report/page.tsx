import type { Metadata } from "next";
import ReportFlow from "@/components/form/ReportFlow";
import { isRespondentType } from "@/lib/config";
import AuthBootstrap from "@/components/blocks/AuthBootstrap";
import { asLang, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getPlaces } from "@/lib/queries";

export const revalidate = 300;

type Params = Promise<{ lang: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function one(v: string | string[] | undefined): string | null {
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === "string" && s.length ? s : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return pageMetadata(lang, { title: t(lang, "sec.add"), path: "/report" });
}

/**
 * /[lang]/report — the one-box report flow. Query parameters (all optional, all validated):
 *   type=family|survivor|rescuer|agency   skips "Who are you?"
 *   place=<places.id>                      preselects the place
 *   supersedes=<uuid>&mode=add|correct     reopening from My folder
 */
export default async function ReportPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const lang = asLang((await params).lang);
  const sp = await searchParams;
  const places = (await getPlaces()) ?? [];

  const typeRaw = one(sp.type);
  const initialType = isRespondentType(typeRaw) ? typeRaw : null;

  const placeRaw = one(sp.place);
  const initialPlaceId = placeRaw && places.some((p) => p.id === placeRaw) ? placeRaw : null;

  const supRaw = one(sp.supersedes);
  const supersedes = supRaw && UUID_RE.test(supRaw) ? supRaw.toLowerCase() : null;

  const modeRaw = one(sp.mode);
  const mode = modeRaw === "add" || modeRaw === "correct" ? modeRaw : null;

  return (
    <>
      {/* anonymous sign-in happens on this page, not site-wide: only a submitter needs an identity (QA F3) */}
      <AuthBootstrap lang={lang} />
      <ReportFlow lang={lang} places={places} initialType={initialType} initialPlaceId={initialPlaceId} supersedes={supersedes} mode={mode} />
    </>
  );
}
