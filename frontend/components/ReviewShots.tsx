"use client";

import { useState } from "react";
import Wordmark from "./Wordmark";

export interface Adjustments {
  invert: boolean;
  brightness: number; // 0.5 - 1.5, 1 = unchanged
  contrast: number; // 0.5 - 1.5, 1 = unchanged
}

export default function ReviewShots({
  photos,
  onDone,
  onRetake,
  onBack,
}: {
  photos: string[];
  onDone: (adjustments: Adjustments) => void;
  onRetake?: (index: number) => void;
  onBack?: () => void;
}) {
  const [invert, setInvert] = useState(false);
  const brightness = 1;
  const contrast = 1;

  const cssFilter = `invert(${invert ? 1 : 0}) brightness(${brightness}) contrast(${contrast})`;
  const columns = photos.length > 4 ? 2 : 1;

  return (
    <div className="relative h-screen overflow-hidden bg-cream px-8 py-10">
      <div className="absolute left-8 top-10">
        <Wordmark size="sm" onBack={onBack} />
      </div>

      <div className="flex h-full items-center justify-center">
        <div className="flex items-center justify-center gap-14">
          <div className="flex flex-col items-start gap-5">
            <h2 className="font-display text-3xl font-black text-red">review your shots</h2>
          </div>

          <div className="overflow-hidden rounded-3xl border-[14px] border-black bg-frame">
          <div
            className="grid gap-[3px] p-[3px]"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, width: columns === 1 ? 220 : 380 }}
          >
            {photos.map((p, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p}
                  alt={`Shot ${i + 1}`}
                  className="aspect-[4/3] w-full object-cover"
                  style={{ filter: cssFilter }}
                />
                <button
                  type="button"
                  aria-label={`Retake shot ${i + 1}`}
                  onClick={() => onRetake?.(i)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-cream bg-red text-cream shadow-md transition hover:scale-105"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="M12 6a6 6 0 0 1 5.82 4.18h1.9A8 8 0 0 0 4.2 9.2l1.4 1.4A6 6 0 0 1 12 6Zm0 12a6 6 0 0 1-5.82-4.18H4.28A8 8 0 0 0 19.8 14.8l-1.4-1.4A6 6 0 0 1 12 18Zm-1.5-5.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Zm1.5-7a8 8 0 0 1 8 8h-2a6 6 0 0 0-6-6v-2Z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-display text-base font-black text-red">photobooth</p>
              <p className="text-[11px] text-cream/70">by knurlpot</p>
            </div>
            <span className="text-[11px] text-cream/50">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

          <div className="flex items-center justify-center self-center">
            <button
              type="button"
              aria-label="Continue"
              onClick={() => onDone({ invert, brightness, contrast })}
              className="group flex items-center"
            >
              <span className="h-[5px] w-20 rounded-full bg-red transition-all group-hover:w-28 md:w-32 md:group-hover:w-48 -mr-3" />
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-red">
                <path d="M2 12h15m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
