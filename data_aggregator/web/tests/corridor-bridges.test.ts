import { describe, expect, it } from "vitest";
import { toRealBridges } from "@/components/blocks/Corridor";
import type { LostBridge, PlaceRef } from "@/lib/queries";

const ref = (id: string, km: number | null): PlaceRef => ({ id, km } as unknown as PlaceRef);

describe("toRealBridges", () => {
  const refs = [ref("betrawati", 40), ref("bidur", 46), ref("nowhere", null)];
  const lost: LostBridge[] = [
    { placeId: "bidur", name: "Bidur bridge", status: "damaged" },
    { placeId: "betrawati", name: "Betrawati bridge", status: "washed out" },
    { placeId: "betrawati", name: "second at Betrawati", status: "washed out" },
    { placeId: "nowhere", name: "no km", status: "washed out" },
    { placeId: "unknown", name: "not in gazetteer", status: "washed out" },
  ];
  it("keeps one bridge per place with a chainage, washed-out first", () => {
    const out = toRealBridges(lost, refs);
    expect(out.map((b) => b.id)).toEqual(["betrawati", "bidur"]);
    expect(out[0]).toMatchObject({ km: 40, status: "washed out", name: "Betrawati bridge" });
  });
  it("is empty without data", () => {
    expect(toRealBridges([], refs)).toEqual([]);
    expect(toRealBridges(null, null)).toEqual([]);
  });
});
