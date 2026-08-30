import { describe, expect, it } from "vitest";
import { SHARE_TARGETS, pageUrl, shareLinks, shareText, withUtm } from "@/lib/share";

const PAGE = "https://nepalfloodtracker.com/ne/places/timure";

describe("withUtm()", () => {
  it("keeps existing query params and adds the three utm fields", () => {
    const u = new URL(withUtm(`${PAGE}?x=1&y=two`, "whatsapp", "ne"));
    expect(u.origin + u.pathname).toBe(PAGE);
    expect(u.searchParams.get("x")).toBe("1");
    expect(u.searchParams.get("y")).toBe("two");
    expect(u.searchParams.get("utm_source")).toBe("whatsapp");
    expect(u.searchParams.get("utm_medium")).toBe("share");
    expect(u.searchParams.get("utm_campaign")).toBe("nft_ne");
  });

  it("keeps the hash and uses the language in the campaign", () => {
    const u = new URL(withUtm(`${PAGE}#add`, "x", "hi"));
    expect(u.hash).toBe("#add");
    expect(u.searchParams.get("utm_source")).toBe("x");
    expect(u.searchParams.get("utm_campaign")).toBe("nft_hi");
  });

  it("resolves relative paths against the site origin", () => {
    const u = new URL(withUtm("/en", "copy", "en"));
    expect(u.origin).toBe("https://nepalfloodtracker.com");
    expect(u.pathname).toBe("/en");
    expect(u.searchParams.get("utm_campaign")).toBe("nft_en");
  });
});

describe("shareLinks()", () => {
  it("returns the five targets in design order", () => {
    const links = shareLinks({ url: PAGE, lang: "en" });
    expect(links.map((l) => l.id)).toEqual(["whatsapp", "x", "linkedin", "telegram", "copy"]);
    expect(SHARE_TARGETS).toEqual(["whatsapp", "x", "linkedin", "telegram", "copy"]);
    expect(links.map((l) => l.labelKey)).toEqual(["share.whatsapp", "share.x", "share.linkedin", "share.telegram", "share.copy"]);
  });

  it("puts the utm url, encoded, inside the WhatsApp href", () => {
    const [wa] = shareLinks({ url: PAGE, lang: "en", text: "hello" });
    const target = withUtm(PAGE, "whatsapp", "en");
    expect(wa.url).toBe(target);
    expect(wa.href.startsWith("https://wa.me/?text=")).toBe(true);
    expect(wa.href).toContain(encodeURIComponent(target));
    expect(wa.href).toContain(encodeURIComponent("hello"));
  });

  it("gives every network its own utm_source and the copy target the plain utm url", () => {
    const links = shareLinks({ url: PAGE, lang: "ne" });
    for (const l of links) {
      expect(new URL(l.url).searchParams.get("utm_source")).toBe(l.id);
      expect(new URL(l.url).searchParams.get("utm_campaign")).toBe("nft_ne");
    }
    const copy = links.find((l) => l.id === "copy");
    expect(copy?.href).toBe(copy?.url);
    const x = links.find((l) => l.id === "x");
    expect(x?.href).toContain(encodeURIComponent(x?.url ?? ""));
    // the link sits on its own line after a blank one (WhatsApp and X)
    const wa = links.find((l) => l.id === "whatsapp");
    expect(decodeURIComponent(wa?.href ?? "")).toContain("\n\nhttps://");
    expect(decodeURIComponent(x?.href ?? "")).toContain("\n\nhttps://");
  });
});

describe("pageUrl()", () => {
  it("builds the canonical absolute URL", () => {
    expect(pageUrl("en", "/")).toBe("https://nepalfloodtracker.com/en");
    expect(pageUrl("en")).toBe("https://nepalfloodtracker.com/en");
    expect(pageUrl("ne", "/places/timure")).toBe("https://nepalfloodtracker.com/ne/places/timure");
    expect(pageUrl("hi", "report")).toBe("https://nepalfloodtracker.com/hi/report");
  });
  it("opens with the live numbers when all three are known, else the plain description", () => {
    const hook = shareText("en", { dead: 675, missing: 2498, rescued: 7514 });
    expect(hook).toContain("675 dead");
    expect(hook).toContain("2,498 out of contact");
    expect(hook).toContain("7,514 rescued");
    expect(hook.length).toBeLessThan(320);
    expect(shareText("en", { dead: 675, missing: null, rescued: 7514 })).toBe(shareText("en"));
    expect(shareText("ne", { dead: 1, missing: 2, rescued: 3 })).toContain("1 मृत");
    const [wa] = shareLinks({ url: PAGE, lang: "en", numbers: { dead: 675, missing: 2498, rescued: 7514 } });
    expect(decodeURIComponent(wa.href)).toContain("675 dead");
  });
});
