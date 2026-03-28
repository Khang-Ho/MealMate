"""Persist cooked meal history in Supabase (cooked_meals table)."""
from __future__ import annotations

import logging
from urllib.parse import quote

import httpx

from app.core.config import settings

log = logging.getLogger(__name__)


def _headers() -> dict[str, str]:
    key = settings.supabase_service_role_key or settings.supabase_anon_key
    if not key:
        return {}
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def _base_url() -> str | None:
    base = (settings.supabase_url or "").rstrip("/")
    if not base:
        return None
    return f"{base}/rest/v1/cooked_meals"


def is_configured() -> bool:
    return bool(_base_url() and (settings.supabase_service_role_key or settings.supabase_anon_key))


async def list_for_user(user_id: str, limit: int = 50) -> list[dict]:
    url = _base_url()
    if not url or not _headers():
        log.warning("Supabase not configured — cooked meals unavailable")
        return []

    safe = quote(user_id, safe="")
    req_url = f"{url}?user_id=eq.{safe}&select=*&order=cooked_at.desc&limit={limit}"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(req_url, headers=_headers())
        resp.raise_for_status()
        data = resp.json()
    return data if isinstance(data, list) else []


async def insert(
    user_id: str,
    spoonacular_id: int,
    title: str,
    image: str | None,
) -> dict | None:
    url = _base_url()
    if not url or not _headers():
        raise RuntimeError("Supabase is not configured (SUPABASE_URL and service key)")

    body = {
        "user_id": user_id,
        "spoonacular_id": spoonacular_id,
        "title": title,
        "image": image,
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, headers=_headers(), json=body)
        if resp.status_code >= 400:
            log.error("Supabase insert cooked_meals failed: %s %s", resp.status_code, resp.text)
            resp.raise_for_status()
        rows = resp.json()
    if isinstance(rows, list) and rows:
        return rows[0]
    return None


async def delete_one(user_id: str, row_id: str) -> bool:
    url = _base_url()
    if not url or not _headers():
        raise RuntimeError("Supabase is not configured")

    uid = quote(user_id, safe="")
    req_url = f"{url}?user_id=eq.{uid}&id=eq.{row_id}"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.delete(req_url, headers=_headers())
        if resp.status_code >= 400:
            log.error("Supabase delete cooked_meals failed: %s %s", resp.status_code, resp.text)
            resp.raise_for_status()
    return True
