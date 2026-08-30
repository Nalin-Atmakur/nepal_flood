import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminConfigured, verifyToken } from "@/lib/admin-auth";
import { login, logout } from "./actions";
import { fetchRawReports } from "./data";

/**
 * /admin/reports — the hidden, password-gated view of the raw archive (web/docs/20-admin-reports.md). Not linked
 * anywhere, `noindex`, excluded from the locale proxy. Renders the password form until the session cookie
 * verifies; then every submission as stored — text, contact, place, files (signed links) — newest first, with a
 * CSV export. Nothing here is cached (`force-dynamic`).
 */
export const dynamic = "force-dynamic";

const box = "b-ink rounded-r2 bg-card shadow-hard-3 p-4";

export default async function AdminReports({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const jar = await cookies();
  const authed = verifyToken(jar.get(ADMIN_COOKIE)?.value);

  if (!authed) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <form action={login} className={box + " w-full max-w-[360px] flex flex-col gap-3"} data-testid="admin-login">
          <h1 className="font-extrabold text-[20px] m-0">Raw reports</h1>
          <p className="font-medium text-[13px] text-muted m-0">Volunteer team only. Everything behind this page is private and unprocessed.</p>
          {!adminConfigured() ? <p className="font-bold text-[13px] text-live m-0">ADMIN_PASSWORD is not set on the server.</p> : null}
          {sp.e ? <p className="font-bold text-[13px] text-live m-0" role="alert">Wrong password.</p> : null}
          <input type="password" name="password" autoComplete="current-password" required className="min-h-[44px] px-3 b-ink-2 rounded-r2 bg-card font-medium text-[14px]" aria-label="Password" />
          <button type="submit" className="min-h-[44px] rounded-r2 b-ink-2 bg-ultra text-white font-extrabold text-[14px] shadow-hard-3 press-3 cursor-pointer">
            Open
          </button>
        </form>
      </main>
    );
  }

  const data = await fetchRawReports();
  return (
    <main className="max-w-[1280px] mx-auto p-4 md:p-6 flex flex-col gap-4">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="font-extrabold text-[22px] m-0">Raw reports</h1>
        <span className="font-semibold text-[13px] text-muted">{data ? `${data.total} in the archive · showing ${data.reports.length}` : "archive unavailable"}</span>
        <div className="ml-auto flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a file download from a route handler, not a page */}
          <a href="/admin/reports/export" className="inline-flex items-center min-h-[40px] px-3 rounded-r2 b-ink-2 bg-amber-fill font-bold text-[13px] text-ink no-underline">
            ⬇ CSV
          </a>
          <form action={logout}>
            <button type="submit" className="min-h-[40px] px-3 rounded-r2 b-ink-2 bg-card font-bold text-[13px] cursor-pointer">
              Log out
            </button>
          </form>
        </div>
      </header>
      <p className="font-medium text-[12.5px] text-muted m-0">Private. Contacts and text exactly as submitted; file links are signed and expire after an hour. Withdrawn reports are marked, not hidden.</p>

      {!data ? (
        <div className={box + " text-live font-bold"}>Could not read the archive — is SUPABASE_SERVICE_ROLE_KEY set on the server?</div>
      ) : data.reports.length === 0 ? (
        <div className={box + " text-muted font-semibold"}>No reports yet.</div>
      ) : (
        <ol className="list-none m-0 p-0 flex flex-col gap-3" data-testid="admin-rows">
          {data.reports.map((r) => (
            <li key={r.id} className={box + (r.withdrawn_at ? " opacity-70" : "")} data-report={r.id}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-semibold text-[12px] text-muted">
                <span className="arcade text-[9px] text-ink">{new Date(r.created_at).toISOString().replace("T", " ").slice(0, 16)} UTC</span>
                <span className="bg-ground b-ink-2 rounded-pill px-2 py-[1px] text-ink">{r.respondent_type ?? "—"}</span>
                <span>{r.lang ?? "—"}</span>
                {r.place_id ? <span>📍 {r.place_id}</span> : null}
                <span>{r.status ?? "—"}</span>
                {r.withdrawn_at ? <span className="text-live font-bold">withdrawn {r.withdrawn_at.slice(0, 16).replace("T", " ")}</span> : null}
                {r.supersedes ? <span>↳ supersedes {r.supersedes.slice(0, 8)}</span> : null}
                <span className="ml-auto font-mono text-[11px]">{r.id.slice(0, 8)} · user {r.user_id.slice(0, 8)}</span>
              </div>
              <pre className="whitespace-pre-wrap font-sans font-medium text-[14px] lh-body m-0 mt-2">{r.text}</pre>
              {r.contact ? (
                <div className="mt-2 font-semibold text-[13px]">
                  Contact: <span className="font-mono">{r.contact}</span>
                </div>
              ) : null}
              {r.files.length ? (
                <ul className="list-none m-0 mt-2 p-0 flex flex-wrap gap-2">
                  {r.files.map((f) => (
                    <li key={f.id}>
                      {f.url ? (
                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-[32px] px-2 rounded-r2 b-ink-2 bg-ground font-semibold text-[12px] text-ink">
                          {f.kind} · {f.path.split("/").pop()} {f.bytes ? `· ${Math.round(f.bytes / 1024)} KB` : ""}
                        </a>
                      ) : (
                        <span className="inline-flex items-center min-h-[32px] px-2 rounded-r2 b-ink-2 bg-ground font-semibold text-[12px] text-muted">{f.path}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
