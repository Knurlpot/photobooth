"use client";

import Wordmark from "./Wordmark";

const TIMERS = [3, 5, 10] as const;

export default function TimerSelector({
  onChoose,
  onBack,
}: {
  onChoose: (seconds: number) => void;
  onBack?: () => void;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-cream">
      <div className="absolute left-8 top-10">
        <Wordmark size="sm" onBack={onBack} />
      </div>

      <div className="flex flex-1 items-center justify-center gap-16">
        <h2 className="font-display text-4xl font-black text-red sm:text-6xl whitespace-nowrap">
          select timer
        </h2>

        <div className="flex gap-4 sm:gap-6">
          {TIMERS.map((s) => (
            <button
              key={s}
              onClick={() => onChoose(s)}
              className="card-red flex h-32 w-32 md:h-40 md:w-40 items-center justify-center transition-transform hover:-translate-y-2"
            >
              <span className="font-display text-5xl md:text-6xl font-black">{s}S</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
