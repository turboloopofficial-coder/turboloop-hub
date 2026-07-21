#!/usr/bin/env python3
"""
TurboLoop Automated Dubbing Pipeline
=====================================
Runs on a schedule (every 30 min via GitHub Actions).
For each episode, polls Rask for completed dubs (merging_done),
downloads them, uploads to R2, and updates VideoExplainerSection.tsx.

Usage:
  python3 dubbing_pipeline.py [--dry-run]

Environment variables required:
  RASK_CLIENT_ID, RASK_CLIENT_SECRET
  R2_ACCESS_KEY, R2_SECRET_KEY, R2_ENDPOINT
"""

import os
import re
import sys
import json
import time
import hashlib
import logging
import requests
import tempfile
import subprocess
from pathlib import Path

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
log = logging.getLogger(__name__)

# ─── Constants ────────────────────────────────────────────────────────────────
DRY_RUN = "--dry-run" in sys.argv

RASK_CLIENT_ID     = os.environ["RASK_CLIENT_ID"]
RASK_CLIENT_SECRET = os.environ["RASK_CLIENT_SECRET"]
RASK_TOKEN_URL     = "https://rask-prod.auth.us-east-2.amazoncognito.com/oauth2/token"
RASK_API           = "https://api.rask.ai"

R2_ACCESS_KEY  = os.environ["R2_ACCESS_KEY"]
R2_SECRET_KEY  = os.environ["R2_SECRET_KEY"]
R2_ENDPOINT    = os.environ["R2_ENDPOINT"]
R2_BUCKET      = "turboloop-assets"
R2_PUBLIC_BASE = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev"

# Path to the TSX file (relative to repo root, where this script runs from)
TSX_PATH = Path("next-app/components/sections/VideoExplainerSection.tsx")

# ─── Episode Configuration ────────────────────────────────────────────────────
# Each episode has:
#   - projects_file: JSON file with {projects: {lang_code: {project_id: ...}}}
#   - r2_prefix: R2 key prefix for the video files
#   - tsx_field: the field name in the LANGUAGES array to update
#   - needs_speedup: whether to apply 1.41x speed-up after download
EPISODES = {
    "ep2": {
        "projects_file": ".github/scripts/ep2_rask_projects.json",
        "r2_key_pattern": "videos/turboloop-ep2-{lang}.mp4",
        "tsx_field": "ep2video",
        "tsx_pattern": r'(code: "{lang}"[^\n]*ep2video: )null',
        "tsx_replacement": r'\g<1>`${{R2_BASE}}/turboloop-ep2-{lang}.mp4`',
        "needs_speedup": False,  # Source was already sped up before Rask submission
    },
    # ep1 can be added here if needed in the future
}

# ─── Rask API ─────────────────────────────────────────────────────────────────
def get_rask_token() -> str:
    log.info("Getting Rask API token...")
    resp = requests.post(
        RASK_TOKEN_URL,
        auth=(RASK_CLIENT_ID, RASK_CLIENT_SECRET),
        data={"grant_type": "client_credentials",
              "scope": "api/source api/input api/output api/limit"},
        timeout=60
    )
    resp.raise_for_status()
    token = resp.json()["access_token"]
    log.info("Rask token obtained.")
    return token


def get_project_status(token: str, project_id: str) -> dict:
    """Get project status and download URL from Rask."""
    resp = requests.get(
        f"{RASK_API}/v2/projects/{project_id}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=30
    )
    resp.raise_for_status()
    return resp.json()


# ─── R2 Storage ───────────────────────────────────────────────────────────────
def get_r2_client():
    import boto3
    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        region_name="auto"
    )


def r2_file_exists(s3, key: str) -> bool:
    """Check if a file already exists in R2."""
    try:
        s3.head_object(Bucket=R2_BUCKET, Key=key)
        return True
    except Exception:
        return False


