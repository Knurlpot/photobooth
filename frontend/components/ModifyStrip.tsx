"use client";

import { useEffect, useState } from "react";
import Wordmark from "./Wordmark";
import { FILTER_PRESETS, FilterId, LAYOUT_PRESETS, LayoutId } from "@/lib/filters";
import { Adjustments } from "./ReviewShots";

export default function ModifyStrip({
  photos,
  adjustments,
  onDevelop,
  onBack,
}: {
  photos: string[];
  adjustments: Adjustments;
  onDevelop: (filter: FilterId, layout: LayoutId, adjustments: Adjustments) => void;
  onBack?: () => void;
}) {
  const [filter, setFilter] = useState<FilterId>("original");
  const [brightness, setBrightness] = useState(adjustments.brightness);
  const [contrast, setContrast] = useState(adjustments.contrast);
  const [viewportHeight, setViewportHeight] = useState(0);
  const layout: LayoutId = photos.length > 4 ? "grid" : "strip";

  const presetCss = FILTER_PRESETS.find((f) => f.id === filter)?.css ?? "none";
  const baseCss = `invert(${adjustments.invert ? 1 : 0}) brightness(${brightness}) contrast(${contrast})`;
  const combinedCss = `${baseCss} ${presetCss === "none" ? "" : presetCss}`;
  const columns = LAYOUT_PRESETS.find((l) => l.id === layout)?.columns ?? 1;
  const rows = Math.ceil(photos.length / columns);
  const baseGridWidth = columns === 1 ? 220 : 380;
  const frameChromeHeight = 98 + Math.max(0, rows - 1) * 3;
  const rowPhotoHeight = rows > 0
    ? Math.max(0, (viewportHeight - 150 - frameChromeHeight) / rows)
    : 0;
  const fittedGridWidth = columns === 1
    ? rowPhotoHeight * (4 / 3) + 6
    : rowPhotoHeight * (8 / 3) + 9;
  const gridWidth = viewportHeight
    ? Math.min(baseGridWidth, Math.max(120, fittedGridWidth))
    : baseGridWidth;

  useEffect(() => {
    const updateViewportHeight = () => setViewportHeight(window.innerHeight);
    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);
    return () => window.removeEventListener("resize", updateViewportHeight);
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-cream px-8 py-10">
      <Wordmark size="sm" onBack={onBack} />

      <div className="flex min-h-0 flex-1 flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center lg:flex-nowrap lg:gap-16">
        <h2 className="font-display text-3xl font-black leading-none text-red">
          modify strip
        </h2>

        <div className="overflow-hidden rounded-3xl border-[14px] border-black bg-frame">
          <div
            className="grid gap-[3px] p-[3px]"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, width: gridWidth }}
          >
            {photos.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={p}
                alt={`Shot ${i + 1}`}
                className="aspect-[4/3] w-full object-cover"
                style={{ filter: combinedCss }}
              />
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

        <div className="flex flex-col gap-6">
          <div>
            <p className="font-display text-xl font-black text-red">filter</p>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {FILTER_PRESETS.map((f) => (
                <div key={f.id} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setFilter(f.id)}
                    title={f.label}
                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      filter === f.id ? "border-red scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: f.swatch }}
                  />
                  <span className="text-[9px] font-bold uppercase tracking-wide text-ink/70">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-[7rem_9rem] items-center gap-3">
              <span className="text-left text-sm font-bold tracking-wide text-black">
                BRIGHTNESS
              </span>
              <input
                type="range"
                min={0.6}
                max={1.4}
                step={0.02}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-red"
              />
            </div>

            <div className="grid grid-cols-[7rem_9rem] items-center gap-3">
              <span className="text-left text-sm font-bold tracking-wide text-black">
                CONTRAST
              </span>
              <input
                type="range"
                min={0.6}
                max={1.4}
                step={0.02}
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-red"
              />
            </div>
          </div>

          <button
            onClick={() => onDevelop(filter, layout, { ...adjustments, brightness, contrast })}
            className="btn-red px-8 py-3 text-lg font-bold"
          >
            DEVELOP
          </button>
        </div>
      </div>
    </div>
  );
}
