import { afterEach, describe, expect, it } from "vitest";
import { LANGS, asLang, dictionariesForTests, href, stripLang, t } from "@/lib/i18n";

const EN_ONLY = "__test.en_only";
const BOTH = "__test.both";

afterEach(() => {
  delete dictionariesForTests.en[EN_ONLY];
  delete dictionariesForTests.en[BOTH];
  delete dictionariesForTests.ne[BOTH];
});

describe("t()", () => {
  it("prefers the requested language, then EN, then the key itself", () => {
    dictionariesForTests.en[EN_ONLY] = "EN only";
    dictionariesForTests.en[BOTH] = "EN both";
    dictionariesForTests.ne[BOTH] = "NE both";

    expect(t("ne", BOTH)).toBe("NE both");
    expect(t("ne", EN_ONLY)).toBe("EN only");
    expect(t("ne", "__test.nowhere")).toBe("__test.nowhere");
    expect(t("en", "__test.nowhere")).toBe("__test.nowhere");
  });

  it("interpolates {placeholders} and leaves unknown ones in place", () => {
    expect(t("en", "time.min_ago", { n: 4 })).toBe("4 min ago");
    expect(t("en", "time.h_min_ago", { h: 1, m: 20 })).toBe("1 h 20 min ago");
    expect(t("en", "og.added", { n: "2,498" })).toBe("2,498 people have added what they know");
    expect(t("en", "time.min_ago")).toBe("{n} min ago");
    expect(t("en", "time.min_ago", { x: 1 })).toBe("{n} min ago");
  });

  it("returns real strings for every language on a shared key", () => {
    for (const lang of LANGS) {
      const s = t(lang, "site.name");
      expect(s.length).toBeGreaterThan(0);
      expect(s).not.toBe("site.name");
    }
  });
});

describe("asLang()", () => {
  it("coerces unknown, empty and null to en", () => {
    expect(asLang("xx")).toBe("en");
    expect(asLang("")).toBe("en");
    expect(asLang(null)).toBe("en");
    expect(asLang(undefined)).toBe("en");
    expect(asLang("NE")).toBe("en");
  });

  it("keeps supported languages", () => {
    expect(asLang("en")).toBe("en");
    expect(asLang("ne")).toBe("ne");
    expect(asLang("hi")).toBe("hi");
  });
});

describe("href()", () => {
  it("prefixes the language", () => {
    expect(href("ne", "/places/timure")).toBe("/ne/places/timure");
    expect(href("hi", "places/timure")).toBe("/hi/places/timure");
    expect(href("en", "/report")).toBe("/en/report");
  });

  it("maps the root to the bare language path", () => {
    expect(href("en", "/")).toBe("/en");
    expect(href("ne")).toBe("/ne");
  });
});

describe("stripLang()", () => {
  it("removes a leading language segment", () => {
    expect(stripLang("/ne/places/timure")).toBe("/places/timure");
    expect(stripLang("/en/report")).toBe("/report");
    expect(stripLang("/hi")).toBe("/");
    expect(stripLang("/en/")).toBe("/");
  });

  it("does not touch paths that merely start with the letters", () => {
    expect(stripLang("/nepal")).toBe("/nepal");
    expect(stripLang("/places/timure")).toBe("/places/timure");
    expect(stripLang("/")).toBe("/");
  });
});
