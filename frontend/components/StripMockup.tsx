"use client";

import { STRIP_COLORS, StripColor } from "@/lib/filters";

export default function StripMockup({
  photos,
  filter,
  stripColor = "black",
  mirrored = false,
  width,
  onRetake,
  onSwap,
}: {
  photos: string[];
  filter: string;
  stripColor?: StripColor;
  mirrored?: boolean;
  width: number;
  onRetake?: (index: number) => void;
  onSwap?: (from: number, to: number) => void;
}) {
  const columns = photos.length > 4 ? 2 : 1;
  const color = STRIP_COLORS.find((item) => item.id === stripColor)?.hex
    ?? STRIP_COLORS[0].hex;

  function handleDrop(event: React.DragEvent<HTMLDivElement>, target: number) {
    if (!onSwap) return;
    event.preventDefault();
    const source = Number(event.dataTransfer.getData("text/plain"));
    if (Number.isInteger(source) && source >= 0 && source < photos.length && source !== target) {
      onSwap(source, target);
    }
  }

  return (
    <div
      className="overflow-hidden rounded-3xl border-[14px]"
      style={{ borderColor: color }}
    >
      <div
        className="grid gap-[3px] p-[3px]"
        style={{
          backgroundColor: color,
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          width,
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={index}
            className={onSwap ? "relative cursor-grab active:cursor-grabbing" : "relative"}
            draggable={Boolean(onSwap)}
            tabIndex={onSwap ? 0 : undefined}
            aria-label={onSwap ? `Drag shot ${index + 1} to swap its place` : undefined}
            onDragStart={(event) => {
              if (!onSwap) return;
              event.dataTransfer.setData("text/plain", String(index));
              event.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(event) => {
              if (onSwap) event.preventDefault();
            }}
            onDrop={(event) => handleDrop(event, index)}
            onKeyDown={(event) => {
              if (!onSwap) return;
              const offset = event.key === "ArrowUp" || event.key === "ArrowLeft"
                ? -1
                : event.key === "ArrowDown" || event.key === "ArrowRight"
                  ? 1
                  : 0;
              const target = index + offset;
              if (offset && target >= 0 && target < photos.length) {
                event.preventDefault();
                onSwap(index, target);
              }
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt={`Shot ${index + 1}`}
              className="aspect-[4/3] w-full object-cover"
              style={{
                filter,
                transform: mirrored ? "scaleX(-1)" : undefined,
              }}
              draggable={false}
            />
            {onRetake && (
              <button
                type="button"
                aria-label={`Retake shot ${index + 1}`}
                onClick={() => onRetake(index)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-cream bg-red text-cream shadow-md transition hover:scale-105"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M12 6a6 6 0 0 1 5.82 4.18h1.9A8 8 0 0 0 4.2 9.2l1.4 1.4A6 6 0 0 1 12 6Zm0 12a6 6 0 0 1-5.82-4.18H4.28A8 8 0 0 0 19.8 14.8l-1.4-1.4A6 6 0 0 1 12 18Zm-1.5-5.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Zm1.5-7a8 8 0 0 1 8 8h-2a6 6 0 0 0-6-6v-2Z" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      <div
        className="grid grid-cols-[1fr_auto] items-end px-4 py-3"
        style={{ backgroundColor: color }}
      >
        <div className="text-left">
          <p className="font-display text-base font-black text-red">photobooth</p>
          <p className="text-[11px] text-cream/70">by knurlpot</p>
        </div>
        <span className="text-[11px] text-cream/50">
          {new Date().toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
