import os
import logging
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, Request, Depends
from fastapi.responses import Response, PlainTextResponse, JSONResponse
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
import asyncio

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from db import repo, now_utc
from auth import auth_router, seed_admin, get_current_admin
import storage
import pdf_processing as pdf

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("mycrushpdf")

MAX_FILE_SIZE = int(os.environ.get("MAX_FILE_SIZE_MB", "50")) * 1024 * 1024
MAX_PAGES = int(os.environ.get("MAX_PAGE_COUNT", "500"))
SITE_URL = "https://mycrushpdf.com"

def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    return fwd.split(",")[0].strip() if fwd else get_remote_address(request)


limiter = Limiter(key_func=client_ip, default_limits=["120/minute"])
app = FastAPI(title="mycrushpdf API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(pdf.ProcessingError)
async def processing_error_handler(request: Request, exc: pdf.ProcessingError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})

api_router = APIRouter(prefix="/api")

TOOLS = [
    "merge", "compress", "split", "remove-pages", "organize",
    "jpg-to-pdf", "pdf-to-word", "rotate",
]


# ---------------- Helpers ----------------
async def read_upload(f: UploadFile) -> bytes:
    data = await f.read()
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="One of the uploaded files is empty.")
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail=f"File exceeds the {MAX_FILE_SIZE // (1024*1024)}MB size limit.")
    return data


async def tool_enabled(tool: str) -> bool:
    cfg = await repo.get_config("tools_enabled")
    if not cfg:
        return True
    return cfg["value"].get(tool, True)


async def run_tool(tool: str, fn, *args, out_name: str, content_type: str):
    if not await tool_enabled(tool):
        raise HTTPException(status_code=403, detail="This tool is currently disabled.")
    await repo.increment_tool_stat(tool, "total")
    try:
        output = await asyncio.wait_for(asyncio.to_thread(fn, *args), timeout=55)
    except asyncio.TimeoutError:
        await repo.increment_tool_stat(tool, "failed")
        raise HTTPException(status_code=408, detail="Processing took too long. Try a smaller file.")
    except pdf.ProcessingError as e:
        await repo.increment_tool_stat(tool, "failed")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        await repo.increment_tool_stat(tool, "failed")
        logger.exception("Processing failed for %s", tool)
        raise HTTPException(status_code=500, detail="An unexpected error occurred while processing your file.")
    await repo.increment_tool_stat(tool, "success")
    return await storage.register_output(tool, output, out_name, content_type)


PDF_CT = "application/pdf"
ZIP_CT = "application/zip"
DOCX_CT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


# ---------------- Tool endpoints ----------------
@api_router.post("/tools/merge")
@limiter.limit("20/minute")
async def merge(request: Request, files: List[UploadFile] = File(...)):
    datas = []
    for f in files:
        d = await read_upload(f)
        pdf.validate_pdf(d, MAX_PAGES)
        datas.append(d)
    return await run_tool("merge", pdf.merge_pdfs, datas, out_name="merged.pdf", content_type=PDF_CT)


@api_router.post("/tools/compress")
@limiter.limit("20/minute")
async def compress(request: Request, file: UploadFile = File(...), level: str = Form("medium")):
    d = await read_upload(file)
    pdf.validate_pdf(d, MAX_PAGES)
    return await run_tool("compress", pdf.compress_pdf, d, level, out_name="compressed.pdf", content_type=PDF_CT)


@api_router.post("/tools/split")
@limiter.limit("20/minute")
async def split(request: Request, file: UploadFile = File(...), mode: str = Form("all"), ranges: str = Form("")):
    d = await read_upload(file)
    pdf.validate_pdf(d, MAX_PAGES)
    return await run_tool("split", pdf.split_pdf, d, mode, ranges, out_name="split_pages.zip", content_type=ZIP_CT)


@api_router.post("/tools/remove-pages")
@limiter.limit("20/minute")
async def remove_pages(request: Request, file: UploadFile = File(...), pages: str = Form(...)):
    d = await read_upload(file)
    pdf.validate_pdf(d, MAX_PAGES)
    return await run_tool("remove-pages", pdf.remove_pages, d, pages, out_name="edited.pdf", content_type=PDF_CT)


