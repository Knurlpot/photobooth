"use client";

import { useState } from "react";
import CountSelector from "@/components/CountSelector";
import ModeSelect from "@/components/ModeSelect";
import TimerSelector from "@/components/TimerSelector";
import Camera from "@/components/Camera";
import ReviewShots, { Adjustments } from "@/components/ReviewShots";
import ModifyStrip from "@/components/ModifyStrip";
import StripPreview from "@/components/StripPreview";
import Wordmark from "@/components/Wordmark";
import { buildStrip } from "@/lib/api";
import { FilterId, LayoutId } from "@/lib/filters";

type Step =
  | "count"
  | "mode"
  | "timer"
  | "capture"
  | "review"
  | "modify"
  | "processing"
  | "result"
  | "error";

export default function BoothPage() {
  const [step, setStep] = useState<Step>("count");
  const [count, setCount] = useState(4);
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [timerSeconds, setTimerSeconds] = useState(3);
  const [photos, setPhotos] = useState<string[]>([]);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);
  const [adjustments, setAdjustments] = useState<Adjustments>({
    invert: false,
    brightness: 1,
    contrast: 1,
  });
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function restart() {
    setStep("count");
    setPhotos([]);
    setRetakeIndex(null);
    setResultUrl(null);
    setErrorMsg(null);
    setAdjustments({ invert: false, brightness: 1, contrast: 1 });
  }

  async function handleDevelop(filter: FilterId, layout: LayoutId, finalAdjustments: Adjustments) {
    setStep("processing");
    try {
      const url = await buildStrip(photos, filter, layout, finalAdjustments, "png");
      setResultUrl(url);
      setStep("result");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStep("error");
    }
  }

  function handleBack() {
    if (step === "count") window.location.href = "/";
    else if (step === "mode") setStep("count");
    else if (step === "timer") setStep("mode");
    else if (step === "capture") setStep(mode === "camera" ? "timer" : "mode");
    else if (step === "review") { setPhotos([]); setStep("capture"); }
    else if (step === "modify") setStep("review");
  }

  if (step === "count") {
    return <CountSelector onChoose={(n) => { setCount(n); setStep("mode"); }} onBack={handleBack} />;
  }

  if (step === "mode") {
    return (
      <ModeSelect
        onChoose={(m) => {
          setMode(m);
          setStep(m === "camera" ? "timer" : "capture");
        }}
        onBack={handleBack}
      />
    );
  }

  if (step === "timer") {
    return (
      <TimerSelector
        onChoose={(s) => {
          setTimerSeconds(s);
          setStep("capture");
        }}
        onBack={handleBack}
      />
    );
  }

  if (step === "capture") {
    return (
      <Camera
        count={count}
        mode={mode}
        timerSeconds={timerSeconds}
        retakeIndex={retakeIndex}
        initialPhotos={photos}
        onComplete={(p) => {
          if (retakeIndex !== null) {
            const nextPhotos = [...photos];
            nextPhotos[retakeIndex] = p[0];
            setPhotos(nextPhotos);
            setRetakeIndex(null);
            setStep("review");
            return;
          }

          setPhotos(p);
          setStep("review");
        }}
        onBack={handleBack}
      />
    );
  }

  if (step === "review") {
    return (
      <ReviewShots
        photos={photos}
        onRetake={(index) => {
          setRetakeIndex(index);
          setStep("capture");
        }}
        onDone={(adj) => {
          setAdjustments(adj);
          setStep("modify");
        }}
        onBack={handleBack}
      />
    );
  }

  if (step === "modify") {
    return <ModifyStrip photos={photos} adjustments={adjustments} onDevelop={handleDevelop} onBack={handleBack} />;
  }

  if (step === "processing") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-red/30 border-t-red" />
        <p className="font-display text-3xl font-black text-red">developing your strip&hellip;</p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex min-h-screen flex-col bg-cream px-8 py-10">
        <Wordmark size="sm" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="font-display text-3xl font-black text-red">that didn&apos;t develop right</p>
          <p className="max-w-sm text-ink/70">{errorMsg}</p>
          <button onClick={restart} className="btn-red px-8 py-3 text-lg font-bold">
            try again
          </button>
        </div>
      </div>
    );
  }

  if (step === "result" && resultUrl) {
    return <StripPreview resultUrl={resultUrl} onRestart={restart} />;
  }

  return null;
}
