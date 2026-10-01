from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import strip

app = FastAPI(title="Photobooth API", version="1.0.0")

# Loosen this to your real frontend origin(s) before deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(strip.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
