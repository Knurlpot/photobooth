"use client";

import { useState } from "react";
import Wordmark from "./Wordmark";
import StripMockup from "./StripMockup";

export interface Adjustments {
  invert: boolean;
  brightness: number; // 0.5 - 1.5, 1 = unchanged
  contrast: number; // 0.5 - 1.5, 1 = unchanged
}

export default function ReviewShots({
  photos,
  onDone,
  onRetake,
  onPhotosChange,
  onBack,
}: {
  photos: string[];
  onDone: (adjustments: Adjustments) => void;
  onRetake?: (index: number) => void;
  onPhotosChange: (photos: string[]) => void;
  onBack?: () => void;
}) {
  const [invert, setInvert] = useState(false);
  const brightness = 1;
  const contrast = 1;

  const cssFilter = `invert(${invert ? 1 : 0}) brightness(${brightness}) contrast(${contrast})`;

  return (
    <div className="safe-area-page relative min-h-dvh overflow-y-auto bg-cream px-6 py-8 sm:px-10 sm:py-10">
      <div className="absolute left-6 top-8 sm:left-10 sm:top-10">
        <Wordmark size="sm" onBack={onBack} />
      </div>

      <div className="flex min-h-[calc(100dvh-5rem)] items-center justify-center pt-20 sm:pt-12">
        <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-8 md:flex-row md:gap-14">
          <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
            <h2 className="font-display text-3xl font-black text-red sm:text-4xl">review your shots</h2>
            <p className="text-sm text-ink/70">drag photo to swap places</p>
          </div>

          <StripMockup
            photos={photos}
            filter={cssFilter}
            width={photos.length > 4 ? 340 : 220}
            onRetake={onRetake}
            onSwap={(from, to) => {
              const nextPhotos = [...photos];
              [nextPhotos[from], nextPhotos[to]] = [nextPhotos[to], nextPhotos[from]];
              onPhotosChange(nextPhotos);
            }}
          />

          <div className="flex items-center justify-center self-center">
            <button
              type="button"
              aria-label="Continue"
              onClick={() => onDone({ invert, brightness, contrast })}
              className="group flex items-center p-2"
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