@api_router.post("/tools/organize")
@limiter.limit("20/minute")
async def organize(request: Request, file: UploadFile = File(...), order: str = Form(...)):
    d = await read_upload(file)
    pdf.validate_pdf(d, MAX_PAGES)
    return await run_tool("organize", pdf.organize_pdf, d, order, out_name="organized.pdf", content_type=PDF_CT)


@api_router.post("/tools/jpg-to-pdf")
@limiter.limit("20/minute")
async def jpg_to_pdf(request: Request, files: List[UploadFile] = File(...)):
    datas = []
    for f in files:
        d = await read_upload(f)
        pdf.validate_image(d)
        datas.append(d)
    return await run_tool("jpg-to-pdf", pdf.jpg_to_pdf, datas, out_name="images.pdf", content_type=PDF_CT)


@api_router.post("/tools/pdf-to-word")
@limiter.limit("10/minute")
async def pdf_to_word(request: Request, file: UploadFile = File(...)):
    d = await read_upload(file)
    pdf.validate_pdf(d, MAX_PAGES)
    return await run_tool("pdf-to-word", pdf.pdf_to_word, d, out_name="converted.docx", content_type=DOCX_CT)


@api_router.post("/tools/rotate")
@limiter.limit("20/minute")
async def rotate(request: Request, file: UploadFile = File(...), angle: int = Form(90), pages: str = Form("")):
    d = await read_upload(file)
    pdf.validate_pdf(d, MAX_PAGES)
    return await run_tool("rotate", pdf.rotate_pdf, d, angle, pages, out_name="rotated.pdf", content_type=PDF_CT)


# ---------------- Job status + download ----------------
@api_router.get("/jobs/{job_id}")
async def job_status(job_id: str):
    job = await repo.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or expired.")
    return {"job_id": job["job_id"], "status": job["status"], "download_name": job["download_name"],
            "size": job["size"], "expires_at": job["expires_at"]}


@api_router.get("/download/{job_id}")
async def download(job_id: str):
    job = await repo.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="File not found or expired.")
    if job["expires_at"] < now_utc().isoformat():
        await storage.delete_job_file(job)
        raise HTTPException(status_code=410, detail="This file has expired.")
    try:
        path = storage.safe_path(job["stored_name"])
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid file reference.")
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found or expired.")
    with open(path, "rb") as f:
        content = f.read()
    return Response(
        content=content,
        media_type=job["content_type"],
        headers={"Content-Disposition": f'attachment; filename="{job["download_name"]}"'},
    )


# ---------------- Contact ----------------
class ContactInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    subject: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=4000)


@api_router.post("/contact")
@limiter.limit("5/minute")
async def contact(request: Request, data: ContactInput):
    await repo.insert_contact({
        "name": data.name, "email": data.email, "subject": data.subject,
        "message": data.message, "created_at": now_utc().isoformat(), "read": False,
    })
    return {"message": "Thanks for reaching out! We'll get back to you soon."}


# ---------------- Public config (which tools are enabled, SEO, ads) ----------------
@api_router.get("/config/public")
async def public_config():
    tools_cfg = await repo.get_config("tools_enabled")
    seo_cfg = await repo.get_config("seo")
    ads_cfg = await repo.get_config("ads")
    return {
        "tools_enabled": tools_cfg["value"] if tools_cfg else {t: True for t in TOOLS},
        "seo": seo_cfg["value"] if seo_cfg else {},
        "ads": ads_cfg["value"] if ads_cfg else {"enabled": False, "publisher_id": ""},
    }


# ---------------- Admin ----------------
@api_router.get("/admin/overview")
async def admin_overview(admin: dict = Depends(get_current_admin)):
    stats = await repo.all_tool_stats()
    total_jobs = sum(s.get("total", 0) for s in stats)
    total_success = sum(s.get("success", 0) for s in stats)
    total_failed = sum(s.get("failed", 0) for s in stats)
    contacts = await repo.count_contacts()
    return {
        "total_jobs": total_jobs,
        "total_success": total_success,
        "total_failed": total_failed,
        "total_contacts": contacts,
        "tool_stats": stats,
    }


