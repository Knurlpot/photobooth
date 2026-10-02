"""
Image processing for the photobooth: pre-filter adjustments, named
filters, and strip/grid compositing.

Filter presets here are written to visually match the CSS filter
presets used for the live client-side preview in the frontend
(see frontend/lib/filters.ts), so what the user picks is close to
what they get in the final downloaded strip. Same for the
invert/brightness/contrast adjustments made on the review screen
(frontend/components/ReviewShots.tsx) -- applied here in the same
order (invert -> brightness -> contrast) before the named filter.
"""

from __future__ import annotations

from datetime import datetime
from io import BytesIO
from typing import Callable, Literal

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

# ---------------------------------------------------------------------------
# Pre-filter adjustments (invert / brightness / contrast from the review step)
# ---------------------------------------------------------------------------


def apply_adjustments(img: Image.Image, invert: bool, brightness: float, contrast: float) -> Image.Image:
    out = img.convert("RGB")
    if invert:
        out = ImageOps.invert(out)
    if brightness != 1.0:
        out = ImageEnhance.Brightness(out).enhance(max(0.1, brightness))
    if contrast != 1.0:
        out = ImageEnhance.Contrast(out).enhance(max(0.1, contrast))
    return out


# ---------------------------------------------------------------------------
# Named filters
# ---------------------------------------------------------------------------


def _identity(img: Image.Image) -> Image.Image:
    return img


def _noir(img: Image.Image) -> Image.Image:
    gray = ImageOps.grayscale(img)
    gray = ImageEnhance.Contrast(gray).enhance(1.35)
    gray = ImageEnhance.Brightness(gray).enhance(1.03)
    return gray.convert("RGB")


def _sepia(img: Image.Image) -> Image.Image:
    gray = ImageOps.grayscale(img)
    sepia = ImageOps.colorize(gray, black="#3a2410", white="#f4e3c1", mid="#8a6a45")
    return sepia.convert("RGB")


def _vivid(img: Image.Image) -> Image.Image:
    out = ImageEnhance.Color(img).enhance(1.55)
    out = ImageEnhance.Contrast(out).enhance(1.15)
    out = ImageEnhance.Brightness(out).enhance(1.02)
    return out


def _cool(img: Image.Image) -> Image.Image:
    r, g, b = img.convert("RGB").split()
    b = b.point(lambda v: min(255, int(v * 1.18)))
    r = r.point(lambda v: max(0, int(v * 0.92)))
    return Image.merge("RGB", (r, g, b))


def _warm(img: Image.Image) -> Image.Image:
    r, g, b = img.convert("RGB").split()
    r = r.point(lambda v: min(255, int(v * 1.16)))
    g = g.point(lambda v: min(255, int(v * 1.04)))
    b = b.point(lambda v: max(0, int(v * 0.85)))
    return Image.merge("RGB", (r, g, b))


def _fade(img: Image.Image) -> Image.Image:
    out = ImageEnhance.Color(img).enhance(0.7)
    out = ImageEnhance.Contrast(out).enhance(0.82)
    out = ImageEnhance.Brightness(out).enhance(1.12)
    overlay = Image.new("RGB", out.size, (255, 250, 235))
    return Image.blend(out, overlay, 0.12)


def _mono_soft(img: Image.Image) -> Image.Image:
    out = img.filter(ImageFilter.GaussianBlur(0.6))
    out = ImageEnhance.Sharpness(out).enhance(1.2)
    out = ImageEnhance.Brightness(out).enhance(1.06)
    return out


FILTERS: dict[str, Callable[[Image.Image], Image.Image]] = {
    "original": _identity,
    "noir": _noir,
    "sepia": _sepia,
    "vivid": _vivid,
    "cool": _cool,
    "warm": _warm,
    "fade": _fade,
    "soft": _mono_soft,
}


def apply_filter(img: Image.Image, name: str) -> Image.Image:
    fn = FILTERS.get(name, _identity)
    return fn(img.convert("RGB"))


# ---------------------------------------------------------------------------
# Strip / grid compositing — cream + red brand, dark frame background
# ---------------------------------------------------------------------------

Layout = Literal["strip", "grid"]

