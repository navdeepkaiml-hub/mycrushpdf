import os
import logging
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
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

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("mycrushpdf")

SITE_URL = "https://mycrushpdf.com"

TRUSTED_PROXY_HOPS = int(os.environ["TRUSTED_PROXY_HOPS"])


def client_ip(request: Request) -> str:
    # Only trust the X-Forwarded-For entry appended by our own proxy chain.
    parts = [p.strip() for p in request.headers.get("x-forwarded-for", "").split(",") if p.strip()]
    if TRUSTED_PROXY_HOPS and len(parts) >= TRUSTED_PROXY_HOPS:
        return parts[-TRUSTED_PROXY_HOPS]
    return get_remote_address(request)


limiter = Limiter(key_func=client_ip, default_limits=["120/minute"])
app = FastAPI(title="mycrushpdf API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


api_router = APIRouter(prefix="/api")

TOOLS = [
    "merge", "compress", "split", "remove-pages", "organize",
    "jpg-to-pdf", "rotate",
]


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


class UsageInput(BaseModel):
    tool: str = Field(..., max_length=40)
    ok: bool


@api_router.post("/stats")
@limiter.limit("60/minute")
async def record_usage(request: Request, data: UsageInput):
    if data.tool not in TOOLS:
        raise HTTPException(status_code=400, detail="Unknown tool.")
    await repo.increment_tool_stat(data.tool, "total")
    await repo.increment_tool_stat(data.tool, "success" if data.ok else "failed")
    return {"ok": True}


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


@app.on_event("startup")
async def startup():
    await repo.ensure_indexes()
    await seed_admin()
    logger.info("mycrushpdf API started")


@app.on_event("shutdown")
async def shutdown():
    repo.close()
