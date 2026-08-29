import { z } from "zod";
import type { AppConfig } from "./config.js";
import { runCommand } from "./process.js";

const diskSchema = z.object({
  freeKiB: z.number().int().nonnegative(),
  user: z.literal("zoral"),
  root: z.literal("/Users/zoral/topographic-change-map"),
});

export interface RemoteCheck {
  freeGiB: number;
  status: "READY" | "WARNING" | "STOP";
}

export async function checkRemote(config: AppConfig): Promise<RemoteCheck> {
  const script = [
    "set -eu",
    'test "$USER" = zoral',
    `root=${JSON.stringify(config.TCM_REMOTE_ROOT)}`,
    'case "$root" in /Users/zoral/topographic-change-map) ;; *) exit 64 ;; esac',
    'free_kib=$(df -k /System/Volumes/Data | awk "NR==2 {print \\$4}")',
    'printf \'{"freeKiB":%s,"user":"zoral","root":"/Users/zoral/topographic-change-map"}\\n\' "$free_kib"',
  ].join("; ");
  const result = await runCommand(
    "ssh",
    ["-o", "BatchMode=yes", "-o", "ConnectTimeout=10", config.TCM_REMOTE_HOST, script],
    { timeoutMs: 20_000 },
  );
  if (result.exitCode !== 0) throw new Error("Sandbox storage preflight failed");
  const parsed = diskSchema.parse(JSON.parse(result.stdout.trim()));
  const freeGiB = parsed.freeKiB / 1024 / 1024;
  return {
    freeGiB,
    status: freeGiB < 15 ? "STOP" : freeGiB < 30 ? "WARNING" : "READY",
  };
}
