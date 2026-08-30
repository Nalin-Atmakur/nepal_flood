import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/config";
import { fmtCadence } from "@/lib/format";
import { asLang, href, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { CheckCircle } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DarkCard from "@/components/ui/DarkCard";

/** /about — the artboard's six cards plus "The corridor animation" (30 Aug): What this is / is not / the animation / Why the numbers differ / Data handling (6 checks) / Who runs it / For agencies. */
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return pageMetadata(lang, { title: t(lang, "nav.about"), path: "/about" });
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const cadence = fmtCadence(lang);
  const body = "font-medium text-[14px] lh-loose text-muted-2 mt-2";
  return (
    <main data-page="about" className="max-w-[1280px] mx-auto px-4 md:px-7 py-7">
      <h1 className="sr-only">{t(lang, "nav.about")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="flex flex-col gap-4">
          <Card shadow={4} padding="px-[22px] py-5" as="section">
            <h2 className="font-extrabold text-[22px] lh-tight">{t(lang, "about.what_title")}</h2>
            <p className={body}>{t(lang, "about.what_body", { cadence })}</p>
          </Card>
          <Card shadow={4} tone="amber" padding="px-[22px] py-5" as="section">
            <h2 className="font-extrabold text-[22px] lh-tight text-amber-text">{t(lang, "about.not_title")}</h2>
            <p className="font-medium text-[14px] lh-loose text-amber-deep mt-2">{t(lang, "about.not_body")}</p>
          </Card>
          <Card shadow={4} padding="px-[22px] py-5" as="section">
            <h2 className="font-extrabold text-[22px] lh-tight">{t(lang, "about.sim_title")}</h2>
            <p className={body}>{t(lang, "about.sim_body")}</p>
            <a href={href(lang, "/sources")} className="inline-block mt-3 font-bold text-[14px] text-ultra underline underline-offset-3">
              {t(lang, "about.sim_link")}
            </a>
          </Card>
          <Card shadow={4} padding="px-[22px] py-5" as="section">
            <h2 className="font-extrabold text-[22px] lh-tight">{t(lang, "about.why_title")}</h2>
            <p className={body}>{t(lang, "about.why_body")}</p>
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <Card shadow={4} padding="px-[22px] py-5" as="section">
            <h2 className="font-extrabold text-[22px] lh-tight">{t(lang, "about.handling_title")}</h2>
            <ul className="list-none m-0 p-0">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <li key={i} className="flex gap-3 mt-3">
                  <CheckCircle size={26} strokeWidth={3.2} />
                  <p className="font-medium text-[13.5px] lh-loose text-muted-2 m-0">{t(lang, `about.handling_${i}`, { cadence })}</p>
                </li>
              ))}
            </ul>
          </Card>
          <Card shadow={4} padding="px-[22px] py-5" as="section">
            <h2 className="font-extrabold text-[22px] lh-tight">{t(lang, "about.who_title")}</h2>
            <p className={body}>{t(lang, "about.who_body")}</p>
            <div className="flex flex-wrap gap-[10px] mt-[14px]">
              <Button href={`mailto:${CONTACT_EMAIL}`} external variant="dark" size="sm" shadow={0} className="min-h-[44px] border-2">
                {CONTACT_EMAIL}
              </Button>
            </div>
          </Card>
          <DarkCard label={t(lang, "about.agencies_label")} padding="px-5 py-[18px]" overlay={130}>
            {t(lang, "about.agencies_body")}
          </DarkCard>
        </div>
      </div>
    </main>
  );
}
