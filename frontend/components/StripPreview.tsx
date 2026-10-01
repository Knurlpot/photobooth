"use client";

import { useRef } from "react";
import Wordmark from "./Wordmark";

const FORMATS = [
  { ext: "png", label: "PNG", mime: "image/png" },
  { ext: "jpg", label: "JPG", mime: "image/jpeg" },
] as const;

export default function StripPreview({
  resultUrl,
  onRestart,
}: {
  resultUrl: string;
  onRestart: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function download(ext: (typeof FORMATS)[number]["ext"], mime: string) {
    if (ext === "png") {
      const a = document.createElement("a");
      a.href = resultUrl;
      a.download = "photobooth-strip.png";
      a.click();
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current ?? document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `photobooth-strip.${ext}`;
          a.click();
          URL.revokeObjectURL(url);
        },
        mime,
        0.95
      );
    };
    img.src = resultUrl;
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream px-8 py-10">
      <Wordmark size="sm" />

      <div className="flex flex-1 items-center justify-center gap-16">
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resultUrl}
            alt="Your photobooth strip"
            className="max-h-[65vh] rounded-2xl"
          />
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex flex-wrap justify-center gap-3">
            {FORMATS.map((f) => (
              <button
                key={f.ext}
                onClick={() => download(f.ext, f.mime)}
                className="btn-red px-6 py-2.5 text-sm font-bold"
              >
                download {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={onRestart}
            className="font-display text-lg font-black text-red underline decoration-dotted underline-offset-4"
          >
            take another
          </button>
        </div>

        <h2 className="font-display text-5xl font-black leading-[0.95] text-red sm:text-6xl">
          strip
          <br />
          is
          <br />
          ready
        </h2>
      </div>
    </div>
  );
}
