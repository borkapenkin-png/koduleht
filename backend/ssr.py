"""
SSR (Server-Side Rendering) module for SEO-friendly public pages.
Uses Jinja2 templates to render full HTML with content for search engines.
React app hydrates on the client side.
"""

import os
import json
import glob
from pathlib import Path
from fastapi import Request
from fastapi.responses import HTMLResponse
from jinja2 import Environment, FileSystemLoader, select_autoescape

# Paths
BACKEND_DIR = Path(__file__).parent
TEMPLATES_DIR = BACKEND_DIR / "templates"
FRONTEND_BUILD_DIR = Path("/app/frontend/build")

# Initialize Jinja2
jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(['html', 'xml'])
)

# Company defaults
COMPANY_NAME = "J&B Tasoitus ja Maalaus Oy"
COMPANY_PHONE = "+358 40 054 7270"
COMPANY_EMAIL = "info@jbtasoitusmaalaus.fi"
SITE_URL = "https://jbtasoitusmaalaus.fi"


def get_react_assets():
    """Get CSS and JS files from React build."""
    css_files = []
    js_files = []
    
    # Check if build exists
    if not FRONTEND_BUILD_DIR.exists():
        return css_files, js_files
    
    static_dir = FRONTEND_BUILD_DIR / "static"
    
    # Find CSS files
    css_dir = static_dir / "css"
    if css_dir.exists():
        for css_file in sorted(css_dir.glob("*.css")):
            css_files.append(f"/static/css/{css_file.name}")
    
    # Find JS files
    js_dir = static_dir / "js"
    if js_dir.exists():
        for js_file in sorted(js_dir.glob("*.js")):
            # Skip source maps
            if not js_file.name.endswith('.map'):
                js_files.append(f"/static/js/{js_file.name}")
    
    return css_files, js_files


def build_json_ld_local_business(settings: dict) -> str:
    """Build LocalBusiness JSON-LD schema."""
    schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": settings.get("company_name", COMPANY_NAME),
        "description": settings.get("hero_description", "Ammattitaitoinen maalaus- ja tasoituspalvelu Uudellamaalla"),
        "telephone": settings.get("company_phone_primary", COMPANY_PHONE),
        "email": settings.get("company_email", COMPANY_EMAIL),
        "address": {
            "@type": "PostalAddress",
            "streetAddress": settings.get("company_address", "Sienitie 25"),
            "addressLocality": settings.get("company_city", "Helsinki"),
            "postalCode": settings.get("company_postal_code", "00760"),
            "addressCountry": "FI"
        },
        "areaServed": settings.get("service_areas", ["Helsinki", "Espoo", "Vantaa", "Uusimaa"]),
        "priceRange": "$$"
    }
    if settings.get("logo_url"):
        schema["logo"] = settings["logo_url"]
    return json.dumps(schema, ensure_ascii=False)


def build_json_ld_service(page: dict, settings: dict) -> str:
    """Build Service JSON-LD schema."""
    schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": page.get("hero_title", page.get("seo_title", "")),
        "description": page.get("seo_description", page.get("hero_subtitle", "")),
        "provider": {
            "@type": "LocalBusiness",
            "name": settings.get("company_name", COMPANY_NAME),
            "telephone": settings.get("company_phone_primary", COMPANY_PHONE)
        },
        "areaServed": settings.get("service_areas", ["Helsinki", "Espoo", "Vantaa", "Uusimaa"]),
        "serviceType": page.get("hero_title", "")
    }
    return json.dumps(schema, ensure_ascii=False)


def build_json_ld_faq(faqs: list) -> str:
    """Build FAQPage JSON-LD schema."""
    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": faq.get("question", ""),
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.get("answer", "")
                }
            }
            for faq in faqs
        ]
    }
    return json.dumps(schema, ensure_ascii=False)


def build_json_ld_breadcrumb(items: list, base_url: str = SITE_URL) -> str:
    """Build BreadcrumbList JSON-LD schema."""
    schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": i + 1,
                "name": item["name"],
                "item": f"{base_url}{item['url']}" if not item['url'].startswith('http') else item['url']
            }
            for i, item in enumerate(items)
        ]
    }
    return json.dumps(schema, ensure_ascii=False)


