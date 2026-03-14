#!/usr/bin/env python3
"""
Static HTML Generator for SEO - Direct Database Version
Generates pre-rendered HTML pages directly from MongoDB without needing the backend running.
This is used during the build process.
"""

import asyncio
import os
import json
import glob
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from jinja2 import Environment, FileSystemLoader, select_autoescape
from dotenv import load_dotenv

# Load environment
load_dotenv(Path(__file__).parent / '.env')

# Paths
BACKEND_DIR = Path(__file__).parent
TEMPLATES_DIR = BACKEND_DIR / "templates"
BUILD_DIR = Path("/app/frontend/build")
PUBLIC_DIR = Path("/app/frontend/public")
SITE_URL = os.environ.get("SITE_URL", "https://jbtasoitusmaalaus.fi")

# Company defaults
COMPANY_NAME = "J&B Tasoitus ja Maalaus Oy"
COMPANY_PHONE = "+358 40 054 7270"
COMPANY_EMAIL = "info@jbtasoitusmaalaus.fi"

# Initialize Jinja2
jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(['html', 'xml'])
)


def get_react_assets():
    """Get CSS and JS files from React build."""
    css_files = []
    js_files = []
    
    if not BUILD_DIR.exists():
        return css_files, js_files
    
    static_dir = BUILD_DIR / "static"
    
    css_dir = static_dir / "css"
    if css_dir.exists():
        for css_file in sorted(css_dir.glob("*.css")):
            css_files.append(f"/static/css/{css_file.name}")
    
    js_dir = static_dir / "js"
    if js_dir.exists():
        for js_file in sorted(js_dir.glob("*.js")):
            if not js_file.name.endswith('.map'):
                js_files.append(f"/static/js/{js_file.name}")
    
    return css_files, js_files


def build_json_ld_local_business(settings: dict) -> str:
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
    return json.dumps(schema, ensure_ascii=False)


def build_json_ld_service(page: dict, settings: dict) -> str:
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


def build_json_ld_breadcrumb(items: list) -> str:
    schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": i + 1,
                "name": item["name"],
                "item": f"{SITE_URL}{item['url']}" if not item['url'].startswith('http') else item['url']
            }
            for i, item in enumerate(items)
        ]
    }
    return json.dumps(schema, ensure_ascii=False)