@api_router.get("/admin/contacts")
async def admin_contacts(admin: dict = Depends(get_current_admin)):
    return await repo.list_contacts()


class ToolsToggleInput(BaseModel):
    tools_enabled: dict


@api_router.put("/admin/tools")
async def admin_set_tools(data: ToolsToggleInput, admin: dict = Depends(get_current_admin)):
    await repo.set_config("tools_enabled", data.tools_enabled)
    return {"message": "Tool settings updated.", "tools_enabled": data.tools_enabled}


class SeoInput(BaseModel):
    seo: dict


@api_router.put("/admin/seo")
async def admin_set_seo(data: SeoInput, admin: dict = Depends(get_current_admin)):
    await repo.set_config("seo", data.seo)
    return {"message": "SEO settings updated."}


class SettingsInput(BaseModel):
    settings: dict


@api_router.put("/admin/settings")
async def admin_set_settings(data: SettingsInput, admin: dict = Depends(get_current_admin)):
    await repo.set_config("settings", data.settings)
    return {"message": "Settings updated."}


class AdsInput(BaseModel):
    ads: dict


@api_router.put("/admin/ads")
async def admin_set_ads(data: AdsInput, admin: dict = Depends(get_current_admin)):
    await repo.set_config("ads", data.ads)
    return {"message": "Advertising settings updated."}


@api_router.get("/admin/config")
async def admin_get_config(admin: dict = Depends(get_current_admin)):
    return {c["key"]: c["value"] for c in await repo.all_config()}


@api_router.get("/")
async def root():
    return {"message": "mycrushpdf API", "tools": TOOLS}


# ---------------- SEO routes (served at root, not /api) ----------------
TOOL_ROUTES = [
    "merge-pdf", "compress-pdf", "split-pdf", "remove-pdf-pages",
    "organize-pdf", "jpg-to-pdf", "pdf-to-word", "rotate-pdf",
]
STATIC_ROUTES = [
    "", "all-tools", "blog", "about-us", "contact-us", "privacy-policy",
    "terms-and-conditions", "cookie-policy", "disclaimer", "faq", "help",
]
BLOG_SLUGS = [
    "how-to-merge-pdf-files-online",
    "how-to-compress-pdf-without-losing-quality",
    "how-to-split-pdf-pages",
    "how-to-convert-jpg-images-to-pdf",
    "how-to-organize-and-remove-pdf-pages",
]


@app.get("/sitemap.xml")
async def sitemap():
    urls = STATIC_ROUTES + TOOL_ROUTES + [f"blog/{s}" for s in BLOG_SLUGS]
    items = "".join(
        f"<url><loc>{SITE_URL}/{u}</loc><changefreq>weekly</changefreq>"
        f"<priority>{'1.0' if u == '' else '0.8'}</priority></url>"
        for u in urls
    )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        f"{items}</urlset>"
    )
    return Response(content=xml, media_type="application/xml")


@app.get("/robots.txt")
async def robots():
    content = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /admin\n"
        f"Sitemap: {SITE_URL}/sitemap.xml\n"
    )
    return PlainTextResponse(content)


@app.get("/ads.txt")
async def ads_txt():
    cfg = await repo.get_config("ads")
    pub = cfg["value"].get("publisher_id") if cfg else ""
    if pub:
        return PlainTextResponse(f"google.com, {pub}, DIRECT, f08c47fec0942fa0\n")
    # Unconfigured until a real publisher ID is supplied.
    return PlainTextResponse("# ads.txt not configured yet\n")


app.include_router(auth_router)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=os.environ["CORS_ORIGINS"] != "*",
    allow_origins=os.environ["CORS_ORIGINS"].split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response


async def _cleanup_loop():
    while True:
        try:
            await storage.cleanup_expired()
        except Exception:
            logger.exception("cleanup loop error")
        await asyncio.sleep(60)


@app.on_event("startup")
async def startup():
    await repo.ensure_indexes()
    await seed_admin()
    app.state.cleanup_task = asyncio.create_task(_cleanup_loop())
    logger.info("mycrushpdf API started")


@app.on_event("shutdown")
async def shutdown():
    task = getattr(app.state, "cleanup_task", None)
    if task:
        task.cancel()
    repo.close()
