"use client";

import { usePathname } from "next/navigation";
import { href, langFromPath, t } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

/**
 * 404 inside /[lang]: dashed empty state with the one action (home). not-found cannot read route params,
 * so the language comes from the pathname on the client (English until hydrated).
 */
export default function NotFound() {
  const pathname = usePathname() || "/";
  const lang = langFromPath(pathname);
  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-7 py-10">
      <h1 className="font-extrabold text-[28px] lh-tight">{t(lang, "error.not_found_title")}</h1>
      <div className="mt-4 max-w-[560px]">
        <EmptyState>{t(lang, "error.not_found_body")}</EmptyState>
      </div>
      <div className="mt-4">
        <Button href={href(lang, "/")} variant="primary">
          {t(lang, "error.home")}
        </Button>
      </div>
    </main>
  );
}
