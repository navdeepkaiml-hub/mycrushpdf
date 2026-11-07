"""Iteration 4: usage stats endpoint + admin auth/dashboard regression (browser-tool era)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN = {"email": "admin@mycrushpdf.com", "password": "CrushPDF@2026"}


# Usage stats (called by browser tools after processing)
class TestStats:
    def test_stats_ok(self):
        r = requests.post(f"{BASE_URL}/api/stats", json={"tool": "merge", "ok": True})
        assert r.status_code == 200 and r.json() == {"ok": True}

    def test_stats_failed_flag(self):
        r = requests.post(f"{BASE_URL}/api/stats", json={"tool": "jpg-to-pdf", "ok": False})
        assert r.status_code == 200

    def test_stats_unknown_tool(self):
        r = requests.post(f"{BASE_URL}/api/stats", json={"tool": "hack", "ok": True})
        assert r.status_code == 400

    def test_stats_missing_body(self):
        r = requests.post(f"{BASE_URL}/api/stats", json={})
        assert r.status_code == 422


# Admin auth + dashboard
class TestAdmin:
    def test_login_dashboard_and_stats_reflect(self):
        s = requests.Session()
        r = s.post(f"{BASE_URL}/api/auth/login", json=ADMIN)
        assert r.status_code == 200
        assert "access_token" in r.cookies or any(c.name == "access_token" for c in s.cookies)
        me = s.get(f"{BASE_URL}/api/auth/me")
        assert me.status_code == 200 and me.json()["email"] == ADMIN["email"]
        st = s.get(f"{BASE_URL}/api/admin/overview")
        assert st.status_code == 200
        before = {x["tool"]: x.get("total", 0) for x in st.json()["tool_stats"] if "tool" in x}
        requests.post(f"{BASE_URL}/api/stats", json={"tool": "rotate", "ok": True})
        after = {x["tool"]: x.get("total", 0) for x in s.get(f"{BASE_URL}/api/admin/overview").json()["tool_stats"] if "tool" in x}
        assert after.get("rotate", 0) >= before.get("rotate", 0) + 1

    def test_admin_stats_requires_auth(self):
        assert requests.get(f"{BASE_URL}/api/admin/overview").status_code == 401

    def test_wrong_password(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "TEST_nobody@x.com", "password": "bad"})
        assert r.status_code == 401
