"use client";

import { useEffect, useState } from "react";
import Wordmark from "./Wordmark";
import StripMockup from "./StripMockup";
import {
  FILTER_PRESETS,
  FilterId,
  LAYOUT_PRESETS,
  LayoutId,
  STRIP_COLORS,
  StripColor,
} from "@/lib/filters";
import { Adjustments } from "./ReviewShots";

export default function ModifyStrip({
  photos,
  adjustments,
  onDevelop,
  onPhotosChange,
  onBack,
}: {
  photos: string[];
  adjustments: Adjustments;
  onDevelop: (
    photos: string[],
    filter: FilterId,
    layout: LayoutId,
    adjustments: Adjustments,
    mirrored: boolean,
    stripColor: StripColor
  ) => void;
  onPhotosChange: (photos: string[]) => void;
  onBack?: () => void;
}) {
  const [orderedPhotos, setOrderedPhotos] = useState(photos);
  const [filter, setFilter] = useState<FilterId>("original");
  const [brightness, setBrightness] = useState(adjustments.brightness);
  const [contrast, setContrast] = useState(adjustments.contrast);
  const [mirrored, setMirrored] = useState(false);
  const [stripColor, setStripColor] = useState<StripColor>("black");
  const [viewportHeight, setViewportHeight] = useState(0);
  const layout: LayoutId = orderedPhotos.length > 4 ? "grid" : "strip";

  const presetCss = FILTER_PRESETS.find((f) => f.id === filter)?.css ?? "none";
  const baseCss = `invert(${adjustments.invert ? 1 : 0}) brightness(${brightness}) contrast(${contrast})`;
  const combinedCss = `${baseCss} ${presetCss === "none" ? "" : presetCss}`;
  const columns = LAYOUT_PRESETS.find((l) => l.id === layout)?.columns ?? 1;
  const rows = Math.ceil(orderedPhotos.length / columns);
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

  function swapPhotos(from: number, to: number) {
    if (from === to) return;
    const nextPhotos = [...orderedPhotos];
    [nextPhotos[from], nextPhotos[to]] = [nextPhotos[to], nextPhotos[from]];
    setOrderedPhotos(nextPhotos);
    onPhotosChange(nextPhotos);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-cream px-8 py-10">
      <Wordmark size="sm" onBack={onBack} />

      <div className="flex min-h-0 flex-1 flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center lg:flex-nowrap lg:gap-16">
        <h2 className="font-display text-3xl font-black leading-none text-red">
          modify strip
        </h2>

        <StripMockup
          photos={orderedPhotos}
          filter={combinedCss}
          mirrored={mirrored}
          stripColor={stripColor}
          width={gridWidth}
          onSwap={swapPhotos}
        />

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

          <button
            type="button"
            aria-label="Mirror all images"
            aria-pressed={mirrored}
            onClick={() => setMirrored((current) => !current)}
            className={`flex h-10 w-10 items-center justify-center self-start rounded-full border-2 transition ${
              mirrored
                ? "border-red bg-red text-cream"
                : "border-red text-red hover:bg-red/10"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3v18" strokeDasharray="2 2" />
              <path d="M10 6H5v12h5M14 6h5v12h-5" />
              <path d="m8 9 2-3-2-3M16 9l-2-3 2-3" />
            </svg>
          </button>

          <div>
            <p className="font-display text-xl font-black text-red">color of strip</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {STRIP_COLORS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  aria-label={color.label}
                  aria-pressed={stripColor === color.id}
                  title={color.label}
                  onClick={() => setStripColor(color.id)}
                  className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    stripColor === color.id
                      ? "scale-110 border-red ring-2 ring-cream"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
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
            onClick={() =>
              onDevelop(orderedPhotos, filter, layout, {
                ...adjustments,
                brightness,
                contrast,
              }, mirrored, stripColor)
            }
            className="btn-red px-8 py-3 text-lg font-bold"
          >
            DEVELOP
          </button>
        </div>
      </div>
    </div>
  );
}