async def generate_home_page(db, css_files, js_files):
    """Generate home page HTML."""
    settings = await db.site_settings.find_one({}) or {}
    # Remove MongoDB _id to avoid serialization issues
    if '_id' in settings:
        del settings['_id']
    
    services_cursor = db.services.find({})
    services = await services_cursor.to_list(100)
    
    template_services = []
    for s in services:
        template_services.append({
            "title": s.get("title", ""),
            "description": s.get("short_description", s.get("description", "")),
            "slug": s.get("link_url", s.get("id", ""))
        })
    
    company_name = settings.get("company_name", COMPANY_NAME)
    json_ld = build_json_ld_local_business(settings)
    
    template = jinja_env.get_template("home.html")
    return template.render(
        title=f"{company_name} | Maalaus ja tasoituspalvelut Helsinki",
        description=settings.get("hero_description", "Ammattitaitoinen maalaus- ja tasoituspalvelu Helsingissä ja Uudellamaalla."),
        canonical_url=SITE_URL,
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


async def generate_service_page(db, slug: str, css_files, js_files):
    """Generate service page HTML."""
    page = await db.service_pages.find_one({"slug": slug})
    if not page:
        print(f"  Warning: Page not found for slug: {slug}")
        return None
    
    # Remove MongoDB _id
    if '_id' in page:
        del page['_id']
    
    settings = await db.site_settings.find_one({}) or {}
    if '_id' in settings:
        del settings['_id']
    company_name = settings.get("company_name", COMPANY_NAME)
    phone = settings.get("company_phone_primary", COMPANY_PHONE)
    email = settings.get("company_email", COMPANY_EMAIL)
    service_areas = settings.get("service_areas", ["Helsinki", "Espoo", "Vantaa", "Kauniainen", "Uusimaa"])
    
    service_json_ld = build_json_ld_service(page, settings)
    breadcrumb_json_ld = build_json_ld_breadcrumb([
        {"name": "Etusivu", "url": "/"},
        {"name": "Palvelut", "url": "/#palvelut"},
        {"name": page.get("hero_title", ""), "url": f"/{slug}"}
    ])
    combined_json_ld = f'[{service_json_ld},{breadcrumb_json_ld}]'
    
    service_title = page.get("hero_title", "Palvelu")
    areas_template = settings.get("areas_description_template", 
        f"Tarjoamme ammattitaitoisia {{palvelu}} Helsingissä, Espoossa, Vantaalla, Kauniaisissa ja koko Uudenmaan alueella.")
    areas_description = areas_template.replace("{palvelu}", service_title.lower())
    
    why_items = page.get("why_items", settings.get("why_choose_us", [
        "Ammattitaitoiset tekijät", "Laadukkaat materiaalit", "Selkeä hinnoittelu"
    ]))
    
    template = jinja_env.get_template("service_page.html")
    return template.render(
        title=f"{page.get('seo_title', page.get('hero_title', ''))} | {company_name}",
        description=page.get("seo_description", page.get("hero_subtitle", "")),
        keywords=page.get("seo_keywords", ""),
        canonical_url=f"{SITE_URL}/{slug}",
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


async def generate_references_page(db, css_files, js_files):
    """Generate references page HTML."""
    settings = await db.site_settings.find_one({}) or {}
    if '_id' in settings:
        del settings['_id']
    
    references_cursor = db.references.find({})
    references = await references_cursor.to_list(100)
    # Remove _id from each reference
    for ref in references:
        if '_id' in ref:
            del ref['_id']
    
    company_name = settings.get("company_name", COMPANY_NAME)
    
    template = jinja_env.get_template("references.html")
    return template.render(
        title=f"Referenssit | {company_name}",
        description="Tutustu J&B Tasoitus ja Maalaus Oy:n toteuttamiin kohteisiin. Laadukkaita maalaus- ja tasoitustöitä Helsingissä ja Uudellamaalla.",
        canonical_url=f"{SITE_URL}/referenssit",
        og_title=f"Referenssit | {company_name}",
        og_description="Tutustu tekemiimme kohteisiin",
        company_name=company_name,
        references=references,
        subtitle=settings.get("references_subtitle", "Tutustu tekemiimme kohteisiin"),
        css_files=css_files,
        js_files=js_files
    )


async def generate_faq_page(db, css_files, js_files):
    """Generate FAQ page HTML."""
    settings = await db.site_settings.find_one({}) or {}
    if '_id' in settings:
        del settings['_id']
    
    faqs_cursor = db.faqs.find({})
    faqs = await faqs_cursor.to_list(100)
    services_cursor = db.services.find({})
    services = await services_cursor.to_list(100)
    
    # Remove _id from documents
    for faq in faqs:
        if '_id' in faq:
            del faq['_id']
    for service in services:
        if '_id' in service:
            del service['_id']
    
    service_map = {s.get("id"): s.get("title", "Yleinen") for s in services}
    faq_categories = {}
    
    for faq in faqs:
        service_id = faq.get("service_id")
        category_name = service_map.get(service_id, "Yleinen")
        if category_name not in faq_categories:
            faq_categories[category_name] = []
        faq_categories[category_name].append(faq)
    
    categories_list = [{"name": name, "faqs": items} for name, items in faq_categories.items()]
    
    company_name = settings.get("company_name", COMPANY_NAME)
    all_faqs = [faq for category in categories_list for faq in category["faqs"]]
    json_ld = build_json_ld_faq(all_faqs) if all_faqs else None
    
    template = jinja_env.get_template("faq.html")
    return template.render(
        title=f"Usein kysytyt kysymykset | {company_name}",
        description="Vastauksia yleisimpiin kysymyksiin maalaus- ja tasoituspalveluistamme. UKK - hinnoittelu, kotitalousvähennys, työajat ja materiaalit.",
        canonical_url=f"{SITE_URL}/ukk",
        og_title=f"UKK - Usein kysytyt kysymykset | {company_name}",
        og_description="Vastauksia yleisimpiin kysymyksiin maalaus- ja tasoituspalveluistamme.",
        company_name=company_name,
        json_ld=json_ld,
        faq_categories=categories_list,
        css_files=css_files,
        js_files=js_files
    )


async def main():
    print("=" * 60)
    print("SEO Static HTML Generator (Direct DB)")
    print("=" * 60)
    
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'construction_cms')
    
    if not mongo_url:
        print("ERROR: MONGO_URL not set!")
        return
    
    print(f"Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Get React assets
    css_files, js_files = get_react_assets()
    print(f"Found {len(css_files)} CSS files, {len(js_files)} JS files")
    
    # Get all service pages from DB
    service_pages_cursor = db.service_pages.find({})
    service_pages = await service_pages_cursor.to_list(100)
    slugs = [p.get("slug") for p in service_pages if p.get("slug")]
    print(f"Found {len(slugs)} service pages in database")
    
    # Pages to generate
    pages_to_generate = [
        ("Home", "/", "index.html", lambda: generate_home_page(db, css_files, js_files)),
        ("References", "/referenssit", "referenssit/index.html", lambda: generate_references_page(db, css_files, js_files)),
        ("FAQ", "/ukk", "ukk/index.html", lambda: generate_faq_page(db, css_files, js_files)),
    ]
    
    # Add service pages
    for slug in slugs:
        pages_to_generate.append(
            (f"Service: {slug}", f"/{slug}", f"{slug}/index.html", 
             lambda s=slug: generate_service_page(db, s, css_files, js_files))
        )
    
    print(f"\nTotal pages to generate: {len(pages_to_generate)}")
    print()
    
    success_count = 0
    for name, path, output_file, generator in pages_to_generate:
        print(f"Generating {name} ({path})")
        try:
            html = await generator()
            if html:
                # Write to build directory
                build_path = BUILD_DIR / output_file
                build_path.parent.mkdir(parents=True, exist_ok=True)
                build_path.write_text(html, encoding="utf-8")
                
                # Also write to public directory for persistence
                public_path = PUBLIC_DIR / output_file
                public_path.parent.mkdir(parents=True, exist_ok=True)
                public_path.write_text(html, encoding="utf-8")
                
                print(f"  ✓ {output_file}")
                success_count += 1
            else:
                print(f"  ✗ No content generated")
        except Exception as e:
            print(f"  ✗ Error: {e}")
    
    client.close()
    
    # Copy serve.json for proper routing to both directories
    serve_json_content = '''{
  "rewrites": [
    { "source": "/admin", "destination": "/index.html" },
    { "source": "/admin/**", "destination": "/index.html" },
    { "source": "/login", "destination": "/index.html" }
  ]
}'''
    (BUILD_DIR / "serve.json").write_text(serve_json_content, encoding="utf-8")
    (PUBLIC_DIR / "serve.json").write_text(serve_json_content, encoding="utf-8")
    print(f"  ✓ serve.json")
    
    print()
    print("=" * 60)
    print(f"Generation complete: {success_count}/{len(pages_to_generate)} pages")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
