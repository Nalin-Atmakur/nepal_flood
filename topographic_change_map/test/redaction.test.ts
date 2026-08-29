import { describe, expect, it } from "vitest";
import { maskEmail, maskPhone, redactText, redactValue } from "../src/redaction.js";

describe("redaction", () => {
  it("masks email and phone fields", () => {
    expect(maskEmail("person@example.com")).toBe("p***@example.com");
    expect(maskPhone("+44 7700 900123")).toBe("***0123");
  });

  it("removes known secrets and detected contact details", () => {
    const value = redactText(
      "email person@example.com phone +44 7700 900123 password hunter2",
      ["hunter2"],
    );
    expect(value).not.toContain("person@example.com");
    expect(value).not.toContain("7700 900123");
    expect(value).not.toContain("hunter2");
  });

  it("redacts values under secret-looking keys", () => {
    expect(redactValue({ apiKey: "abc", nested: { city: "London" } })).toEqual({
      apiKey: "[REDACTED_SECRET]",
      nested: { city: "London" },
    });
  });
});
