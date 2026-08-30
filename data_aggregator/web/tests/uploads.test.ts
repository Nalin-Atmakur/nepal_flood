import { describe, expect, it } from "vitest";
import { MAX_BYTES, MAX_FILES, fileKind, fmtBytes, objectPath, rejectReason, safeName } from "@/lib/uploads";

describe("uploads", () => {
  it("classifies by mime, then by extension", () => {
    expect(fileKind("a.jpg", "image/jpeg")).toBe("image");
    expect(fileKind("IMG_1.HEIC", "")).toBe("image");
    expect(fileKind("clip.mov", "")).toBe("video");
    expect(fileKind("note.m4a", "")).toBe("audio");
    expect(fileKind("voice.ogg", "audio/ogg")).toBe("audio");
    expect(fileKind("list.pdf", "application/pdf")).toBe("document");
    expect(fileKind("unknown.bin", "")).toBe("document");
  });
  it("makes storage-safe names", () => {
    expect(safeName("मेरो फोटो (1).jpg")).toMatch(/^[\w.\-]+$/);
    expect(safeName("   ")).toBe("file");
    expect(safeName("a".repeat(200) + ".png").length).toBeLessThanOrEqual(80);
    expect(safeName("../../etc/passwd")).not.toContain("/");
  });
  it("builds the own-folder path", () => {
    expect(objectPath("u1", "r1", 3, "My Photo.jpg")).toBe("u1/r1/03-My-Photo.jpg");
  });
  it("rejects too big / too many", () => {
    expect(rejectReason({ size: 10 }, 0)).toBeNull();
    expect(rejectReason({ size: MAX_BYTES + 1 }, 0)).toBe("too_big");
    expect(rejectReason({ size: 10 }, MAX_FILES)).toBe("too_many");
  });
  it("formats sizes", () => {
    expect(fmtBytes(0)).toBe("");
    expect(fmtBytes(2048)).toBe("2 KB");
    expect(fmtBytes(2.4 * 1024 * 1024)).toBe("2.4 MB");
    expect(fmtBytes(40 * 1024 * 1024)).toBe("40 MB");
  });
});
