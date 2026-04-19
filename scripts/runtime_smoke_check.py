#!/usr/bin/env python3
"""Runtime smoke and sync checks for frontend/backend deployment."""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from typing import Any


def fetch(url: str, *, timeout: int = 15) -> tuple[int, str]:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "koduleht-runtime-smoke-check/1.0",
            "Accept": "application/json, text/html;q=0.9,*/*;q=0.8",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.getcode(), response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        return exc.code, body


def fetch_json(url: str) -> Any:
    status, body = fetch(url)
    assert_true(status == 200, f"{url} returned HTTP {status}")
    try:
        return json.loads(body)
    except json.JSONDecodeError as exc:
        raise AssertionError(f"{url} did not return valid JSON: {exc}") from exc


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def check_frontend_route(frontend_base: str, route: str) -> None:
    status, body = fetch(f"{frontend_base}{route}")
    assert_true(status == 200, f"Frontend route {route} returned HTTP {status}")
    assert_true("<!doctype html" in body.lower(), f"Frontend route {route} did not return HTML shell")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--frontend-base", default="http://127.0.0.1:13000")
    parser.add_argument("--backend-base", default="http://127.0.0.1:18001")
    args = parser.parse_args()

    frontend_base = args.frontend_base.rstrip("/")
    backend_base = args.backend_base.rstrip("/")

    print(f"[smoke] frontend={frontend_base}")
    print(f"[smoke] backend={backend_base}")

    settings = fetch_json(f"{backend_base}/api/settings")
    frontend_settings = fetch_json(f"{frontend_base}/api/settings")
    services = fetch_json(f"{backend_base}/api/services")
    frontend_services = fetch_json(f"{frontend_base}/api/services")
    references = fetch_json(f"{backend_base}/api/references")
    faqs = fetch_json(f"{backend_base}/api/faqs")
    grouped_faqs = fetch_json(f"{backend_base}/api/faqs/grouped")
    service_pages = fetch_json(f"{backend_base}/api/service-pages")
    calculator_config = fetch_json(f"{backend_base}/api/calculator-config")
    frontend_calculator_config = fetch_json(f"{frontend_base}/api/calculator-config")
    server_info = fetch_json(f"{frontend_base}/__server-info")

    assert_true(isinstance(settings, dict), "/api/settings must return an object")
    assert_true(settings.get("hero_title_1"), "/api/settings.hero_title_1 is missing")
    assert_true(settings.get("company_name"), "/api/settings.company_name is missing")
    assert_true(frontend_settings.get("company_name") == settings.get("company_name"), "Frontend /api/settings is not in sync with backend")
    assert_true(frontend_settings.get("hero_title_1") == settings.get("hero_title_1"), "Frontend /api/settings hero content differs from backend")

    assert_true(isinstance(services, list), "/api/services must return a list")
    assert_true(len(services) > 0, "/api/services is empty")
    assert_true(isinstance(frontend_services, list), "Frontend /api/services must return a list")
    assert_true(len(frontend_services) == len(services), "Frontend /api/services count differs from backend")

    assert_true(isinstance(references, list), "/api/references must return a list")
    assert_true(isinstance(faqs, list), "/api/faqs must return a list")
    assert_true(len(faqs) > 0, "/api/faqs is empty")
    assert_true(isinstance(grouped_faqs, dict), "/api/faqs/grouped must return an object")

    assert_true(isinstance(service_pages, list), "/api/service-pages must return a list")
    published_slugs = [page.get("slug") for page in service_pages if isinstance(page, dict) and page.get("slug")]
    assert_true(len(published_slugs) > 0, "/api/service-pages returned no published slugs")

    assert_true(isinstance(calculator_config, dict), "/api/calculator-config must return an object")
    assert_true(isinstance(calculator_config.get("services"), list), "/api/calculator-config.services must be a list")
    assert_true(len(calculator_config["services"]) > 0, "/api/calculator-config.services is empty")
    assert_true(
        len(frontend_calculator_config.get("services", [])) == len(calculator_config.get("services", [])),
        "Frontend /api/calculator-config is not in sync with backend",
    )

    assert_true(server_info.get("server") == "node-static-server", "__server-info did not return expected frontend server marker")

    for route in ["/", "/referenssit", "/ukk", "/hintalaskuri"]:
        check_frontend_route(frontend_base, route)

    for slug in published_slugs[:10]:
        status, _ = fetch(f"{backend_base}/api/service-pages/{slug}")
        assert_true(status == 200, f"/api/service-pages/{slug} returned HTTP {status}")
        check_frontend_route(frontend_base, f"/{slug}")

    print("[smoke] Runtime smoke and sync checks passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as exc:
        print(f"[smoke] FAILED: {exc}", file=sys.stderr)
        raise SystemExit(1)
