"""
Migrate existing local uploads/ images to Cloudinary.

Usage (from backend/ with venv active):
    python -m scripts.migrate_uploads_to_cloudinary

What it does:
  1. Uploads every file in uploads/ to Cloudinary under veloura/uploads/
  2. Returns a mapping of old local URL → new Cloudinary URL
  3. Updates every image_url / images column in the DB that references the old URL
  4. Prints a summary

Requires CLOUDINARY_* vars set in .env
"""
import os
import sys
import io
import json

# Make sure we can import from app/
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import cloudinary
import cloudinary.uploader
from sqlalchemy import text
from app.core.config import settings
from app.core.database import SessionLocal

if not settings.cloudinary_configured:
    print("ERROR: Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, "
          "CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in backend/.env")
    sys.exit(1)

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

UPLOAD_DIR = settings.UPLOAD_DIR
BASE_URL = settings.PUBLIC_BASE_URL.rstrip("/")
FOLDER = f"{settings.CLOUDINARY_FOLDER}/uploads"

ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}

# Tables/columns that may store image URLs
IMAGE_COLUMNS = [
    ("products",      "image_url"),
    ("products",      "images"),        # JSON array
    ("hero_slides",   "image_url"),
    ("deals",         "image_url"),
    ("collections",   "image_url"),
    ("categories",    "image_url"),
    ("blog_posts",    "image_url"),
    ("popups",        "image_url"),
    ("trust_sections","icon"),
]


def upload_file(path: str, filename: str) -> str:
    """Upload a single file to Cloudinary and return its secure_url."""
    public_id = f"{FOLDER}/{os.path.splitext(filename)[0]}"
    with open(path, "rb") as f:
        data = f.read()
    result = cloudinary.uploader.upload(
        io.BytesIO(data),
        public_id=public_id,
        resource_type="image",
        overwrite=False,
        fetch_format="auto",
        quality="auto:good",
    )
    return result["secure_url"]


def main():
    if not os.path.isdir(UPLOAD_DIR):
        print(f"uploads/ dir not found at {UPLOAD_DIR} — nothing to migrate.")
        return

    files = [
        f for f in os.listdir(UPLOAD_DIR)
        if os.path.isfile(os.path.join(UPLOAD_DIR, f))
        and os.path.splitext(f)[1].lower() in ALLOWED_EXT
    ]

    if not files:
        print("No image files found in uploads/ — nothing to migrate.")
        return

    print(f"Found {len(files)} images to migrate...\n")

    url_map: dict[str, str] = {}  # old_url → new_cloudinary_url
    failed: list[str] = []

    for i, filename in enumerate(files, 1):
        old_url = f"{BASE_URL}/uploads/{filename}"
        local_path = os.path.join(UPLOAD_DIR, filename)
        try:
            new_url = upload_file(local_path, filename)
            url_map[old_url] = new_url
            print(f"[{i}/{len(files)}] ✓ {filename}")
            print(f"         → {new_url}")
        except Exception as e:
            print(f"[{i}/{len(files)}] ✗ {filename} — {e}")
            failed.append(filename)

    print(f"\nUploaded {len(url_map)} / {len(files)} files.")
    if failed:
        print(f"Failed: {', '.join(failed)}")

    if not url_map:
        print("Nothing to update in DB.")
        return

    # Save mapping for reference
    mapping_path = os.path.join(os.path.dirname(__file__), "..", "data_export", "cloudinary_url_map.json")
    with open(mapping_path, "w") as f:
        json.dump(url_map, f, indent=2)
    print(f"\nURL mapping saved to data_export/cloudinary_url_map.json")

    # Update DB
    db = SessionLocal()
    try:
        updated_rows = 0
        for table, col in IMAGE_COLUMNS:
            try:
                # Check if table/col exist
                rows = db.execute(
                    text(f"SELECT id, {col} FROM {table} WHERE {col} IS NOT NULL")
                ).fetchall()
            except Exception:
                continue  # table or column doesn't exist yet

            for row in rows:
                row_id, val = row[0], row[1]
                if not val:
                    continue

                new_val = val
                # Handle JSON array columns (e.g. products.images)
                if val.startswith("["):
                    try:
                        arr = json.loads(val)
                        new_arr = [url_map.get(u, u) for u in arr]
                        if new_arr != arr:
                            new_val = json.dumps(new_arr)
                    except json.JSONDecodeError:
                        pass
                else:
                    new_val = url_map.get(val, val)

                if new_val != val:
                    db.execute(
                        text(f"UPDATE {table} SET {col} = :v WHERE id = :id"),
                        {"v": new_val, "id": row_id},
                    )
                    updated_rows += 1

        db.commit()
        print(f"Updated {updated_rows} DB rows with new Cloudinary URLs.")
    finally:
        db.close()

    print("\n✅ Migration complete!")
    print("You can now delete the uploads/ directory if everything looks good.")


if __name__ == "__main__":
    main()
