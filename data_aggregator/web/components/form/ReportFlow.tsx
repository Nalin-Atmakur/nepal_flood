"use client";

import { useState } from "react";
import type { RespondentType } from "@/lib/config";
import { t, type Lang } from "@/lib/i18n";
import type { PlaceRef } from "@/lib/queries";
import TheBox, { type BoxMode } from "./TheBox";
import Understood from "./Understood";
import WhoAreYou from "./WhoAreYou";

/**
 * /report orchestrator: who → box → sent. No multi-step form — the "who" tap only picks the chip set.
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

type Step = "who" | "box" | "sent";

function prefixFor(lang: Lang, mode: BoxMode): string {
  if (mode === "correct") return t(lang, "report.correction_prefix");
  if (mode === "add") return t(lang, "report.also_prefix");
  return "";
}

export default function ReportFlow({ lang, places, initialType, initialPlaceId, supersedes: initialSupersedes, mode: initialMode }: Props) {
  const [step, setStep] = useState<Step>(initialType ? "box" : "who");
  const [type, setType] = useState<RespondentType | null>(initialType);
  const [placeId, setPlaceId] = useState<string | null>(initialPlaceId);
  const [supersedes, setSupersedes] = useState<string | null>(initialSupersedes);
  const [mode, setMode] = useState<BoxMode>(initialSupersedes ? initialMode : null);
  const [initialText, setInitialText] = useState<string>(initialSupersedes ? prefixFor(lang, initialMode) : "");
  const [lastId, setLastId] = useState<string | null>(null);
  const [boxKey, setBoxKey] = useState(0);

  function reopen(nextMode: BoxMode) {
    setSupersedes(lastId || null);
    setMode(lastId ? nextMode : null);
    setInitialText(lastId ? prefixFor(lang, nextMode) : "");
    setBoxKey((k) => k + 1);
    setStep(type ? "box" : "who");
  }

  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-5 md:py-10" data-page="report">
      {step === "who" || !type ? (
        <WhoAreYou
          lang={lang}
          onSelect={(picked) => {
            setType(picked);
            setStep("box");
          }}
        />
      ) : step === "box" ? (
        <TheBox
          key={boxKey}
          lang={lang}
          type={type}
          places={places}
          initialText={initialText}
          initialPlaceId={placeId}
          supersedes={supersedes}
          mode={mode}
          onBack={() => setStep("who")}
          onSent={(id, sentPlaceId) => {
            setLastId(id || null);
            if (sentPlaceId !== undefined) setPlaceId(sentPlaceId);
            setStep("sent");
          }}
        />
      ) : (
        <Understood lang={lang} id={lastId ?? ""} onCorrect={() => reopen("correct")} onAddMore={() => reopen("add")} />
      )}
    </main>
  );
}
