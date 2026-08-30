import { redirect } from "next/navigation";
import { asLang, href } from "@/lib/i18n";

/** The redesign shipped as the home page on 30 Aug; the preview URL people were given lands there (docs/22). */
export default async function V2Redirect({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  redirect(href(lang, "/"));
}
