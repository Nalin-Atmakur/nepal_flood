import { describe, expect, it } from "vitest";
import { buildPlaceIndex, searchPlaces } from "@/lib/places-search";
import type { PlaceRef } from "@/lib/queries";

const ref = (id: string, en: string, ne: string, aliases: string[] = []): PlaceRef =>
  ({ id, name_en: en, name_ne: ne, name_hi: null, name_zh: null, aliases, district: "Rasuwa" }) as unknown as PlaceRef;

const index = buildPlaceIndex(
  [
    ref("dhunche_army_camp", "Dhunche Nepali Army relief camp", "धुन्चे नेपाली सेना राहत शिविर"),
    ref("dhunche", "Dhunche", "धुन्चे", ["Dhunche bazaar"]),
    ref("dhunche_helipad", "Dhunche helipad (usable)", "धुन्चे हेलिप्याड"),
    ref("timure_health_post", "Timure health post", "टिमुरे स्वास्थ्य चौकी"),
    ref("timure", "Timure", "टिमुरे"),
    ref("syabrubesi", "Syabrubesi", "स्याफ्रुबेसी", ["Syafru", "Shyaprubesi", "स्याब्रूबेसी"]),
  ],
  "ne",
);

describe("searchPlaces ranking", () => {
  it("puts the place itself before its camps, helipads and posts", () => {
    expect(searchPlaces(index, "धुन्चे").map((p) => p.id)).toEqual(["dhunche", "dhunche_helipad", "dhunche_army_camp"]);
    expect(searchPlaces(index, "Timure").map((p) => p.id)).toEqual(["timure", "timure_health_post"]);
  });
  it("matches any alias in any script, diacritic-insensitive", () => {
    expect(searchPlaces(index, "स्याब्रु")[0].id).toBe("syabrubesi");
    expect(searchPlaces(index, "shyapru")[0].id).toBe("syabrubesi");
  });
  it("prefers a word prefix over a substring", () => {
    expect(searchPlaces(index, "camp")[0].id).toBe("dhunche_army_camp");
    expect(searchPlaces(index, "")).toEqual([]);
  });
});
