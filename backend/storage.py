"""Temporary file storage and job lifecycle management.

Output files live on local disk under a random-named directory. Each job has
a record in the DB with an expiry. A background task deletes expired files and
records. This mirrors a Cloud Run + bucket-lifecycle setup: in production the
STORAGE_DIR can be a mounted bucket and the lifecycle rule provides a second
cleanup safeguard.
"""
import os
import uuid
import shutil
import secrets as pysecrets
from pathlib import Path
from datetime import timedelta

from db import repo, now_utc

STORAGE_DIR = Path(os.environ.get("STORAGE_DIR", "/tmp/mycrushpdf_storage"))
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
RETENTION_MINUTES = int(os.environ.get("FILE_RETENTION_MINUTES", "60"))


def random_name(ext: str) -> str:
    return f"{pysecrets.token_hex(16)}.{ext.lstrip('.')}"


def safe_path(filename: str) -> Path:
    """Resolve a filename inside STORAGE_DIR, blocking path traversal."""
    p = (STORAGE_DIR / filename).resolve()
    if not str(p).startswith(str(STORAGE_DIR.resolve())):
        raise ValueError("Invalid path")
    return p


async def register_output(tool: str, output_bytes: bytes, filename: str, content_type: str) -> dict:
    job_id = uuid.uuid4().hex
    stored = random_name(Path(filename).suffix or ".bin")
    dest = safe_path(stored)
    with open(dest, "wb") as f:
        f.write(output_bytes)
    expires = (now_utc() + timedelta(minutes=RETENTION_MINUTES)).isoformat()
    doc = {
        "job_id": job_id,
        "tool": tool,
        "stored_name": stored,
        "download_name": filename,
        "content_type": content_type,
        "status": "completed",
        "size": len(output_bytes),
        "created_at": now_utc().isoformat(),
        "expires_at": expires,
    }
    await repo.create_job(doc)
    return {"job_id": job_id, "download_name": filename, "size": len(output_bytes), "expires_at": expires}


async def cleanup_expired():
    for job in await repo.expired_jobs():
        try:
            p = safe_path(job["stored_name"])
            if p.exists():
                p.unlink()
        except Exception:
            pass
        await repo.delete_job(job["job_id"])


async def delete_job_file(job: dict):
    try:
        p = safe_path(job["stored_name"])
        if p.exists():
            p.unlink()
    except Exception:
        pass
    await repo.delete_job(job["job_id"])
