"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, ADMIN_SESSION_MS, checkPassword, signToken } from "@/lib/admin-auth";

/** Password form → session cookie (httpOnly, strict, scoped to /admin). A wrong password just re-shows the form. */
export async function login(form: FormData): Promise<void> {
  const pw = String(form.get("password") ?? "");
  // a small fixed delay keeps guessing slow without state
  await new Promise((r) => setTimeout(r, 400));
  const token = checkPassword(pw) ? signToken() : null;
  if (!token) redirect("/admin/reports?e=1");
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/admin", maxAge: ADMIN_SESSION_MS / 1000 });
  redirect("/admin/reports");
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/admin", maxAge: 0 });
  redirect("/admin/reports");
}
