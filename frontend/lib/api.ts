import { FilterId, LayoutId } from "./filters";
import { Adjustments } from "@/components/ReviewShots";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

/**
 * Sends the captured photos (as data URLs), the chosen filter, strip
 * layout, and pre-filter adjustments (invert/brightness/contrast) to
 * the FastAPI backend, which applies them all with Pillow at full
 * resolution and composites the final strip. Returns an object URL
 * for the result.
 */
export async function buildStrip(
  photoDataUrls: string[],
  filter: FilterId,
  layout: LayoutId,
  adjustments: Adjustments,
  format: "png" | "jpg" = "png"
): Promise<string> {
  const form = new FormData();

  for (let i = 0; i < photoDataUrls.length; i++) {
    const blob = await (await fetch(photoDataUrls[i])).blob();
    form.append("photos", blob, `photo-${i}.png`);
  }
  form.append("filter_name", filter);
  form.append("layout", layout);
  form.append("invert", String(adjustments.invert));
  form.append("brightness", String(adjustments.brightness));
  form.append("contrast", String(adjustments.contrast));
  form.append("format", format);
  form.append("brand", "PHOTOBOOTH");

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
