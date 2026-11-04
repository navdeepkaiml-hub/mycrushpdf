"""Modular data layer.

All persistence goes through the Repository class so that swapping the
MongoDB backend for Firestore in production only requires a new Repository
implementation, not changes across the app. Routes never touch `motor`
directly — they call repo.<method>().
"""
import os
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class Repository:
    def __init__(self):
        self.client = AsyncIOMotorClient(os.environ["MONGO_URL"])
        self.db = self.client[os.environ["DB_NAME"]]

    async def ensure_indexes(self):
        await self.db.users.create_index("email", unique=True)
        await self.db.jobs.create_index("job_id", unique=True)
        await self.db.jobs.create_index("expires_at")
        await self.db.tool_stats.create_index("tool", unique=True)
        await self.db.contact_messages.create_index([("created_at", DESCENDING)])
        await self.db.login_attempts.create_index("identifier")
        await self.db.site_config.create_index("key", unique=True)

    def close(self):
        self.client.close()

    # ---------- Users ----------
    async def find_user_by_email(self, email: str) -> Optional[dict]:
        return await self.db.users.find_one({"email": email.lower()})

    async def insert_user(self, doc: dict):
        await self.db.users.insert_one(doc)

    # ---------- Login attempts ----------
    async def get_attempts(self, identifier: str) -> Optional[dict]:
        return await self.db.login_attempts.find_one({"identifier": identifier})

    async def record_failed_attempt(self, identifier: str):
        await self.db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"last_attempt": now_utc().isoformat()}},
            upsert=True,
        )

    async def clear_attempts(self, identifier: str):
        await self.db.login_attempts.delete_one({"identifier": identifier})

    # ---------- Jobs ----------
    async def create_job(self, doc: dict):
        await self.db.jobs.insert_one(doc)

    async def get_job(self, job_id: str) -> Optional[dict]:
        return await self.db.jobs.find_one({"job_id": job_id}, {"_id": 0})

    async def update_job(self, job_id: str, update: dict):
        await self.db.jobs.update_one({"job_id": job_id}, {"$set": update})

    async def expired_jobs(self) -> List[dict]:
        return await self.db.jobs.find(
            {"expires_at": {"$lt": now_utc().isoformat()}}, {"_id": 0}
        ).to_list(1000)

    async def delete_job(self, job_id: str):
        await self.db.jobs.delete_one({"job_id": job_id})

    # ---------- Stats ----------
    async def increment_tool_stat(self, tool: str, field: str):
        await self.db.tool_stats.update_one(
            {"tool": tool}, {"$inc": {field: 1}}, upsert=True
        )

    async def all_tool_stats(self) -> List[dict]:
        return await self.db.tool_stats.find({}, {"_id": 0}).to_list(100)

    # ---------- Contact ----------
    async def insert_contact(self, doc: dict):
        await self.db.contact_messages.insert_one(doc)

    async def list_contacts(self, limit: int = 100) -> List[dict]:
        return await self.db.contact_messages.find({}, {"_id": 0}).sort(
            "created_at", -1
        ).limit(limit).to_list(limit)

    async def count_contacts(self) -> int:
        return await self.db.contact_messages.count_documents({})

    # ---------- Site config (tools enabled, SEO, settings, ads) ----------
    async def get_config(self, key: str) -> Optional[dict]:
        return await self.db.site_config.find_one({"key": key}, {"_id": 0})

    async def set_config(self, key: str, value: dict):
        await self.db.site_config.update_one(
            {"key": key}, {"$set": {"key": key, "value": value}}, upsert=True
        )

    async def all_config(self) -> List[dict]:
        return await self.db.site_config.find({}, {"_id": 0}).to_list(200)


repo = Repository()
