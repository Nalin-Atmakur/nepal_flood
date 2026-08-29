import fs from "node:fs";
import path from "node:path";
import { parse } from "dotenv";
import { z } from "zod";
import { isSandboxRuntime, LOCAL_ENV_PATH, PROJECT_ROOT } from "./constants.js";
import { runCommand } from "./process.js";

const configSchema = z.object({
  TCM_SIGNUP_EMAIL: z.email(),
  TCM_SIGNUP_EMAIL_PASSWORD: z.string().min(1),
  TCM_SIGNUP_PHONE_E164: z.string().regex(/^\+[1-9]\d{7,14}$/),
  TCM_LEGAL_NAME: z.string().default(""),
  TCM_COUNTRY: z.string().min(2),
  TCM_ADDRESS_LINE1: z.string().default(""),
  TCM_ADDRESS_LINE2: z.string().default(""),
  TCM_CITY: z.string().default(""),
  TCM_POSTCODE: z.string().default(""),
  TCM_PROJECT_NAME: z.literal("Cambridge Helpers"),
  TCM_PROJECT_STATUS: z.literal("Independent volunteer research project"),
  TCM_PROJECT_PURPOSE: z.string().min(20),
  TCM_PROVIDER_FIRST_NAME: z.string().default(""),
  TCM_PROVIDER_LAST_NAME: z.string().default(""),
  TCM_PROVIDER_COMPANY: z.string().default("Cambridge Helpers"),
  TCM_PROVIDER_JOB_TITLE: z.string().default("Independent Volunteer Researcher"),
  TCM_PLANET_PASSWORD: z.string().default(""),
  TCM_LOCAL_CACHE_LIMIT_GB: z.coerce.number().int().min(5).max(20).default(20),
  TCM_REMOTE_HOST: z.string().regex(/^zoral@/),
  TCM_REMOTE_ROOT: z.literal("/Users/zoral/topographic-change-map"),
});

export type AppConfig = z.infer<typeof configSchema>;

export async function assertSecretFileSafety(envPath = LOCAL_ENV_PATH): Promise<void> {
  const absolute = path.resolve(envPath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Missing local secret file: ${absolute}`);
  }
  const stat = fs.statSync(absolute);
  const mode = stat.mode & 0o777;
  if (mode !== 0o600) {
    throw new Error(`Secret file must have mode 0600; found ${mode.toString(8)}`);
  }
  const relative = path.relative(PROJECT_ROOT, absolute);
  const repository = await runCommand("git", ["rev-parse", "--show-toplevel"], {
    cwd: PROJECT_ROOT,
  });
  if (repository.exitCode !== 0) {
    const expectedSandboxRoot = "/Users/zoral/topographic-change-map/app";
    if (isSandboxRuntime() && PROJECT_ROOT === expectedSandboxRoot && absolute.startsWith(`${expectedSandboxRoot}/`)) {
      return;
    }
    throw new Error("Secret file is outside a verifiable Git checkout");
  }
  const ignored = await runCommand("git", ["check-ignore", "-q", "--", relative], {
    cwd: PROJECT_ROOT,
  });
  if (ignored.exitCode !== 0) throw new Error("Secret file is not ignored by Git");
  const tracked = await runCommand("git", ["ls-files", "--error-unmatch", "--", relative], {
    cwd: PROJECT_ROOT,
  });
  if (tracked.exitCode === 0) throw new Error("Secret file is tracked by Git");
}

export async function loadConfig(envPath = LOCAL_ENV_PATH): Promise<AppConfig> {
  await assertSecretFileSafety(envPath);
  return configSchema.parse(parse(fs.readFileSync(envPath)));
}

export function knownSecrets(config: AppConfig): string[] {
  return [
    config.TCM_SIGNUP_EMAIL,
    config.TCM_SIGNUP_EMAIL_PASSWORD,
    config.TCM_SIGNUP_PHONE_E164,
    config.TCM_LEGAL_NAME,
    config.TCM_ADDRESS_LINE1,
    config.TCM_ADDRESS_LINE2,
    config.TCM_POSTCODE,
    config.TCM_PLANET_PASSWORD,
  ];
}
