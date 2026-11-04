"""mycrushpdf backend regression tests: tools, jobs/download, errors, security, auth, admin."""
import io
import os
import zipfile

import fitz
import pytest
import requests
from PIL import Image
from pypdf import PdfReader

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN_EMAIL = "admin@mycrushpdf.com"
ADMIN_PASSWORD = "CrushPDF@2026"


def make_pdf(n, label="P", with_image=False):
    doc = fitz.open()
    for i in range(n):
        page = doc.new_page()
        page.insert_text((72, 72), f"{label}{i + 1}", fontsize=24)
        if with_image:
            img = Image.effect_noise((1200, 1200), 80).convert("RGB")
            b = io.BytesIO(); img.save(b, "PNG")
            page.insert_image(fitz.Rect(50, 100, 550, 600), stream=b.getvalue())
    out = doc.tobytes(); doc.close()
    return out


def page_texts(pdf_bytes):
    r = PdfReader(io.BytesIO(pdf_bytes))
    return [p.extract_text().strip() for p in r.pages]


def make_jpg(color, size=(800, 600)):
    b = io.BytesIO(); Image.new("RGB", size, color).save(b, "JPEG", quality=90)
    return b.getvalue()


def download(job):
    jid = job["job_id"]
    s = requests.get(f"{BASE_URL}/api/jobs/{jid}")
    assert s.status_code == 200 and s.json()["status"] == "completed"
    d = requests.get(f"{BASE_URL}/api/download/{jid}")
    assert d.status_code == 200
    return d


# ---- Tools happy paths ----
class TestTools:
    def test_merge_order(self):
        files = [("files", ("a.pdf", make_pdf(2, "A"), "application/pdf")),
                 ("files", ("b.pdf", make_pdf(3, "B"), "application/pdf"))]
        r = requests.post(f"{BASE_URL}/api/tools/merge", files=files)
        assert r.status_code == 200, r.text
        d = download(r.json())
        assert d.content[:5] == b"%PDF-"
        assert page_texts(d.content) == ["A1", "A2", "B1", "B2", "B3"]

    def test_compress(self):
        src = make_pdf(2, "C", with_image=True)
        sizes = {}
        for lvl in ("low", "medium", "high"):
            r = requests.post(f"{BASE_URL}/api/tools/compress",
                              files={"file": ("c.pdf", src, "application/pdf")}, data={"level": lvl})
            assert r.status_code == 200, r.text
            d = download(r.json())
            assert len(PdfReader(io.BytesIO(d.content)).pages) == 2
            sizes[lvl] = len(d.content)
        print("src", len(src), "sizes", sizes)
        assert sizes["high"] <= len(src)

    def test_split_all_and_ranges(self):
        src = make_pdf(4, "S")
        r = requests.post(f"{BASE_URL}/api/tools/split", files={"file": ("s.pdf", src, "application/pdf")},
                          data={"mode": "all"})
        assert r.status_code == 200, r.text
        z = zipfile.ZipFile(io.BytesIO(download(r.json()).content))
        assert len(z.namelist()) == 4
        assert page_texts(z.read("page_3.pdf")) == ["S3"]
        r = requests.post(f"{BASE_URL}/api/tools/split", files={"file": ("s.pdf", src, "application/pdf")},
                          data={"mode": "ranges", "ranges": "1-2,3-4"})
        z = zipfile.ZipFile(io.BytesIO(download(r.json()).content))
        assert sorted(z.namelist()) == ["pages_1-2.pdf", "pages_3-4.pdf"]
        assert page_texts(z.read("pages_3-4.pdf")) == ["S3", "S4"]

    def test_remove_pages(self):
        r = requests.post(f"{BASE_URL}/api/tools/remove-pages",
                          files={"file": ("r.pdf", make_pdf(5, "R"), "application/pdf")}, data={"pages": "2,4-5"})
        assert r.status_code == 200, r.text
        assert page_texts(download(r.json()).content) == ["R1", "R3"]

    def test_organize(self):
        r = requests.post(f"{BASE_URL}/api/tools/organize",
                          files={"file": ("o.pdf", make_pdf(3, "O"), "application/pdf")}, data={"order": "3,1,2"})
        assert r.status_code == 200, r.text
        assert page_texts(download(r.json()).content) == ["O3", "O1", "O2"]

    def test_jpg_to_pdf(self):
        files = [("files", (f"{i}.jpg", make_jpg(c), "image/jpeg")) for i, c in enumerate(["red", "green", "blue"])]
        r = requests.post(f"{BASE_URL}/api/tools/jpg-to-pdf", files=files)
        assert r.status_code == 200, r.text
        d = download(r.json())
        doc = fitz.open(stream=d.content, filetype="pdf")
        assert doc.page_count == 3
        pix = doc[2].get_pixmap()
        assert pix.pixel(10, 10)[2] > 200  # blue page last