def upload_to_r2(s3, local_path: Path, r2_key: str) -> str:
    """Upload a file to R2 and return its public URL."""
    log.info(f"Uploading {local_path.name} ({local_path.stat().st_size // 1024 // 1024} MB) to R2: {r2_key}")
    if DRY_RUN:
        log.info("[DRY RUN] Skipping upload")
        return f"{R2_PUBLIC_BASE}/{r2_key}"
    
    s3.upload_file(
        str(local_path),
        R2_BUCKET,
        r2_key,
        ExtraArgs={"ContentType": "video/mp4", "ACL": "public-read"}
    )
    url = f"{R2_PUBLIC_BASE}/{r2_key}"
    log.info(f"Uploaded: {url}")
    return url


# ─── Download ─────────────────────────────────────────────────────────────────
def download_video(url: str, dest_path: Path, token: str = None) -> bool:
    """Download a video with streaming and resume support."""
    existing_size = dest_path.stat().st_size if dest_path.exists() else 0
    
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if existing_size > 0:
        headers["Range"] = f"bytes={existing_size}-"
        log.info(f"Resuming download from byte {existing_size:,}")
    
    log.info(f"Downloading to {dest_path.name}...")
    
    try:
        resp = requests.get(url, headers=headers, stream=True, timeout=600)
        
        if resp.status_code == 416:
            # Range not satisfiable — file already complete
            log.info("File already fully downloaded (416 Range Not Satisfiable)")
            return True
        
        resp.raise_for_status()
        
        total_size = int(resp.headers.get("content-length", 0))
        if existing_size > 0 and resp.status_code == 206:
            total_size += existing_size
        
        mode = "ab" if existing_size > 0 and resp.status_code == 206 else "wb"
        downloaded = existing_size
        
        with open(dest_path, mode) as f:
            for chunk in resp.iter_content(chunk_size=1024 * 1024):  # 1 MB chunks
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0 and downloaded % (50 * 1024 * 1024) < 1024 * 1024:
                        pct = downloaded / total_size * 100
                        log.info(f"  Progress: {downloaded // 1024 // 1024} MB / {total_size // 1024 // 1024} MB ({pct:.1f}%)")
        
        final_size = dest_path.stat().st_size
        log.info(f"Download complete: {final_size // 1024 // 1024} MB")
        return True
        
    except Exception as e:
        log.error(f"Download failed: {e}")
        return False


# ─── TSX Update ───────────────────────────────────────────────────────────────
def update_tsx_ep2video(lang_code: str, r2_url: str) -> bool:
    """Update the ep2video field for a language in VideoExplainerSection.tsx."""
    if not TSX_PATH.exists():
        log.error(f"TSX file not found: {TSX_PATH}")
        return False
    
    content = TSX_PATH.read_text(encoding="utf-8")
    
    # Pattern: find the line with this language code and replace ep2video: null
    # The line looks like: { code: "fr", ..., ep2video: null, ...
    # We need to replace ep2video: null with ep2video: `${R2_BASE}/videos/turboloop-ep2-fr.mp4`
    
    # Use the R2_BASE constant reference (as it appears in TSX)
    # Note: R2_BASE already includes /videos in the TSX definition
    tsx_url = f"`${{R2_BASE}}/turboloop-ep2-{lang_code}.mp4`"
    
    # Pattern to match the specific language line's ep2video field
    # Matches: code: "fr"...ep2video: null
    pattern = rf'(code:\s*"{re.escape(lang_code)}"[^\n]*ep2video:\s*)null'
    
    if not re.search(pattern, content):
        # Check if already set
        already_set = re.search(
            rf'code:\s*"{re.escape(lang_code)}"[^\n]*ep2video:\s*`[^`]+`',
            content
        )
        if already_set:
            log.info(f"[{lang_code}] ep2video already set in TSX — skipping")
            return False  # No change needed
        log.warning(f"[{lang_code}] Pattern not found in TSX — cannot update ep2video")
        return False
    
    new_content = re.sub(pattern, rf'\g<1>{tsx_url}', content)
    
    if new_content == content:
        log.info(f"[{lang_code}] No change in TSX")
        return False
    
    if DRY_RUN:
        log.info(f"[DRY RUN] Would update ep2video for {lang_code} in TSX")
        return True
    
    TSX_PATH.write_text(new_content, encoding="utf-8")
    log.info(f"[{lang_code}] Updated ep2video in TSX ✅")
    return True


