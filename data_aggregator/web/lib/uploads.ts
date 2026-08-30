/**
 * Attachments for reports — the browser's contract with the `report-media` bucket and `report_files`
 * (db/migrations/011_report_media.sql). An anonymous authenticated user may upload into their own folder
 * (<user_id>/<report_id>/<n>-<name>), insert the matching report_files row, and read back their own files
 * (signed URLs). Nothing here is public; the pipeline never reads file contents.
 * See web/docs/06-report-flow.md §Attachments.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const BUCKET = "report-media";
export const MAX_FILES = 10;
export const MAX_BYTES = 50 * 1024 * 1024;
/** What the file input accepts — mirrors the bucket's allowed_mime_types, plus extensions for pickers that ignore mime. */
export const ACCEPT = "image/*,video/*,audio/*,.pdf,.txt,.doc,.docx,.heic,.m4a";

export type FileKind = "image" | "video" | "audio" | "document";

export type ReportFile = {
  id: string;
  report_id: string;
  path: string;
  kind: FileKind;
  mime: string | null;
  bytes: number | null;
  created_at: string;
};

export type UploadOutcome = { uploaded: ReportFile[]; failed: { name: string; reason: string }[] };

/** Classify by mime, falling back to the extension (mobile pickers often send an empty type for HEIC/M4A). */
export function fileKind(name: string, mime: string | null | undefined): FileKind {
  const m = (mime ?? "").toLowerCase();
  const ext = (name.split(".").pop() ?? "").toLowerCase();
  if (m.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "heic", "heif", "gif"].includes(ext)) return "image";
  if (m.startsWith("video/") || ["mp4", "mov", "webm", "3gp"].includes(ext)) return "video";
  if (m.startsWith("audio/") || ["m4a", "mp3", "aac", "ogg", "wav", "opus"].includes(ext)) return "audio";
  return "document";
}

/** A storage-safe object name: ascii letters/digits/dot/dash, at most 80 chars, never empty. */
export function safeName(name: string): string {
  const base = name.normalize("NFKD").replace(/[^\w.\-]+/g, "-").replace(/-+/g, "-").replace(/^[-.]+|[-.]+$/g, "");
  const out = base.slice(-80);
  return out || "file";
}

/** Object path inside the bucket. */
export function objectPath(userId: string, reportId: string, n: number, name: string): string {
  return `${userId}/${reportId}/${String(n).padStart(2, "0")}-${safeName(name)}`;
}

/** Client-side checks before an upload starts. Returns a reason key or null. */
export function rejectReason(file: { size: number }, count: number): "too_big" | "too_many" | null {
  if (count >= MAX_FILES) return "too_many";
  if (file.size > MAX_BYTES) return "too_big";
  return null;
}

/**
 * Upload the files one by one and record each in report_files. Never throws: the report is already saved;
 * a failed file is reported back so the UI can say so. `onProgress(done, total)` after each file.
 */
export async function uploadReportFiles(
  sb: SupabaseClient,
  userId: string,
  reportId: string,
  files: File[],
  onProgress?: (done: number, total: number) => void,
): Promise<UploadOutcome> {
  const out: UploadOutcome = { uploaded: [], failed: [] };
  let n = 0;
  for (const file of files.slice(0, MAX_FILES)) {
    n++;
    const path = objectPath(userId, reportId, n, file.name);
    const kind = fileKind(file.name, file.type);
    try {
      const up = await sb.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type || undefined });
      if (up.error) {
        out.failed.push({ name: file.name, reason: up.error.message });
        continue;
      }
      const { data, error } = await sb
        .from("report_files")
        .insert({ report_id: reportId, user_id: userId, path, kind, mime: file.type || null, bytes: file.size })
        .select("id, report_id, path, kind, mime, bytes, created_at")
        .single();
      if (error || !data) {
        out.failed.push({ name: file.name, reason: error?.message ?? "row" });
        continue;
      }
      out.uploaded.push(data as ReportFile);
    } catch (e) {
      out.failed.push({ name: file.name, reason: e instanceof Error ? e.message : "unknown" });
    } finally {
      onProgress?.(n, Math.min(files.length, MAX_FILES));
    }
  }
  return out;
}

/** Own attachments for a set of reports (RLS limits this to the caller's rows). */
export async function listReportFiles(sb: SupabaseClient, reportIds: string[]): Promise<ReportFile[]> {
  if (!reportIds.length) return [];
  try {
    const { data, error } = await sb
      .from("report_files")
      .select("id, report_id, path, kind, mime, bytes, created_at")
      .in("report_id", reportIds)
      .order("created_at", { ascending: true });
    return error || !data ? [] : (data as ReportFile[]);
  } catch {
    return [];
  }
}

/** A short-lived URL to view one of the caller's own files (the bucket is private). */
export async function signedUrl(sb: SupabaseClient, path: string, seconds = 3600): Promise<string | null> {
  try {
    const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(path, seconds);
    return error ? null : (data?.signedUrl ?? null);
  } catch {
    return null;
  }
}

/** "2.4 MB" */
export function fmtBytes(n: number | null | undefined): string {
  if (!n || n <= 0) return "";
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}