# ---- Error handling ----
class TestErrors:
    def test_fake_pdf(self):
        r = requests.post(f"{BASE_URL}/api/tools/compress", files={"file": ("x.pdf", b"hello text", "application/pdf")})
        assert r.status_code == 400

    def test_empty_file(self):
        r = requests.post(f"{BASE_URL}/api/tools/compress", files={"file": ("x.pdf", b"", "application/pdf")})
        assert r.status_code == 400

    def test_no_files(self):
        r = requests.post(f"{BASE_URL}/api/tools/merge")
        assert r.status_code == 422

    def test_merge_single(self):
        r = requests.post(f"{BASE_URL}/api/tools/merge", files=[("files", ("a.pdf", make_pdf(1), "application/pdf"))])
        assert r.status_code == 400

    def test_fake_image(self):
        r = requests.post(f"{BASE_URL}/api/tools/jpg-to-pdf", files=[("files", ("a.jpg", b"notimage", "image/jpeg"))])
        assert r.status_code == 400

    @pytest.mark.parametrize("tool,field,val", [
        ("remove-pages", "pages", "abc"), ("remove-pages", "pages", "9"), ("remove-pages", "pages", "1-"),
        ("organize", "order", "x,y"), ("organize", "order", "1,9"),
    ])
    def test_invalid_page_specs(self, tool, field, val):
        r = requests.post(f"{BASE_URL}/api/tools/{tool}",
                          files={"file": ("a.pdf", make_pdf(3), "application/pdf")}, data={field: val})
        print(tool, val, r.status_code, r.text[:120])
        assert r.status_code == 400

    @pytest.mark.parametrize("val", ["a-b", "5-9", "3-1"])
    def test_invalid_split_ranges(self, val):
        r = requests.post(f"{BASE_URL}/api/tools/split", files={"file": ("a.pdf", make_pdf(3), "application/pdf")},
                          data={"mode": "ranges", "ranges": val})
        print("split", val, r.status_code, r.text[:120])
        assert r.status_code == 400

    def test_reverse_range_remove_is_rejected(self):
        r = requests.post(f"{BASE_URL}/api/tools/remove-pages",
                          files={"file": ("a.pdf", make_pdf(3), "application/pdf")}, data={"pages": "3-1"})
        print("remove 3-1", r.status_code, r.text[:120])
        assert r.status_code == 400  # silently no-op otherwise


# ---- Security ----
class TestSecurity:
    @pytest.mark.parametrize("jid", ["..%2F..%2Fetc%2Fpasswd", "../../etc/passwd", "nonexistent123"])
    def test_traversal(self, jid):
        for ep in ("jobs", "download"):
            r = requests.get(f"{BASE_URL}/api/{ep}/{jid}")
            # ingress normalizes '../' to SPA index.html (200) - only ensure no file leak
            assert r.status_code in (200, 404)
            assert "root:" not in r.text

    @pytest.mark.parametrize("method,ep", [("get", "overview"), ("get", "contacts"), ("get", "config"),
                                           ("put", "tools"), ("put", "seo"), ("put", "settings"), ("put", "ads")])
    def test_admin_unauth(self, method, ep):
        r = getattr(requests, method)(f"{BASE_URL}/api/admin/{ep}", json={})
        assert r.status_code == 401

    def test_admin_bad_token(self):
        r = requests.get(f"{BASE_URL}/api/admin/overview", headers={"Authorization": "Bearer abc.def.ghi"})
        assert r.status_code == 401


# ---- Auth + admin ----
class TestAuthAdmin:
    def test_wrong_password(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "TEST_nouser@example.com", "password": "x"})
        assert r.status_code == 401

    def test_login_me_admin_logout(self):
        s = requests.Session()
        r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        assert r.json()["role"] == "admin"
        sc = r.headers.get("set-cookie", "")
        assert "HttpOnly" in sc and "access_token" in sc
        assert s.get(f"{BASE_URL}/api/auth/me").json()["email"] == ADMIN_EMAIL
        ov = s.get(f"{BASE_URL}/api/admin/overview").json()
        assert "total_jobs" in ov and isinstance(ov["tool_stats"], list)
        assert isinstance(s.get(f"{BASE_URL}/api/admin/contacts").json(), list)
        # settings round-trip (restore original)
        cfg = s.get(f"{BASE_URL}/api/admin/config").json()
        orig = cfg.get("settings")
        assert s.put(f"{BASE_URL}/api/admin/settings", json={"settings": {"TEST_key": "v"}}).status_code == 200
        assert s.get(f"{BASE_URL}/api/admin/config").json()["settings"] == {"TEST_key": "v"}
        if orig is not None:
            s.put(f"{BASE_URL}/api/admin/settings", json={"settings": orig})
        lo = s.post(f"{BASE_URL}/api/auth/logout")
        assert lo.status_code == 200
        s.cookies.clear()
        assert s.get(f"{BASE_URL}/api/auth/me").status_code == 401

    def test_contact(self):
        r = requests.post(f"{BASE_URL}/api/contact", json={"name": "TEST_user", "email": "test@example.com",
                                                          "subject": "TEST_subj", "message": "hello"})
        assert r.status_code == 200
        r = requests.post(f"{BASE_URL}/api/contact", json={"name": "", "email": "bad", "subject": "", "message": ""})
        assert r.status_code == 422

    def test_public_config(self):
        r = requests.get(f"{BASE_URL}/api/config/public")
        assert r.status_code == 200 and "tools_enabled" in r.json()
