import { FilterId, LayoutId, StripColor } from "./filters";
import { Adjustments } from "@/components/ReviewShots";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

/**
 * Sends the captured photos (as data URLs), the chosen filter, strip
 * layout, and pre-filter adjustments (invert/brightness/contrast) to
 * the FastAPI backend, which applies them all with Pillow at full
 * resolution and composites the final strip. Returns an object URL
 * for the result. When mirrorPhotos is true, each photo is mirrored
 * individually before upload. stripColor sets the frame color.
 */
export async function buildStrip(
  photoDataUrls: string[],
  filter: FilterId,
  layout: LayoutId,
  adjustments: Adjustments,
  format: "png" | "jpg" = "png",
  mirrorPhotos = false,
  stripColor: StripColor = "black"
): Promise<string> {
  const form = new FormData();

  for (let i = 0; i < photoDataUrls.length; i++) {
    const blob = mirrorPhotos
      ? await mirrorPhoto(photoDataUrls[i])
      : await (await fetch(photoDataUrls[i])).blob();
    form.append("photos", blob, `photo-${i}.png`);
  }
  form.append("filter_name", filter);
  form.append("layout", layout);
  form.append("invert", String(adjustments.invert));
  form.append("brightness", String(adjustments.brightness));
  form.append("contrast", String(adjustments.contrast));
  form.append("format", format);
  form.append("brand", "PHOTOBOOTH");
  form.append("strip_color", stripColor);

  const res = await fetch(`${API_BASE}/api/strip`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`Strip generation failed: ${message}`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

async function mirrorPhoto(dataUrl: string): Promise<Blob> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Unable to load photo for mirroring."));
    image.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to mirror photo: canvas is unavailable.");
  }

  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  context.drawImage(image, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Unable to mirror photo."));
      },
      "image/png"
    );
  });
}
