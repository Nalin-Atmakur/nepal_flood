"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { href, stripLang, t, type Lang } from "@/lib/i18n";

/**
 * The five tabs (web/docs/17-information-architecture.md): Home · Numbers · Places · Latest · More.
 * Desktop (≥ md): a row under the header. Phones: a fixed bottom bar with the primary action ("Add") in the centre,
 * safe-area padding, 44 px targets, `aria-current="page"` on the active tab.
 */
type Tab = { key: "home" | "numbers" | "places" | "latest" | "sediment" | "more"; path: string; icon: string };
const TABS: Tab[] = [
  { key: "home", path: "/", icon: "⌂" },
  { key: "numbers", path: "/numbers", icon: "#" },
  { key: "places", path: "/places", icon: "◎" },
  { key: "latest", path: "/latest", icon: "≡" },
  { key: "sediment", path: "/sediment", icon: "〰" },
  { key: "more", path: "/about", icon: "⋯" },
];

const MORE: { key: string; path: string; label: string }[] = [
  { key: "sources", path: "/sources", label: "nav.sources" },
  { key: "about", path: "/about", label: "nav.about" },
  { key: "me", path: "/me", label: "nav.me" },
];

/** Phone bottom bar: Home · Numbers · [＋ Add] · Latest · Sediment */
const BOTTOM: Tab[] = [TABS[0], TABS[1], TABS[2], TABS[3], TABS[4]];

function activeKey(rest: string): Tab["key"] | "none" {
  if (rest === "/" || rest === "") return "home";
  if (rest.startsWith("/numbers")) return "numbers";
  if (rest.startsWith("/places")) return "places";
  if (rest.startsWith("/latest")) return "latest";
  if (rest.startsWith("/sediment")) return "sediment";
  if (rest.startsWith("/report") || rest.startsWith("/run")) return "none";
  return "more";
}

export default function TabBar({ lang, variant }: { lang: Lang; variant: "top" | "bottom" }) {
  const rest = stripLang(usePathname() || "/");
  const active = activeKey(rest);

  if (variant === "top") {
    return (
      <nav aria-label={t(lang, "nav.tabs")} className="hidden md:block bg-ground b-ink-b">
        <ul className="max-w-[1280px] mx-auto px-7 flex items-center gap-1 list-none m-0 py-2">
          {TABS.filter((tab) => tab.key !== "more").map((tab) => {
            const on = tab.key === active;
            return (
              <li key={tab.key}>
                <Link
                  href={href(lang, tab.path)}
                  aria-current={on ? "page" : undefined}
                  className={[
                    "inline-flex items-center min-h-[44px] px-4 rounded-r2 font-bold text-[14px] no-underline",
                    on ? "bg-ink text-white hover:text-white" : "text-ink hover:bg-card",
                  ].join(" ")}
                >
                  {t(lang, `tabs.${tab.key}`)}
                </Link>
              </li>
            );
          })}
          {/* the "More" group: secondary pages, right-aligned and lighter */}
          {MORE.map((m) => {
            const on = rest.startsWith(m.path);
            return (
              <li key={m.key} className={m.key === "sources" ? "ml-auto" : ""}>
                <Link
                  href={href(lang, m.path)}
                  aria-current={on ? "page" : undefined}
                  className={["inline-flex items-center min-h-[44px] px-3 rounded-r2 font-semibold text-[13px] no-underline", on ? "bg-ink text-white hover:text-white" : "text-muted hover:text-ink hover:bg-card"].join(" ")}
                >
                  {t(lang, m.label)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label={t(lang, "nav.tabs")} className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-card border-t-[2.5px] border-ink" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <ul className="grid grid-cols-5 list-none m-0 p-0">
        {BOTTOM.map((tab, i) => {
          const on = tab.key === active;
          if (i === 2) {
            // the centre slot is the primary action on phones
            return (
              <li key="add" className="flex items-end justify-center">
                <Link
                  href={href(lang, "/report")}
                  className="inline-grid place-items-center w-[56px] h-[56px] -mt-4 rounded-full bg-ultra text-white b-ink shadow-hard-2 font-extrabold text-[24px] leading-none no-underline hover:text-white"
                  aria-label={t(lang, "nav.add_short")}
                  data-testid="tab-add"
                >
                  ＋
                </Link>
              </li>
            );
          }
          return (
            <li key={tab.key}>
              <Link
                href={href(lang, tab.path)}
                aria-current={on ? "page" : undefined}
                className={["flex flex-col items-center justify-center min-h-[56px] gap-[2px] no-underline font-bold text-[11px]", on ? "text-ultra" : "text-ink"].join(" ")}
              >
                <span aria-hidden="true" className="text-[18px] leading-none">
                  {tab.icon}
                </span>
                {t(lang, `tabs.${tab.key}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