# ─── Main Pipeline ────────────────────────────────────────────────────────────
def run_pipeline():
    log.info("=" * 60)
    log.info("TurboLoop Dubbing Pipeline — Starting")
    if DRY_RUN:
        log.info("DRY RUN MODE — no files will be downloaded/uploaded")
    log.info("=" * 60)
    
    # Get Rask token
    rask_token = get_rask_token()
    
    # Get R2 client
    s3 = get_r2_client()
    
    tsx_changed = False
    total_processed = 0
    
    for episode_key, config in EPISODES.items():
        log.info(f"\n── Episode: {episode_key} ──")
        
        projects_file = Path(config["projects_file"])
        if not projects_file.exists():
            log.warning(f"Projects file not found: {projects_file} — skipping {episode_key}")
            continue
        
        with open(projects_file) as f:
            data = json.load(f)
        
        projects = data.get("projects", {})
        log.info(f"Loaded {len(projects)} project entries for {episode_key}")
        
        for lang_code, info in projects.items():
            project_id = info.get("project_id")
            if not project_id:
                log.debug(f"[{lang_code}] No project_id — skipping")
                continue
            
            r2_key = config["r2_key_pattern"].format(lang=lang_code)
            
            # Skip if already on R2
            if r2_file_exists(s3, r2_key):
                log.debug(f"[{lang_code}] Already on R2 — skipping")
                # But still update TSX if needed
                r2_url = f"{R2_PUBLIC_BASE}/{r2_key}"
                if update_tsx_ep2video(lang_code, r2_url):
                    tsx_changed = True
                continue
            
            # Check Rask status
            try:
                project_data = get_project_status(rask_token, project_id)
            except Exception as e:
                log.warning(f"[{lang_code}] Failed to get Rask status: {e}")
                continue
            
            status = project_data.get("status", "unknown")
            
            if status != "merging_done":
                log.debug(f"[{lang_code}] Status: {status} — not ready yet")
                continue
            
            download_url = project_data.get("translated_video")
            if not download_url:
                log.warning(f"[{lang_code}] merging_done but no translated_video URL")
                continue
            
            log.info(f"\n[{lang_code}] Status: merging_done — processing...")
            
            # Download to temp file
            with tempfile.TemporaryDirectory() as tmpdir:
                tmp_path = Path(tmpdir) / f"turboloop-{episode_key}-{lang_code}.mp4"
                
                success = download_video(download_url, tmp_path, token=rask_token)
                if not success:
                    log.error(f"[{lang_code}] Download failed — skipping")
                    continue
                
                # Verify file size (should be > 10 MB for a real video)
                file_size = tmp_path.stat().st_size
                if file_size < 10 * 1024 * 1024:
                    log.error(f"[{lang_code}] File too small ({file_size} bytes) — likely corrupt, skipping")
                    continue
                
                # Upload to R2
                r2_url = upload_to_r2(s3, tmp_path, r2_key)
                
                # Update TSX
                if update_tsx_ep2video(lang_code, r2_url):
                    tsx_changed = True
                
                total_processed += 1
                log.info(f"[{lang_code}] ✅ Complete — {file_size // 1024 // 1024} MB uploaded to R2")
            
            # Small delay between languages to avoid rate limiting
            time.sleep(1)
    
    log.info(f"\n── Summary ──")
    log.info(f"Total languages processed: {total_processed}")
    log.info(f"TSX changed: {tsx_changed}")
    
    # Write summary for GitHub Actions output
    with open("pipeline_summary.json", "w") as f:
        json.dump({
            "total_processed": total_processed,
            "tsx_changed": tsx_changed,
        }, f)
    
    return tsx_changed, total_processed


if __name__ == "__main__":
    tsx_changed, total_processed = run_pipeline()
    
    # Set GitHub Actions output
    github_output = os.environ.get("GITHUB_OUTPUT", "")
    if github_output:
        with open(github_output, "a") as f:
            f.write(f"tsx_changed={'true' if tsx_changed else 'false'}\n")
            f.write(f"total_processed={total_processed}\n")
    
    log.info("Pipeline complete.")
    sys.exit(0)
