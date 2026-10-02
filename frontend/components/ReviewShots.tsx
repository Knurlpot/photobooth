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

          <StripMockup
            photos={photos}
            filter={cssFilter}
            width={photos.length > 4 ? 380 : 220}
            onRetake={onRetake}
          />

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