FRAME_W = 900             # width of each photo cell, before gaps
OUTER_BORDER = 60         # thick frame around the photo area
GAP = 12                  # separator between photos
FOOTER_H = 180            # bottom footer band (brand + timestamp)
STRIP_COLORS = {
    "black": (0, 0, 0),
    "white": (255, 255, 255),
    "red": (229, 52, 42),
    "orange": (242, 140, 40),
    "yellow": (244, 208, 63),
    "blue": (40, 120, 208),
    "violet": (123, 63, 178),
    "pink": (232, 106, 154),
}
RED = (229, 52, 42)       # #E5342A — brand red
CREAM = (252, 239, 203)   # #FCEFCB — brand cream


def _load_font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    candidates = (
        [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        ]
        if bold
        else [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/System/Library/Fonts/Supplemental/Arial.ttf",
        ]
    )
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def compose_strip(
    photos: list[Image.Image],
    filter_name: str,
    layout: Layout = "strip",
    invert: bool = False,
    brightness: float = 1.0,
    contrast: float = 1.0,
    brand: str = "PHOTOBOOTH",
    strip_color: str = "black",
) -> Image.Image:
    """Apply adjustments + the chosen filter to each photo, then lay
    them out as either a single-column strip or a 2-column grid, on a
    dark frame background with a cream/red footer.
    """
    if not photos:
        raise ValueError("At least one photo is required")

    columns = 2 if layout == "grid" else 1

    processed: list[Image.Image] = []
    for p in photos:
        adjusted = apply_adjustments(p, invert, brightness, contrast)
        filtered = apply_filter(adjusted, filter_name)

        target_ratio = 4 / 3
        w, h = filtered.size
        current_ratio = w / h
        if current_ratio > target_ratio:
            new_w = int(h * target_ratio)
            x0 = (w - new_w) // 2
            filtered = filtered.crop((x0, 0, x0 + new_w, h))
        else:
            new_h = int(w / target_ratio)
            y0 = (h - new_h) // 2
            filtered = filtered.crop((0, y0, w, y0 + new_h))

        cell_w = FRAME_W if columns == 1 else (FRAME_W - GAP) // 2
        filtered = filtered.resize((cell_w, int(cell_w * 3 / 4)), Image.LANCZOS)
        processed.append(filtered)

    cell_w = processed[0].width
    cell_h = processed[0].height
    n = len(processed)
    rows = (n + columns - 1) // columns

    strip_w = columns * cell_w + 2 * OUTER_BORDER + (columns - 1) * GAP
    strip_h = OUTER_BORDER + rows * cell_h + rows * GAP + FOOTER_H

    canvas = Image.new("RGB", (strip_w, strip_h), STRIP_COLORS[strip_color])

    for i, img in enumerate(processed):
        row, col = divmod(i, columns)
        x = OUTER_BORDER + col * (cell_w + GAP)
        y = OUTER_BORDER + row * (cell_h + GAP)
        canvas.paste(img, (x, y))

    draw = ImageDraw.Draw(canvas)
    footer_top = strip_h - FOOTER_H

    brand_font = _load_font(48)
    sub_font = _load_font(28, bold=False)
    ts = datetime.now().strftime("%b %d, %Y")

    draw.text((OUTER_BORDER + 8, footer_top + 24), brand.lower(), font=brand_font, fill=RED)
    draw.text((OUTER_BORDER + 8, footer_top + 112), "by knurlpot", font=sub_font, fill=CREAM)

    date_w = draw.textlength(ts, font=sub_font)
    draw.text((strip_w - OUTER_BORDER - 8 - date_w, footer_top + 112), ts, font=sub_font, fill=CREAM)

    return canvas


def image_to_bytes(img: Image.Image, fmt: str = "png", quality: int = 92) -> bytes:
    fmt = fmt.lower()
    if fmt in ("jpg", "jpeg"):
        pil_fmt = "JPEG"
        img = img.convert("RGB")
    else:
        pil_fmt = "PNG"

    buf = BytesIO()
    save_kwargs = {"quality": quality} if pil_fmt == "JPEG" else {}
    img.save(buf, format=pil_fmt, **save_kwargs)
    return buf.getvalue()
