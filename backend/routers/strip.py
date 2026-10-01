from __future__ import annotations

from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from PIL import Image

from services.image_processing import FILTERS, compose_strip, image_to_bytes

router = APIRouter(prefix="/api", tags=["strip"])

ALLOWED_COUNTS = {3, 4, 6, 8}
ALLOWED_LAYOUTS = {"strip", "grid"}
MAX_PHOTO_BYTES = 12 * 1024 * 1024  # 12MB per photo, generous for webcam/upload frames


@router.get("/filters")
def list_filters() -> dict:
    return {"filters": list(FILTERS.keys()), "layouts": sorted(ALLOWED_LAYOUTS)}


def _parse_bool(value: str) -> bool:
    return value.strip().lower() in ("1", "true", "yes", "on")


@router.post("/strip")
async def build_strip(
    photos: list[UploadFile] = File(...),
    filter_name: str = Form("original"),
    layout: str = Form("strip"),
    invert: str = Form("false"),
    brightness: float = Form(1.0),
    contrast: float = Form(1.0),
    format: str = Form("png"),
    brand: str = Form("PHOTOBOOTH"),
):
    if len(photos) not in ALLOWED_COUNTS:
        raise HTTPException(400, f"Strip must contain one of {sorted(ALLOWED_COUNTS)} photos, got {len(photos)}")

    if filter_name not in FILTERS:
        raise HTTPException(400, f"Unknown filter '{filter_name}'. Options: {list(FILTERS.keys())}")

    if layout not in ALLOWED_LAYOUTS:
        raise HTTPException(400, f"Unknown layout '{layout}'. Options: {sorted(ALLOWED_LAYOUTS)}")

    if format.lower() not in ("png", "jpg", "jpeg"):
        raise HTTPException(400, "format must be png, jpg, or jpeg")

    if not (0.1 <= brightness <= 3.0) or not (0.1 <= contrast <= 3.0):
        raise HTTPException(400, "brightness/contrast must be between 0.1 and 3.0")

    images: list[Image.Image] = []
    for photo in photos:
        raw = await photo.read()
        if len(raw) > MAX_PHOTO_BYTES:
            raise HTTPException(400, f"{photo.filename} is too large")
        try:
            img = Image.open(BytesIO(raw))
            img.load()
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(400, f"Could not read image '{photo.filename}': {exc}") from exc
        images.append(img)

    strip = compose_strip(
        images,
        filter_name,
        layout=layout,  # type: ignore[arg-type]
        invert=_parse_bool(invert),
        brightness=brightness,
        contrast=contrast,
        brand=brand or "PHOTOBOOTH",
    )
    out_bytes = image_to_bytes(strip, fmt=format)

    media_type = "image/png" if format.lower() == "png" else "image/jpeg"
    ext = "png" if format.lower() == "png" else "jpg"

    return Response(
        content=out_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f'inline; filename="photobooth-strip.{ext}"'},
    )
