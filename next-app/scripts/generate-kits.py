#!/usr/bin/env python3
"""
Pre-generate category zip kits and upload to R2.
Each kit is stored at: r2.dev/kits/{category}.zip
The download-kit API route then just redirects to this URL.
"""

import json
import zipfile
import io
import os
import sys
import time
import concurrent.futures
from collections import defaultdict
import urllib.request
import urllib.parse
import boto3
from botocore.config import Config

# ── Config ───────────────────────────────────────────────────────────────────

R2_ENDPOINT = os.environ.get("R2_ENDPOINT", "https://68826d73a0ff6068b5a37bb3ded7e980.r2.cloudflarestorage.com")
R2_ACCESS_KEY = os.environ.get("R2_ACCESS_KEY_ID", "1741fb752e070db3b0998cc3c9ec9752")
R2_SECRET_KEY = os.environ.get("R2_SECRET_ACCESS_KEY", "07413584a4b096e80c94f01ccba7ce30df603733025b6502c3a8750d4402132e")
R2_BUCKET = os.environ.get("R2_BUCKET_NAME", "turboloop-assets")
R2_PUBLIC_URL = os.environ.get("R2_PUBLIC_URL", "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev")

MANIFEST_PATH = "/home/ubuntu/turboloop-repo/next-app/lib/campaigns-manifest.json"
KITS_PREFIX = "kits"  # R2 key prefix: kits/{category}.zip

# ── S3 client ────────────────────────────────────────────────────────────────

s3 = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    config=Config(signature_version="s3v4"),
    region_name="auto",
)

# ── Helpers ───────────────────────────────────────────────────────────────────

def fetch_image(url: str) -> bytes | None:
    """Fetch an image from R2, return bytes or None on failure."""
    try:
        # Encode non-ASCII characters in the URL path
        parsed = urllib.parse.urlparse(url)
        encoded_path = urllib.parse.quote(parsed.path, safe='/')
        safe_url = urllib.parse.urlunparse(parsed._replace(path=encoded_path))
        req = urllib.request.Request(safe_url, headers={"User-Agent": "TurboLoop-KitGen/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read()
    except Exception as e:
        print(f"  ⚠ Failed to fetch {url}: {e}", flush=True)
        return None

def build_zip(category: str, items: list[dict]) -> bytes:
    """Build an in-memory zip file for a category."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_STORED) as zf:
        # README
        readme = "\n".join([
            f"TurboLoop — {category.replace('-', ' ').title()} Marketing Kit",
            f"Generated: {time.strftime('%Y-%m-%d')}",
            f"Total banners: {len(items)}",
            "",
            "Free to share on Telegram, WhatsApp, Twitter/X, and any social platform.",
            "No attribution required.",
            "",
            f"More banners: turboloop.tech/creatives/{category}",
            "turboloop.tech",
        ])
        zf.writestr("README.txt", readme)

        # Fetch all images in parallel
        print(f"  Fetching {len(items)} images...", flush=True)
        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
            futures = {
                executor.submit(fetch_image, item["url"]): (i, item)
                for i, item in enumerate(items)
            }
            results = {}
            for future in concurrent.futures.as_completed(futures):
                idx, item = futures[future]
                data = future.result()
                results[idx] = (item, data)

        # Add to zip in order
        success = 0
        for idx in sorted(results.keys()):
            item, data = results[idx]
            if data is None:
                continue
            fname = item["filename"].replace(" ", "_")
            key = f"{str(idx + 1).zfill(4)}_{fname}"
            zf.writestr(key, data)
            success += 1

        print(f"  ✓ {success}/{len(items)} images added to zip", flush=True)

    return buf.getvalue()

def upload_to_r2(category: str, zip_bytes: bytes) -> str:
    """Upload zip to R2 and return the public URL."""
    key = f"{KITS_PREFIX}/{category}.zip"
    s3.put_object(
        Bucket=R2_BUCKET,
        Key=key,
        Body=zip_bytes,
        ContentType="application/zip",
        ContentDisposition=f'attachment; filename="turboloop-{category}-kit.zip"',
        CacheControl="public, max-age=86400",  # 24h cache
    )
    url = f"{R2_PUBLIC_URL}/{key}"
    return url

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    with open(MANIFEST_PATH) as f:
        manifest = json.load(f)

    # Group by category
    by_cat: dict[str, list[dict]] = defaultdict(list)
    for item in manifest:
        by_cat[item["category"]].append(item)

    # Filter to specific categories if passed as args
    target_cats = sys.argv[1:] if len(sys.argv) > 1 else list(by_cat.keys())

    print(f"Generating {len(target_cats)} category kits...\n", flush=True)

    for cat in target_cats:
        items = by_cat.get(cat, [])
        if not items:
            print(f"[{cat}] No items found, skipping", flush=True)
            continue

        print(f"[{cat}] {len(items)} images", flush=True)
        t0 = time.time()

        zip_bytes = build_zip(cat, items)
        zip_mb = len(zip_bytes) / 1024 / 1024

        print(f"  Uploading {zip_mb:.1f}MB zip to R2...", flush=True)
        url = upload_to_r2(cat, zip_bytes)

        elapsed = time.time() - t0
        print(f"  ✅ Done in {elapsed:.1f}s → {url}\n", flush=True)

    print("All kits generated!", flush=True)

if __name__ == "__main__":
    main()
