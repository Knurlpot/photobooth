"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Wordmark from "./Wordmark";

export default function Camera({
  count,
  mode,
  timerSeconds,
  retakeIndex,
  initialPhotos = [],
  onComplete,
  onBack,
}: {
  count: number;
  mode: "camera" | "upload";
  timerSeconds: number;
  retakeIndex?: number | null;
  initialPhotos?: string[];
  onComplete: (photos: string[]) => void;
  onBack?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const flashTimeoutRef = useRef<number | null>(null);
  const completionTimeoutRef = useRef<number | null>(null);

  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(timerSeconds);
  const [flash, setFlash] = useState(false);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/png");
  }, []);

  // --- camera mode: webcam + countdown loop ---
  useEffect(() => {
    if (mode !== "camera") return;
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setReady(true);
      } catch {
        setCameraError("Couldn't access your camera. Try uploading instead.");
      }
    }

    startCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "camera" || !ready || cameraError) return;

    if ((retakeIndex === null || retakeIndex === undefined) && photos.length >= count) {
      completionTimeoutRef.current = window.setTimeout(() => onComplete(photos), 180);
      return () => {
        if (completionTimeoutRef.current !== null) {
          window.clearTimeout(completionTimeoutRef.current);
        }
      };
    }

    if (secondsLeft === 0) {
      const tick = window.setTimeout(() => {
        const shot = capture();
        if (!shot) {
          setSecondsLeft(timerSeconds);
          return;
        }

        setFlash(true);
        if (flashTimeoutRef.current !== null) {
          window.clearTimeout(flashTimeoutRef.current);
        }
        flashTimeoutRef.current = window.setTimeout(() => setFlash(false), 180);

        if (retakeIndex !== null && retakeIndex !== undefined) {
          completionTimeoutRef.current = window.setTimeout(() => onComplete([shot]), 220);
          return;
        }

        setPhotos((previous) => [...previous, shot]);
        setSecondsLeft(timerSeconds);
      }, 100);

      return () => window.clearTimeout(tick);
    }

    const tick = window.setTimeout(() => {
      setSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, ready, cameraError, photos.length, count, secondsLeft, timerSeconds, retakeIndex, onComplete]);

  useEffect(
    () => () => {
      if (flashTimeoutRef.current !== null) {
        window.clearTimeout(flashTimeoutRef.current);
      }
      if (completionTimeoutRef.current !== null) {
        window.clearTimeout(completionTimeoutRef.current);
      }
    },
    []
  );

  // --- upload mode ---
  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, count);
    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    ).then((dataUrls) => onComplete(dataUrls));
  }

  if (mode === "upload") {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-cream">
        <div className="absolute left-8 top-10">
          <Wordmark size="sm" onBack={onBack} />
        </div>
        <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-6 px-12 text-center">
          <h2 className="font-display text-3xl font-black text-red sm:text-4xl">
            upload {count} photos
          </h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-red px-10 py-6 text-xl font-bold"
          >
            choose files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-cream">
      <div className="absolute left-8 top-10">
        <Wordmark size="sm" onBack={onBack} />
      </div>

      <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-6 px-12 text-center">
        {!cameraError ? (
          <>
            <div className="flex items-center gap-10">
              <div className="flex flex-col items-center">
                <span className="font-display text-7xl font-black text-red sm:text-8xl">
                  {secondsLeft}
                </span>
                <span className="font-display text-xl font-black uppercase tracking-wide text-red sm:text-2xl">
                  {secondsLeft === 1 ? "second" : "seconds"}
                </span>
              </div>
              <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl bg-frame">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full scale-x-[-1] object-cover"
                />
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-100 ${
                    flash ? "opacity-90" : "opacity-0"
                  }`}
                />
                {!ready && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-cream/70">
                    Waking up the camera&hellip;
                  </div>
                )}
              </div>
              <span className="font-display text-3xl font-black leading-tight text-red">
                strike
                <br />
                your
                <br />
                pose!
              </span>
            </div>
            <p className="text-sm font-medium text-ink/70">
              shot {Math.min(photos.length + 1, count)} of {count}
            </p>
          </>
        ) : (
          <>
            <p className="max-w-sm text-ink/80">{cameraError}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-red px-8 py-4 text-lg font-bold"
            >
              upload instead
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
