"""
Upload all frontend static assets to Cloudinary.
Run from the /backend folder:
    python scripts/upload_assets_to_cloudinary.py

This will:
1. Upload every image from ../src/assets/ to Cloudinary
2. Print a mapping of old filename → new Cloudinary URL
3. You can then paste those URLs into veloura-data.ts
"""

import os
import sys

# ── Load env ──────────────────────────────────────────────────────────────────
from pathlib import Path
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip())

import cloudinary
import cloudinary.uploader

CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME", "")
API_KEY    = os.environ.get("CLOUDINARY_API_KEY", "")
API_SECRET = os.environ.get("CLOUDINARY_API_SECRET", "")
FOLDER     = os.environ.get("CLOUDINARY_FOLDER", "veloura")

if not CLOUD_NAME or CLOUD_NAME == "your-cloud-name-here":
    print("❌  CLOUDINARY_CLOUD_NAME not set in .env")
    sys.exit(1)

cloudinary.config(cloud_name=CLOUD_NAME, api_key=API_KEY, api_secret=API_SECRET)

ASSETS_DIR = Path(__file__).parent.parent.parent / "src" / "assets"
ALLOWED    = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}

print(f"[SCAN] Scanning: {ASSETS_DIR}\n")
results = {}

for f in sorted(ASSETS_DIR.iterdir()):
    if f.suffix.lower() not in ALLOWED:
        continue
    public_id = f"{FOLDER}/assets/{f.stem}"
    print(f"[UP] Uploading {f.name} ...", end=" ", flush=True)
    try:
        res = cloudinary.uploader.upload(
            str(f),
            public_id=public_id,
            overwrite=True,
            fetch_format="auto",
            quality="auto:good",
        )
        url = res["secure_url"]
        results[f.name] = url
        print(f"OK  {url}")
    except Exception as e:
        print(f"FAIL  {e}")

print("\n" + "="*70)
print("DONE! Copy these URLs into src/lib/veloura-data.ts:\n")
for name, url in results.items():
    stem = name.rsplit(".", 1)[0]
    print(f'  // {name}')
    print(f'  "{url}",\n')
