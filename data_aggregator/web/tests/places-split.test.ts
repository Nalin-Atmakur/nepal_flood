import { describe, expect, it } from "vitest";
import { isDistrictRow, splitDistricts } from "@/lib/places-split";

describe("places-split", () => {
  it("separates district rows from settlement rows and keeps order", () => {
    const rows = [
      { kind: "settlement", place_id: "timure" },
      { kind: "district", place_id: "rasuwa" },
      { kind: "camp", place_id: "ut1_mailung_camp" },
      { kind: "district", place_id: "sindhupalchok" },
    ];
    const { places, districts } = splitDistricts(rows);
    expect(places.map((r) => r.place_id)).toEqual(["timure", "ut1_mailung_camp"]);
    expect(districts.map((r) => r.place_id)).toEqual(["rasuwa", "sindhupalchok"]);
  });
  it("tolerates null/undefined", () => {
    expect(splitDistricts(null)).toEqual({ places: [], districts: [] });
    expect(isDistrictRow({ kind: "hospital" })).toBe(false);
  });
});
