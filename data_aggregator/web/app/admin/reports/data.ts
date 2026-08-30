import { adminClient } from "@/lib/supabase";

/**
 * The raw archive, read with the service role (web/docs/20-admin-reports.md). Every column of reports_archive as
 * submitted, plus the attached files with one-hour signed URLs from the private bucket. Newest first, 500 max.
 */
export type RawReport = {
  id: string;
  user_id: string;
  created_at: string;
  lang: string | null;
  respondent_type: string | null;
  text: string | null;
  place_id: string | null;
  contact: string | null;
  supersedes: string | null;
  withdrawn_at: string | null;
  status: string | null;
  files: { id: string; path: string; kind: string; mime: string | null; bytes: number | null; url: string | null }[];
};

const BUCKET = "report-media";

export async function fetchRawReports(limit = 500): Promise<{ reports: RawReport[]; total: number } | null> {
  const sb = adminClient();
  if (!sb) return null;
  const { data, error, count } = await sb
    .from("reports_archive")
    .select("id, user_id, created_at, lang, respondent_type, text, place_id, contact, supersedes, withdrawn_at, status", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return null;
  const ids = data.map((r) => r.id as string);
  const files = new Map<string, RawReport["files"]>();
  if (ids.length) {
    const { data: rows } = await sb.from("report_files").select("id, report_id, path, kind, mime, bytes").in("report_id", ids);
    const list = (rows ?? []) as { id: string; report_id: string; path: string; kind: string; mime: string | null; bytes: number | null }[];
    // paths are stored as report-media/<user>/<report>/<n>-<name>; the storage API wants the part after the bucket
    const keys = list.map((f) => (f.path.startsWith(`${BUCKET}/`) ? f.path.slice(BUCKET.length + 1) : f.path));
    let signed: (string | null)[] = keys.map(() => null);
    if (keys.length) {
      const { data: urls } = await sb.storage.from(BUCKET).createSignedUrls(keys, 3600);
      if (urls) signed = urls.map((u) => u.signedUrl ?? null);
    }
    list.forEach((f, i) => {
      const arr = files.get(f.report_id) ?? [];
      arr.push({ id: f.id, path: f.path, kind: f.kind, mime: f.mime, bytes: f.bytes, url: signed[i] });
      files.set(f.report_id, arr);
    });
  }
  const reports = data.map((r) => ({ ...(r as Omit<RawReport, "files">), files: files.get(r.id as string) ?? [] }));
  return { reports, total: count ?? reports.length };
}

/** CSV of the same rows (one line per report; file paths joined with " | "). */
export function toCsv(reports: RawReport[]): string {
  const cols = ["id", "created_at", "lang", "respondent_type", "place_id", "status", "withdrawn_at", "supersedes", "contact", "text", "files", "user_id"] as const;
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(",")];
  for (const r of reports) {
    lines.push(cols.map((c) => esc(c === "files" ? r.files.map((f) => f.path).join(" | ") : r[c])).join(","));
  }
  return lines.join("\r\n") + "\r\n";
}
