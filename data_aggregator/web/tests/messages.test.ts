import { describe, expect, it } from "vitest";
import { LANGS, dictionariesForTests, type Lang } from "@/lib/i18n";

const en = dictionariesForTests.en;
const OTHERS = LANGS.filter((l): l is Exclude<Lang, "en"> => l !== "en");

/** Labels set in Press Start 2P: Latin only, identical in every language. */
const ARCADE_KEYS = [
  "live.right_now",
  "report.how_label",
  "report.listening",
  "me.privacy_label",
  "place.corridor_label",
  "about.agencies_label",
  "digest.label",
];

function placeholders(s: string): string[] {
  return Array.from(s.matchAll(/\{(\w+)\}/g), (m) => m[1]).sort();
}

describe("messages/*.json", () => {
  it("EN has every arcade label", () => {
    for (const k of ARCADE_KEYS) expect(en[k], k).toBeTypeOf("string");
  });

  for (const lang of OTHERS) {
    describe(lang, () => {
      const dict = dictionariesForTests[lang];

      it("has exactly the EN key set", () => {
        const enKeys = Object.keys(en).sort();
        const keys = Object.keys(dict).sort();
        const missing = enKeys.filter((k) => !(k in dict));
        const extra = keys.filter((k) => !(k in en));
        expect(missing, `missing in ${lang}.json`).toEqual([]);
        expect(extra, `extra in ${lang}.json`).toEqual([]);
      });

      it("has no empty values", () => {
        const empty = Object.entries(dict)
          .filter(([, v]) => typeof v !== "string" || v.trim() === "")
          .map(([k]) => k);
        expect(empty).toEqual([]);
      });

      it("uses the same {placeholder} set as EN for every key", () => {
        const bad: string[] = [];
        for (const [k, v] of Object.entries(en)) {
          const other = dict[k];
          if (typeof other !== "string") continue;
          if (placeholders(v).join(",") !== placeholders(other).join(",")) bad.push(k);
        }
        expect(bad).toEqual([]);
      });

      it("keeps the arcade labels identical to EN", () => {
        for (const k of ARCADE_KEYS) expect(dict[k], k).toBe(en[k]);
      });

      it("never uses Devanagari digits", () => {
        const bad = Object.entries(dict)
          .filter(([, v]) => /[०-९]/.test(v))
          .map(([k]) => k);
        expect(bad).toEqual([]);
      });
    });
  }

  it("EN has no empty values and no Devanagari digits", () => {
    for (const [k, v] of Object.entries(en)) {
      expect(v.trim(), k).not.toBe("");
      expect(/[०-९]/.test(v), k).toBe(false);
    }
  });
});
