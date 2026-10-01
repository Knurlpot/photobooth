"use client";

import Wordmark from "./Wordmark";

export default function ModeSelect({
  onChoose,
  onBack,
}: {
  onChoose: (mode: "camera" | "upload") => void;
  onBack?: () => void;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-cream">
      <div className="absolute left-8 top-10">
        <Wordmark size="sm" onBack={onBack} />
      </div>

      <div className="flex flex-1 items-center justify-center gap-16">
        <h2 className="font-display text-4xl font-black text-red sm:text-6xl whitespace-nowrap">
          photo?
        </h2>

        <div className="flex gap-4 sm:gap-8">
          <button
            onClick={() => onChoose("camera")}
            className="btn-red px-10 py-8 text-2xl font-bold sm:px-16 sm:py-12 sm:text-3xl transition-transform hover:-translate-y-2"
          >
            take photo
          </button>
          <button
            onClick={() => onChoose("upload")}
            className="btn-red px-10 py-8 text-2xl font-bold sm:px-16 sm:py-12 sm:text-3xl transition-transform hover:-translate-y-2"
          >
            upload
          </button>
        </div>
      </div>
    </div>
  );
}
