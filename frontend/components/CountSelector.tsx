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
    <div className="relative flex min-h-screen items-center justify-center bg-cream">
      <div className="absolute left-8 top-10">
        <Wordmark size="sm" onBack={onBack} />
      </div>

      <div className="flex flex-1 items-center justify-center gap-16">
        <h2 className="font-display text-4xl font-black text-red md:text-6xl whitespace-nowrap">
          how many shots?
        </h2>

        <div className="flex gap-4 sm:gap-6">
          {COUNTS.map((n) => (
            <button
              key={n}
              onClick={() => onChoose(n)}
              className="card-red flex h-40 w-28 md:h-48 md:w-32 items-center justify-center transition-transform hover:-translate-y-2"
            >
              <span className="font-display text-6xl md:text-7xl font-black">{n}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
