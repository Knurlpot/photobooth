"use client";

import Wordmark from "./Wordmark";

const COUNTS = [3, 4, 6, 8] as const;

export default function CountSelector({
  onChoose,
  onBack,
}: {
  onChoose: (count: number) => void;
  onBack?: () => void;
}) {
  return (
    <div className="safe-area-page relative flex min-h-dvh items-center justify-center bg-cream px-6 py-8 sm:px-10">
      <div className="absolute left-6 top-8 sm:left-10 sm:top-10">
        <Wordmark size="sm" onBack={onBack} />
      </div>

      <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-8 pt-20 sm:gap-12 md:flex-row md:gap-16 md:pt-0">
        <h2 className="text-center font-display text-4xl font-black text-red sm:text-5xl md:text-6xl">
          how many shots?
        </h2>

        <div className="grid w-full max-w-md grid-cols-4 gap-2 sm:gap-4">
          {COUNTS.map((n) => (
            <button
              key={n}
              onClick={() => onChoose(n)}
            className="card-red flex aspect-[3/4] w-full items-center justify-center transition-transform hover:-translate-y-2"
            >
              <span className="font-display text-6xl md:text-7xl font-black">{n}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