async def render_home_page(db, request: Request, base_url: str) -> HTMLResponse:
    """Render the home page with full SEO content."""
    # Fetch data
    settings = await db.site_settings.find_one({}) or {}
    services_cursor = db.services.find({})
    services = await services_cursor.to_list(100)
    
    # Get React assets
    css_files, js_files = get_react_assets()
    
    # Build JSON-LD (LocalBusiness + combined services)
    json_ld = build_json_ld_local_business(settings)
    
    # Prepare services for template
    template_services = []
    for s in services:
        template_services.append({
            "title": s.get("title", ""),
            "description": s.get("short_description", s.get("description", "")),
            "slug": s.get("link_url", s.get("id", ""))
        })
    
    company_name = settings.get("company_name", COMPANY_NAME)
    
    template = jinja_env.get_template("home.html")
    html = template.render(
        title=f"{company_name} | Maalaus ja tasoituspalvelut Helsinki",
        description=settings.get("hero_description", "Ammattitaitoinen maalaus- ja tasoituspalvelu Helsingissä ja Uudellamaalla. Sisämaalaus, julkisivumaalaus, tasoitustyöt, kotitalousvähennys."),
        canonical_url=base_url,
        og_title=f"{company_name} | Maalaus ja tasoituspalvelut",
        og_description=settings.get("hero_description", ""),
        og_image=settings.get("hero_image_url"),
        company_name=company_name,
        json_ld=json_ld,
        settings=settings,
        services=template_services,
        css_files=css_files,
        js_files=js_files
    )
    
    return HTMLResponse(content=html)


async def render_service_page(db, slug: str, request: Request, base_url: str) -> HTMLResponse:
    """Render a service page with full SEO content."""
    # Fetch page data
    page = await db.service_pages.find_one({"slug": slug})
    if not page:
        return await render_404_page(request, base_url)
    
    # Fetch settings
    settings = await db.site_settings.find_one({}) or {}
    
    # Get React assets
    css_files, js_files = get_react_assets()
    
    company_name = settings.get("company_name", COMPANY_NAME)
    phone = settings.get("company_phone_primary", COMPANY_PHONE)
    email = settings.get("company_email", COMPANY_EMAIL)
    service_areas = settings.get("service_areas", ["Helsinki", "Espoo", "Vantaa", "Kauniainen", "Uusimaa"])
    
    # Build JSON-LD
    service_json_ld = build_json_ld_service(page, settings)
    breadcrumb_json_ld = build_json_ld_breadcrumb([
        {"name": "Etusivu", "url": "/"},
        {"name": "Palvelut", "url": "/#palvelut"},
        {"name": page.get("hero_title", ""), "url": f"/{slug}"}
    ], base_url)
    
    # Combine JSON-LD schemas
    combined_json_ld = f'[{service_json_ld},{breadcrumb_json_ld}]'
    
    # Areas description
    service_title = page.get("hero_title", "Palvelu")
    areas_template = settings.get("areas_description_template", 
        f"Tarjoamme ammattitaitoisia {{palvelu}} Helsingissä, Espoossa, Vantaalla, Kauniaisissa ja koko Uudenmaan alueella.")
    areas_description = areas_template.replace("{palvelu}", service_title.lower())
    
    why_items = page.get("why_items", settings.get("why_choose_us", [
        "Ammattitaitoiset tekijät", "Laadukkaat materiaalit", "Selkeä hinnoittelu"
    ]))
    
    template = jinja_env.get_template("service_page.html")
    html = template.render(
        title=f"{page.get('seo_title', page.get('hero_title', ''))} | {company_name}",
        description=page.get("seo_description", page.get("hero_subtitle", "")),
        keywords=page.get("seo_keywords", ""),
        canonical_url=f"{base_url}/{slug}",
        og_title=page.get("seo_title", page.get("hero_title", "")),
        og_description=page.get("seo_description", page.get("hero_subtitle", "")),
        og_image=page.get("hero_image_url"),
        company_name=company_name,
        json_ld=combined_json_ld,
        page=page,
        settings=settings,
        phone=phone,
        email=email,
        service_areas=service_areas,
        areas_description=areas_description,
        why_items=why_items,
        css_files=css_files,
        js_files=js_files
    )
    
    return HTMLResponse(content=html)


