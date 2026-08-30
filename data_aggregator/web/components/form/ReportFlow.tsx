"use client";

import { useState } from "react";
import type { RespondentType } from "@/lib/config";
import { fmtCadence } from "@/lib/format";
import { t, type Lang } from "@/lib/i18n";
import type { PlaceRef } from "@/lib/queries";
import TheBox, { type BoxMode } from "./TheBox";
import Understood from "./Understood";
import WhoAreYou from "./WhoAreYou";

/**
 * /report orchestrator — ONE page: "Who are you?" selector + the box + Send, then the "we understood"
 * screen after sending (docs/06-report-flow.md). The respondent type defaults to "I'm looking for
 * someone" (the common case) so nothing blocks typing; changing it only swaps the chip set.
 * "Correct something" / "Add more" reopen the box as a new row that supersedes the one just sent
 * (corrections are new rows, never edits — db/migrations/001_archive.sql).
 */

type Props = {
  lang: Lang;
  places: PlaceRef[];
  initialType: RespondentType | null;
  initialPlaceId: string | null;
  supersedes: string | null;
  mode: BoxMode;
};

type Step = "box" | "sent";

function prefixFor(lang: Lang, mode: BoxMode): string {
  if (mode === "correct") return t(lang, "report.correction_prefix");
  if (mode === "add") return t(lang, "report.also_prefix");
  return "";
}

export default function ReportFlow({ lang, places, initialType, initialPlaceId, supersedes: initialSupersedes, mode: initialMode }: Props) {
  const [step, setStep] = useState<Step>("box");
  const [type, setType] = useState<RespondentType>(initialType ?? "family");
  const [placeId, setPlaceId] = useState<string | null>(initialPlaceId);
  const [supersedes, setSupersedes] = useState<string | null>(initialSupersedes);
  const [mode, setMode] = useState<BoxMode>(initialSupersedes ? initialMode : null);
  const [initialText, setInitialText] = useState<string>(initialSupersedes ? prefixFor(lang, initialMode) : "");
  const [lastId, setLastId] = useState<string | null>(null);
  const [lastFiles, setLastFiles] = useState<{ attached: number; failed: number } | null>(null);
  const [boxKey, setBoxKey] = useState(0);

  function reopen(nextMode: BoxMode) {
    setSupersedes(lastId || null);
    setMode(lastId ? nextMode : null);
    setInitialText(lastId ? prefixFor(lang, nextMode) : "");
    setBoxKey((k) => k + 1);
    setStep("box");
  }

  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-5 md:py-10" data-page="report">
      {step === "box" ? (
        <div className="flex flex-col gap-5 md:gap-7">
          {/* how it works — one slim line, away from the inputs */}
          <p className="m-0 bg-board text-white b-ink-2 rounded-r2 px-3 py-2 md:px-4 font-medium text-[12.5px] md:text-[13px] lh-body">
            <span className="arcade text-amber mr-2" style={{ fontSize: 8 }}>
              HOW IT WORKS
            </span>
            {t(lang, "report.how_banner", { cadence: fmtCadence(lang) })}
          </p>
          <WhoAreYou lang={lang} value={type} onSelect={setType} />
          <TheBox
            key={boxKey}
            lang={lang}
            type={type}
            places={places}
            initialText={initialText}
            initialPlaceId={placeId}
            supersedes={supersedes}
            mode={mode}
            onSent={(id, sentPlaceId, files) => {
              setLastId(id || null);
              setLastFiles(files ?? null);
              if (sentPlaceId !== undefined) setPlaceId(sentPlaceId);
              setStep("sent");
            }}
          />
        </div>
      ) : (
        <Understood lang={lang} id={lastId ?? ""} files={lastFiles} onCorrect={() => reopen("correct")} onAddMore={() => reopen("add")} />
      )}
    </main>
  );
}
