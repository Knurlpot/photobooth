# Photobooth

A photobooth web app: pick a strip length (3/4/6/8), take your shots from the
webcam (or upload), choose a filter *after* capturing, and download the
finished strip as PNG, JPG, or JPEG.

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind — handles
  webcam capture and shows an instant CSS-filter preview.
- **Backend:** FastAPI + Pillow — applies the matching filter to the
  full-resolution photos and composites the final strip (this is what
  actually gets downloaded).

## How it works

1. **Count** — choose 3, 4, 6, or 8 photos.
2. **Mode** — take photos with the webcam, or upload files instead.
3. **Timer** *(camera mode only)* — 3s / 5s / 10s countdown per shot.
4. **Capture** — each shot auto-fires after the countdown ("strike your
   pose!"), or all files are picked at once in upload mode.
5. **Review** — adjust invert / brightness / contrast across all shots
   (live CSS preview) before moving on.
6. **Modify strip** — pick a filter (8 swatches) and a layout (single-column
   strip or 2-column grid); the preview updates instantly with CSS.
7. **Develop** — photos + adjustments + filter + layout are sent to
   FastAPI, which re-applies everything with Pillow at full quality and
   composites the final strip (dark frame, cream/red footer, timestamp).
8. **Download** — grab the result as PNG, JPG, or JPEG. JPG/JPEG are
   re-encoded client-side from the PNG the backend returns, so there's no
   extra server call.

Filter presets are defined in two places that are meant to be kept in sync:
`frontend/lib/filters.ts` (CSS, for the live preview) and
`backend/services/image_processing.py` (Pillow, for the real output). Same
for the cream (`#FCEFCB`) / red (`#E5342A`) / dark frame (`#211C22`) brand
colors, which live in `frontend/tailwind.config.ts` on the frontend and as
constants in `image_processing.py` on the backend.

## Running it locally

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be at `http://localhost:8000`. Health check: `GET /api/health`.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # points the app at the backend above
npm run dev
```

Open `http://localhost:3000`.

> Building requires network access to `fonts.googleapis.com` (the app uses
> `next/font/google` for Poppins). If you're building in a fully offline
> environment, swap that for local font files or a system font in
> `app/layout.tsx`.

## Notes for production

- Set `NEXT_PUBLIC_API_BASE` to your deployed API URL.
- Update `allow_origins` in `backend/main.py` to your real frontend origin
  (it's locked to `localhost:3000` by default).
- `MAX_PHOTO_BYTES` and `ALLOWED_COUNTS` in `backend/routers/strip.py` are
  easy spots to adjust limits.