async def render_references_page(db, request: Request, base_url: str) -> HTMLResponse:
    """Render the references page with full SEO content."""
    # Fetch data
    settings = await db.site_settings.find_one({}) or {}
    references_cursor = db.references.find({})
    references = await references_cursor.to_list(100)
    
    # Get React assets
    css_files, js_files = get_react_assets()
    
    company_name = settings.get("company_name", COMPANY_NAME)
    
    template = jinja_env.get_template("references.html")
    html = template.render(
        title=f"Referenssit | {company_name}",
        description="Tutustu J&B Tasoitus ja Maalaus Oy:n toteuttamiin kohteisiin. Laadukkaita maalaus- ja tasoitustöitä Helsingissä ja Uudellamaalla.",
        canonical_url=f"{base_url}/referenssit",
        og_title=f"Referenssit | {company_name}",
        og_description="Tutustu tekemiimme kohteisiin",
        company_name=company_name,
        references=references,
        subtitle=settings.get("references_subtitle", "Tutustu tekemiimme kohteisiin"),
        css_files=css_files,
        js_files=js_files
    )
    
    return HTMLResponse(content=html)


async def render_faq_page(db, request: Request, base_url: str) -> HTMLResponse:
    """Render the FAQ page with full SEO content."""
    # Fetch data
    settings = await db.site_settings.find_one({}) or {}
    faqs_cursor = db.faqs.find({})
    faqs = await faqs_cursor.to_list(100)
    services_cursor = db.services.find({})
    services = await services_cursor.to_list(100)
    
    # Group FAQs by service
    service_map = {s.get("id"): s.get("title", "Yleinen") for s in services}
    faq_categories = {}
    
    for faq in faqs:
        service_id = faq.get("service_id")
        category_name = service_map.get(service_id, "Yleinen")
        if category_name not in faq_categories:
            faq_categories[category_name] = []
        faq_categories[category_name].append(faq)
    
    # Convert to list for template
    categories_list = [{"name": name, "faqs": items} for name, items in faq_categories.items()]
    
    # Get React assets
    css_files, js_files = get_react_assets()
    
    company_name = settings.get("company_name", COMPANY_NAME)
    
    # Build FAQ JSON-LD
    all_faqs = [faq for category in categories_list for faq in category["faqs"]]
    json_ld = build_json_ld_faq(all_faqs) if all_faqs else None
    
    template = jinja_env.get_template("faq.html")
    html = template.render(
        title=f"Usein kysytyt kysymykset | {company_name}",
        description="Vastauksia yleisimpiin kysymyksiin maalaus- ja tasoituspalveluistamme. UKK - hinnoittelu, kotitalousvähennys, työajat ja materiaalit.",
        canonical_url=f"{base_url}/ukk",
        og_title=f"UKK - Usein kysytyt kysymykset | {company_name}",
        og_description="Vastauksia yleisimpiin kysymyksiin maalaus- ja tasoituspalveluistamme.",
        company_name=company_name,
        json_ld=json_ld,
        faq_categories=categories_list,
        css_files=css_files,
        js_files=js_files
    )
    
    return HTMLResponse(content=html)


async def render_404_page(request: Request, base_url: str) -> HTMLResponse:
    """Render a 404 page."""
    css_files, js_files = get_react_assets()
    
    template = jinja_env.get_template("404.html")
    html = template.render(
        title="Sivua ei löytynyt | J&B Tasoitus ja Maalaus",
        description="Etsimääsi sivua ei löytynyt.",
        canonical_url=base_url,
        company_name=COMPANY_NAME,
        css_files=css_files,
        js_files=js_files
    )
    
    return HTMLResponse(content=html, status_code=404)


# List of known service slugs (fixed routes)
FIXED_SERVICE_SLUGS = [
    "tasoitustyot-helsinki",
    "maalaustyot-helsinki",
    "mikrosementti-helsinki",
    "julkisivumaalaus-helsinki",
    "julkisivurappaus-helsinki",
    "kattomaalaus-helsinki",
    "espoo"  # Based on current DB
]

# System routes that should never be handled by SSR
SYSTEM_ROUTES = [
    "api", "admin", "login", "auth", "assets", "static", 
    "uploads", "favicon.ico", "robots.txt", "sitemap.xml"
]


def is_system_route(path: str) -> bool:
    """Check if path is a system route that should not be SSR'd."""
    path_parts = path.strip("/").split("/")
    if not path_parts:
        return False
    first_segment = path_parts[0].lower()
    return first_segment in SYSTEM_ROUTES


async def handle_dynamic_slug(db, slug: str, request: Request, base_url: str) -> HTMLResponse:
    """Handle dynamic slug routes - check DB and render or 404."""
    # Check if slug exists in service pages
    page = await db.service_pages.find_one({"slug": slug})
    if page:
        return await render_service_page(db, slug, request, base_url)
    
    # Not found
    return await render_404_page(request, base_url)
