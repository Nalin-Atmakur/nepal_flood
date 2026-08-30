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
  it("keeps bridges at least 3 km apart", () => {
    const close = [ref("a", 10), ref("b", 11.5), ref("c", 14)];
    const out = toRealBridges(
      [
        { placeId: "a", name: "A", status: "washed out" },
        { placeId: "b", name: "B", status: "washed out" },
        { placeId: "c", name: "C", status: "washed out" },
      ],
      close,
    );
    expect(out.map((b) => b.id)).toEqual(["a", "c"]);
  });
  it("is empty without data", () => {
    expect(toRealBridges([], refs)).toEqual([]);
    expect(toRealBridges(null, null)).toEqual([]);
  });
});
