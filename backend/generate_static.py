#!/usr/bin/env python3
"""
Static HTML Generator for SEO
Generates pre-rendered HTML pages from FastAPI SSR endpoints.
Run this after content changes to update static HTML files.
"""

import asyncio
import aiohttp
import os
from pathlib import Path

# Configuration
BACKEND_URL = "http://localhost:8001"
OUTPUT_DIR = Path("/app/frontend/build")
SITE_URL = os.environ.get("SITE_URL", "https://jbtasoitusmaalaus.fi")

# Pages to generate
STATIC_PAGES = [
    ("/", "index.html"),
    ("/referenssit", "referenssit/index.html"),
    ("/ukk", "ukk/index.html"),
    # Fixed service pages
    ("/tasoitustyot-helsinki", "tasoitustyot-helsinki/index.html"),
    ("/maalaustyot-helsinki", "maalaustyot-helsinki/index.html"),
    ("/mikrosementti-helsinki", "mikrosementti-helsinki/index.html"),
    ("/julkisivumaalaus-helsinki", "julkisivumaalaus-helsinki/index.html"),
    ("/julkisivurappaus-helsinki", "julkisivurappaus-helsinki/index.html"),
    ("/kattomaalaus-helsinki", "kattomaalaus-helsinki/index.html"),
]


async def fetch_page(session: aiohttp.ClientSession, path: str) -> str:
    """Fetch a page from the SSR backend."""
    url = f"{BACKEND_URL}{path}"
    try:
        async with session.get(url) as response:
            if response.status == 200:
                html = await response.text()
                # Replace localhost URL with production URL
                html = html.replace("http://localhost:8001", SITE_URL)
                return html
            else:
                print(f"  Error {response.status} for {path}")
                return None
    except Exception as e:
        print(f"  Error fetching {path}: {e}")
        return None


async def generate_static_pages():
    """Generate all static HTML pages."""
    print("Generating static HTML pages for SEO...")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Site URL: {SITE_URL}")
    print()
    
    async with aiohttp.ClientSession() as session:
        for path, output_file in STATIC_PAGES:
            print(f"Generating {path} -> {output_file}")
            html = await fetch_page(session, path)
            
            if html:
                output_path = OUTPUT_DIR / output_file
                output_path.parent.mkdir(parents=True, exist_ok=True)
                output_path.write_text(html, encoding="utf-8")
                print(f"  ✓ Written {output_path}")
            else:
                print(f"  ✗ Failed to generate {path}")
    
    print()
    print("Static page generation complete!")


async def fetch_dynamic_pages(session: aiohttp.ClientSession) -> list:
    """Fetch list of dynamic service pages from API."""
    try:
        async with session.get(f"{BACKEND_URL}/api/service-pages") as response:
            if response.status == 200:
                pages = await response.json()
                return [(f"/{p['slug']}", f"{p['slug']}/index.html") for p in pages]
    except Exception as e:
        print(f"Error fetching dynamic pages: {e}")
    return []


async def generate_all_pages():
    """Generate static and dynamic pages."""
    print("=" * 60)
    print("SEO Static HTML Generator")
    print("=" * 60)
    
    async with aiohttp.ClientSession() as session:
        # Get dynamic pages
        print("\nFetching dynamic service pages from database...")
        dynamic_pages = await fetch_dynamic_pages(session)
        print(f"Found {len(dynamic_pages)} dynamic pages")
        
        # Combine all pages (avoid duplicates)
        all_pages = list(STATIC_PAGES)
        existing_paths = {p[0] for p in all_pages}
        
        for path, output in dynamic_pages:
            if path not in existing_paths:
                all_pages.append((path, output))
        
        print(f"\nTotal pages to generate: {len(all_pages)}")
        print()
        
        # Generate each page
        success_count = 0
        for path, output_file in all_pages:
            print(f"Generating {path}")
            html = await fetch_page(session, path)
            
            if html:
                output_path = OUTPUT_DIR / output_file
                output_path.parent.mkdir(parents=True, exist_ok=True)
                output_path.write_text(html, encoding="utf-8")
                print(f"  ✓ {output_file}")
                success_count += 1
            else:
                print(f"  ✗ Failed")
        
        print()
        print("=" * 60)
        print(f"Generation complete: {success_count}/{len(all_pages)} pages")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(generate_all_pages())
