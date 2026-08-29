import type { Metadata } from "next";
import MyFolder from "@/components/me/MyFolder";
import { asLang, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getPlaces } from "@/lib/queries";

export const revalidate = 300;

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return pageMetadata(lang, { title: t(lang, "me.title"), path: "/me" });
}

/** /[lang]/me — the visitor's own contributions. The rows are read in the browser (anonymous session + RLS). */
export default async function MePage({ params }: { params: Params }) {
  const lang = asLang((await params).lang);
  const places = (await getPlaces()) ?? [];
  return <MyFolder lang={lang} places={places} />;
}
