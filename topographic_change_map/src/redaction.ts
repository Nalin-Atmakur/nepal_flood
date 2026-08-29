const SECRET_KEY_PATTERN =
  /(password|secret|token|authorization|cookie|api[-_]?key|otp|verification[-_]?code)/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /(?<!\d)(?:\+?\d[\d ()-]{7,}\d)(?!\d)/g;

export function maskEmail(value: string): string {
  const [local, domain] = value.split("@");
  if (!local || !domain) return "[REDACTED_EMAIL]";
  return `${local.slice(0, 1)}***@${domain}`;
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 4 ? `***${digits.slice(-4)}` : "[REDACTED_PHONE]";
}

export function redactText(value: string, knownSecrets: string[] = []): string {
  let result = value;
  for (const secret of knownSecrets.filter(Boolean)) {
    result = result.split(secret).join("[REDACTED_SECRET]");
  }
  return result
    .replace(EMAIL_PATTERN, (email) => maskEmail(email))
    .replace(PHONE_PATTERN, (phone) => maskPhone(phone));
}

export function redactValue(value: unknown, knownSecrets: string[] = []): unknown {
  if (typeof value === "string") return redactText(value, knownSecrets);
  if (Array.isArray(value)) return value.map((item) => redactValue(item, knownSecrets));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        SECRET_KEY_PATTERN.test(key)
          ? "[REDACTED_SECRET]"
          : redactValue(entry, knownSecrets),
      ]),
    );
  }
  return value;
}
