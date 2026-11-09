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
    <div className="safe-area-page relative flex min-h-dvh items-center justify-center bg-cream px-6 py-8 sm:px-10">
      <div className="absolute left-6 top-8 sm:left-10 sm:top-10">
        <Wordmark size="sm" onBack={onBack} />
      </div>

      <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-8 pt-20 sm:gap-12 md:flex-row md:gap-16 md:pt-0">
        <h2 className="font-display text-4xl font-black text-red sm:text-6xl">
          photo?
        </h2>

        <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:gap-5">
          <button
            onClick={() => onChoose("camera")}
            className="btn-red min-h-28 px-4 py-6 text-xl font-bold sm:min-h-36 sm:px-8 sm:text-3xl transition-transform hover:-translate-y-2"
          >
            take photo
          </button>
          <button
            onClick={() => onChoose("upload")}
            className="btn-red min-h-28 px-4 py-6 text-xl font-bold sm:min-h-36 sm:px-8 sm:text-3xl transition-transform hover:-translate-y-2"
          >
            upload
          </button>
        </div>
      </div>
    </div>
  );
}
