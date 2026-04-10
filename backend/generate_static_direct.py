#!/usr/bin/env python3
"""
Static HTML Generator for SEO - Direct Database Version
Generates pre-rendered HTML pages directly from MongoDB without needing the backend running.
This is used during the build process.
"""

import asyncio
import os
import json
import logging
import glob
from datetime import datetime
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
SITE_URL = os.environ.get("SITE_URL", "https://www.jbtasoitusmaalaus.fi")

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
    """Get CSS and JS files from React build using asset-manifest.json for reliability."""
    css_files = []
    js_files = []
    
    if not BUILD_DIR.exists():
        return css_files, js_files
    
    # Primary: read from asset-manifest.json (always correct after build)
    manifest_path = BUILD_DIR / "asset-manifest.json"
    if manifest_path.exists():
        try:
            manifest = json.loads(manifest_path.read_text())
            files = manifest.get("files", {})
            if "main.css" in files:
                css_files.append(files["main.css"])
            if "main.js" in files:
                js_files.append(files["main.js"])
            if css_files or js_files:
                return css_files, js_files
        except Exception as e:
            logging.warning(f"Failed to read asset-manifest.json: {e}")
    
    # Fallback: scan directories
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
        "@id": f"{SITE_URL}/#organization",
        "name": settings.get("company_name", COMPANY_NAME),
        "description": settings.get("hero_description", "Ammattitaitoinen maalaus- ja tasoituspalvelu Uudellamaalla"),
        "url": SITE_URL,
        "telephone": settings.get("company_phone_primary", COMPANY_PHONE),
        "email": settings.get("company_email", COMPANY_EMAIL),
        "address": {
            "@type": "PostalAddress",
            "streetAddress": settings.get("company_address", "Sienitie 25"),
            "addressLocality": settings.get("company_city", "Helsinki"),
            "postalCode": settings.get("company_postal_code", "00760"),
            "addressCountry": "FI"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "60.2341",
            "longitude": "25.0722"
        },
        "areaServed": [
            {"@type": "City", "name": "Helsinki"},
            {"@type": "City", "name": "Espoo"},
            {"@type": "City", "name": "Vantaa"},
            {"@type": "City", "name": "Kauniainen"},
            {"@type": "AdministrativeArea", "name": "Uusimaa"}
        ],
        "priceRange": "$$",
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "07:00",
            "closes": "18:00"
        },
        "sameAs": [
            settings.get("facebook_url", ""),
            settings.get("instagram_url", "")
        ],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Maalaus- ja tasoituspalvelut",
            "itemListElement": [
                {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Sisämaalaus"}},
                {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Ulkomaalaus"}},
                {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Tasoitustyöt"}},
                {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Julkisivumaalaus"}},
                {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Mikrosementti"}}
            ]
        }
    }
    # Remove empty sameAs links
    schema["sameAs"] = [url for url in schema["sameAs"] if url]
    if not schema["sameAs"]:
        del schema["sameAs"]
    return json.dumps(schema, ensure_ascii=False)


def build_json_ld_service(page: dict, settings: dict) -> str:
    service_name = page.get("hero_title", page.get("seo_title", ""))
    schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": service_name,
        "description": page.get("seo_description", page.get("hero_subtitle", "")),
        "provider": {
            "@type": "LocalBusiness",
            "@id": f"{SITE_URL}/#organization",
            "name": settings.get("company_name", COMPANY_NAME),
            "telephone": settings.get("company_phone_primary", COMPANY_PHONE),
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Helsinki",
                "addressCountry": "FI"
            }
        },
        "areaServed": [
            {"@type": "City", "name": "Helsinki"},
            {"@type": "City", "name": "Espoo"},
            {"@type": "City", "name": "Vantaa"}
        ],
        "serviceType": service_name,
        "offers": {
            "@type": "Offer",
            "availability": "https://schema.org/InStock",
            "priceSpecification": {
                "@type": "PriceSpecification",
                "priceCurrency": "EUR"
            }
        },
        "termsOfService": f"{SITE_URL}/#yhteystiedot"
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
    
    # Get areas for Palvelualueet section
    areas = await db.areas.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    
    # Get service pages for palvelualueet links
    service_pages = await db.service_pages.find({}, {"_id": 0, "slug": 1, "hero_title": 1}).to_list(100)
    
    company_name = settings.get("company_name", COMPANY_NAME)
    json_ld = build_json_ld_local_business(settings)
    
    # SEO fields - use admin overrides or defaults
    seo_title = settings.get("home_seo_title") or f"{company_name} | Maalaus ja tasoituspalvelut Helsinki"
    seo_description = settings.get("home_seo_description") or settings.get("hero_description", "Ammattitaitoinen maalaus- ja tasoituspalvelu Helsingissä ja Uudellamaalla.")
    canonical_url = settings.get("home_canonical_url") or SITE_URL
    
    template = jinja_env.get_template("home.html")
    return template.render(
        title=seo_title,
        description=seo_description,
        canonical_url=canonical_url,
        og_title=seo_title,
        og_description=seo_description,
        og_image=settings.get("hero_image_url"),
        company_name=company_name,
        json_ld=json_ld,
        settings=settings,
        services=template_services,
        areas=areas,
        service_pages=service_pages,
        css_files=css_files,
        js_files=js_files
    )


async def generate_service_page(db, slug: str, css_files, js_files, area_override=None):
    """Generate service page HTML. If area_override is provided, generate a city variant."""
    # For city variants, find the base (Helsinki) page
    if area_override:
        # Find the base page - remove the area suffix to get the original slug
        area_suffix = f"-{area_override['slug']}"
        if slug.endswith(area_suffix):
            base_page_slug = slug[:-len(area_suffix)]
        else:
            base_page_slug = slug
        # Try the base slug first, then the Helsinki-suffixed version
        page = await db.service_pages.find_one({"slug": base_page_slug})
        if not page:
            default_area = await db.areas.find_one({"is_default": True}, {"_id": 0})
            default_slug = default_area.get("slug", "helsinki") if default_area else "helsinki"
            page = await db.service_pages.find_one({"slug": f"{base_page_slug}-{default_slug}"})
    else:
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
    
    # For city variants, replace city references in content
    if area_override:
        default_area = await db.areas.find_one({"is_default": True}, {"_id": 0})
        default_name = default_area.get("name", "Helsinki") if default_area else "Helsinki"
        default_inessive = default_area.get("name_inessive", "Helsingissä") if default_area else "Helsingissä"
        target_name = area_override["name"]
        target_inessive = area_override["name_inessive"]
        
        def replace_city(text):
            if not text or not isinstance(text, str):
                return text
            return text.replace(default_inessive, target_inessive).replace(default_name, target_name).replace(default_inessive.lower(), target_inessive.lower()).replace(default_name.lower(), target_name.lower())
        
        # Clone page and replace city references
        page = dict(page)
        for key in ["hero_title", "hero_subtitle", "seo_title", "seo_description", "description_text", "description_title", "areas_text", "areas_title", "features_title", "why_title", "process_title"]:
            if key in page and page[key]:
                page[key] = replace_city(page[key])
        # Replace in features
        if page.get("features"):
            page["features"] = [{"title": replace_city(f.get("title", "")), "description": replace_city(f.get("description", ""))} for f in page["features"]]
        
        # Apply city-specific overrides from custom_texts
        full_area = await db.areas.find_one({"slug": area_override["slug"]}, {"_id": 0})
        if full_area:
            custom_texts = full_area.get("custom_texts", {})
            area_suffix = f"-{area_override['slug']}"
            base_service = slug[:-len(area_suffix)] if slug.endswith(area_suffix) else slug
            city_entry = custom_texts.get(base_service, "")
            # Handle both new object format and legacy string format
            if isinstance(city_entry, dict):
                if city_entry.get("seo_title"):
                    page["seo_title"] = city_entry["seo_title"]
                if city_entry.get("hero_title"):
                    page["hero_title"] = city_entry["hero_title"]
                if city_entry.get("seo_description"):
                    page["seo_description"] = city_entry["seo_description"]
                if city_entry.get("text"):
                    existing_desc = page.get("description_text", "") or ""
                    page["description_text"] = existing_desc + f'<div class="city-specific-content"><p>{city_entry["text"]}</p></div>'
            elif isinstance(city_entry, str) and city_entry:
                existing_desc = page.get("description_text", "") or ""
                page["description_text"] = existing_desc + f'<div class="city-specific-content"><p>{city_entry}</p></div>'
    
    # Get all areas for "other areas" section
    areas = await db.areas.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    
    # Apply custom_texts for default area pages (e.g., Helsinki) - not handled by area_override
    if not area_override:
        for area in areas:
            if slug.endswith(f"-{area['slug']}"):
                custom_texts = area.get("custom_texts", {})
                base_service = slug[:-len(f"-{area['slug']}")]
                city_entry = custom_texts.get(base_service, "")
                if isinstance(city_entry, dict):
                    if city_entry.get("seo_title"):
                        page["seo_title"] = city_entry["seo_title"]
                    if city_entry.get("hero_title"):
                        page["hero_title"] = city_entry["hero_title"]
                    if city_entry.get("seo_description"):
                        page["seo_description"] = city_entry["seo_description"]
                    if city_entry.get("text"):
                        existing_desc = page.get("description_text", "") or ""
                        page["description_text"] = existing_desc + f'<div class="city-specific-content"><p>{city_entry["text"]}</p></div>'
                elif isinstance(city_entry, str) and city_entry:
                    existing_desc = page.get("description_text", "") or ""
                    page["description_text"] = existing_desc + f'<div class="city-specific-content"><p>{city_entry}</p></div>'
                break
    
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
    
    # Build title - avoid duplication if seo_title already contains company name
    seo_title = page.get('seo_title', page.get('hero_title', ''))
    if company_name.lower() in seo_title.lower() or "j&b" in seo_title.lower() or "j & b" in seo_title.lower():
        page_title = seo_title
    else:
        page_title = f"{seo_title} | {company_name}"
    
    # Compute base_slug for linking to other city variants
    base_slug = slug
    for area in areas:
        if slug.endswith(f"-{area['slug']}"):
            base_slug = slug.replace(f"-{area['slug']}", "")
            break
    
    return template.render(
        title=page_title,
        description=page.get("seo_description", page.get("hero_subtitle", "")),
        keywords=page.get("seo_keywords", ""),
        canonical_url=f"{SITE_URL}/{slug}",
        og_title=seo_title,
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
        areas=areas,
        base_slug=base_slug,
        current_area_slug=area_override["slug"] if area_override else None,
        css_files=css_files,
        js_files=js_files
    )


async def generate_general_service_page(db, base_slug: str, base_page, css_files, js_files):
    """Generate general service overview page (e.g., /maalaustyot) with area selection."""
    settings = await db.site_settings.find_one({}) or {}
    if '_id' in settings:
        del settings['_id']
    
    company_name = settings.get("company_name", COMPANY_NAME)
    areas = await db.areas.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    
    # Use the base page info but make it general (no city name)
    page = dict(base_page)
    if '_id' in page:
        del page['_id']
    
    # Remove city from title for general page
    default_area = await db.areas.find_one({"is_default": True}, {"_id": 0})
    default_name = default_area.get("name", "Helsinki") if default_area else "Helsinki"
    default_inessive = default_area.get("name_inessive", "Helsingissä") if default_area else "Helsingissä"
    
    def remove_city(text):
        if not text or not isinstance(text, str):
            return text
        result = text.replace(f" {default_inessive}", "").replace(f" {default_name}", "")
        result = result.replace(f" {default_inessive.lower()}", "").replace(f" {default_name.lower()}", "")
        return result.strip()
    
    general_title = remove_city(page.get("hero_title", ""))
    general_subtitle = page.get("hero_subtitle", "")
    
    seo_title = f"{general_title} | {company_name}"
    seo_description = f"{general_title} - ammattitaitoiset palvelut Helsingissä, Espoossa, Vantaalla ja koko Uudellamaalla. Valitse alue."
    
    template = jinja_env.get_template("service_general.html")
    return template.render(
        title=seo_title,
        description=seo_description,
        canonical_url=f"{SITE_URL}/{base_slug}",
        og_title=seo_title,
        og_description=seo_description,
        og_image=page.get("hero_image_url"),
        company_name=company_name,
        json_ld=build_json_ld_service(page, settings),
        page=page,
        general_title=general_title,
        general_subtitle=general_subtitle,
        settings=settings,
        areas=areas,
        base_slug=base_slug,
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
    
    # Build JSON-LD for references page (ItemList schema)
    json_ld = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": f"Referenssit - {company_name}",
        "description": "Tutustu J&B Tasoitus ja Maalaus Oy:n toteuttamiin kohteisiin.",
        "numberOfItems": len(references),
        "itemListElement": []
    }
    for i, ref in enumerate(references):
        json_ld["itemListElement"].append({
            "@type": "ListItem",
            "position": i + 1,
            "name": ref.get("name", ""),
            "description": ref.get("type", "")
        })
    
    template = jinja_env.get_template("references.html")
    return template.render(
        title=f"Referenssit | {company_name}",
        description="Tutustu J&B Tasoitus ja Maalaus Oy:n toteuttamiin kohteisiin. Laadukkaita maalaus- ja tasoitustöitä Helsingissä ja Uudellamaalla.",
        canonical_url=f"{SITE_URL}/referenssit",
        og_title=f"Referenssit | {company_name}",
        og_description="Tutustu tekemiimme kohteisiin",
        company_name=company_name,
        json_ld=json.dumps(json_ld, ensure_ascii=False),
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
    
    if not css_files or not js_files:
        print("WARNING: No CSS or JS files found! Skipping SSG to avoid broken HTML.")
        client.close()
        return 0
    
    # Get all service pages from DB
    service_pages_cursor = db.service_pages.find({})
    service_pages = await service_pages_cursor.to_list(100)
    slugs = [p.get("slug") for p in service_pages if p.get("slug")]
    print(f"Found {len(slugs)} service pages in database")
    
    # Get all areas from DB
    areas = await db.areas.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    default_area = next((a for a in areas if a.get("is_default")), areas[0] if areas else {"slug": "helsinki", "name": "Helsinki", "name_inessive": "Helsingissä"})
    non_default_areas = [a for a in areas if not a.get("is_default")]
    print(f"Found {len(areas)} areas: {', '.join(a['name'] for a in areas)}")
    
    # Pages to generate
    pages_to_generate = [
        ("Home", "/", "index.html", lambda: generate_home_page(db, css_files, js_files)),
        ("References", "/referenssit", "referenssit/index.html", lambda: generate_references_page(db, css_files, js_files)),
        ("FAQ", "/ukk", "ukk/index.html", lambda: generate_faq_page(db, css_files, js_files)),
    ]
    
    # For each service page (Helsinki/default version):
    # 1. Generate the original city-specific page (e.g., /maalaustyot-helsinki)
    # 2. Generate the general page (e.g., /maalaustyot)
    # 3. Generate city variants (e.g., /maalaustyot-espoo, /maalaustyot-vantaa)
    for sp in service_pages:
        slug = sp.get("slug")
        if not slug:
            continue
        
        # Compute base_slug (remove default area suffix)
        base_slug = slug
        if slug.endswith(f"-{default_area['slug']}"):
            base_slug = slug[:-len(f"-{default_area['slug']}")]
        
        # 1. Original page (e.g., /maalaustyot-helsinki)
        pages_to_generate.append(
            (f"Service: {slug}", f"/{slug}", f"{slug}/index.html",
             lambda s=slug: generate_service_page(db, s, css_files, js_files))
        )
        
        # 2. General page REMOVED (duplicate of Helsinki) - redirect added in serve.json
        # /maalaustyot → 301 → /maalaustyot-helsinki
        
        # 3. City variants for non-default areas
        for area in non_default_areas:
            variant_slug = f"{base_slug}-{area['slug']}"
            pages_to_generate.append(
                (f"Service: {variant_slug}", f"/{variant_slug}", f"{variant_slug}/index.html",
                 lambda vs=variant_slug, a=area: generate_service_page(db, vs, css_files, js_files, area_override=a))
            )
        
        # 4. Default city variant if slug doesn't already end with default area
        #    e.g., /hintalaskuri needs /hintalaskuri-helsinki too
        if not slug.endswith(f"-{default_area['slug']}"):
            default_variant_slug = f"{base_slug}-{default_area['slug']}"
            pages_to_generate.append(
                (f"Service: {default_variant_slug}", f"/{default_variant_slug}", f"{default_variant_slug}/index.html",
                 lambda dvs=default_variant_slug, da=default_area: generate_service_page(db, dvs, css_files, js_files, area_override=da))
            )
    
    print(f"\nTotal pages to generate: {len(pages_to_generate)}")
    print()
    
    success_count = 0
    for name, path, output_file, generator in pages_to_generate:
        print(f"Generating {name} ({path})")
        try:
            html = await generator()
            if html:
                # Write to build directory - /slug/index.html format
                build_path = BUILD_DIR / output_file
                build_path.parent.mkdir(parents=True, exist_ok=True)
                build_path.write_text(html, encoding="utf-8")
                
                # Write subpages to public directory for persistence
                # SKIP public/index.html to avoid breaking CRA dev server
                if output_file != "index.html":
                    public_path = PUBLIC_DIR / output_file
                    public_path.parent.mkdir(parents=True, exist_ok=True)
                    public_path.write_text(html, encoding="utf-8")
                
                # ALSO create /slug.html for Nginx clean URL support
                # This allows Nginx's try_files $uri $uri.html to work
                if output_file != "index.html" and output_file.endswith("/index.html"):
                    slug_name = output_file.replace("/index.html", "")
                    flat_file = f"{slug_name}.html"
                    (BUILD_DIR / flat_file).write_text(html, encoding="utf-8")
                    (PUBLIC_DIR / flat_file).write_text(html, encoding="utf-8")
                    print(f"  ✓ {output_file} + {flat_file}")
                else:
                    print(f"  ✓ {output_file}")
                success_count += 1
            else:
                print(f"  ✗ No content generated")
        except Exception as e:
            print(f"  ✗ Error: {e}")
    
    client.close()
    
    # Collect all generated page slugs for routing configs
    all_slugs = set()
    for name, path, output_file, generator in pages_to_generate:
        if path != "/" and path.startswith("/"):
            all_slugs.add(path.lstrip("/"))
    
    # Copy serve.json for proper routing
    serve_redirects = []
    for slug in sorted(all_slugs):
        serve_redirects.append({"source": f"/{slug}/", "destination": f"/{slug}", "type": 301})
    
    # Add 301 redirects from general service pages to Helsinki (default) versions
    # e.g., /maalaustyot → /maalaustyot-helsinki
    for sp in service_pages:
        sp_slug = sp.get("slug", "")
        if sp_slug.endswith(f"-{default_area['slug']}"):
            base = sp_slug[:-len(f"-{default_area['slug']}")]
            serve_redirects.append({"source": f"/{base}", "destination": f"/{sp_slug}", "type": 301})
            serve_redirects.append({"source": f"/{base}/", "destination": f"/{sp_slug}", "type": 301})
    
    serve_json_obj = {
        "cleanUrls": True,
        "trailingSlash": False,
        "redirects": serve_redirects,
        "rewrites": [
            { "source": "/admin", "destination": "/index.html" },
            { "source": "/admin/**", "destination": "/index.html" },
            { "source": "/login", "destination": "/index.html" }
        ],
        "headers": [
            {
                "source": "**/*.html",
                "headers": [
                    { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" },
                    { "key": "Pragma", "value": "no-cache" }
                ]
            },
            {
                "source": "index.html",
                "headers": [
                    { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" },
                    { "key": "Pragma", "value": "no-cache" }
                ]
            }
        ]
    }
    serve_json_content = json.dumps(serve_json_obj, indent=2)
    (BUILD_DIR / "serve.json").write_text(serve_json_content, encoding="utf-8")
    (PUBLIC_DIR / "serve.json").write_text(serve_json_content, encoding="utf-8")
    print(f"  ✓ serve.json ({len(serve_redirects)} redirects)")
    
    # Create _redirects 
    redirects_lines = []
    for slug in sorted(all_slugs):
        redirects_lines.append(f"/{slug}/ /{slug} 301")
        redirects_lines.append(f"/{slug} /{slug}/index.html 200")
    redirects_lines.append("/* /index.html 200")
    redirects_content = "\n".join(redirects_lines)
    (BUILD_DIR / "_redirects").write_text(redirects_content, encoding="utf-8")
    (PUBLIC_DIR / "_redirects").write_text(redirects_content, encoding="utf-8")
    print(f"  ✓ _redirects")
    
    # Create vercel.json
    vercel_rewrites = []
    vercel_redirects = []
    for slug in sorted(all_slugs):
        vercel_redirects.append({"source": f"/{slug}/", "destination": f"/{slug}", "permanent": True})
        vercel_rewrites.append({"source": f"/{slug}", "destination": f"/{slug}/index.html"})
    vercel_rewrites.append({"source": "/((?!api|static|.*\\.).*)", "destination": "/index.html"})
    vercel_json_obj = {"redirects": vercel_redirects, "rewrites": vercel_rewrites}
    vercel_json_content = json.dumps(vercel_json_obj, indent=2)
    (BUILD_DIR / "vercel.json").write_text(vercel_json_content, encoding="utf-8")
    (PUBLIC_DIR / "vercel.json").write_text(vercel_json_content, encoding="utf-8")
    print(f"  ✓ vercel.json")
    
    # Create .htaccess
    htaccess_lines = [
        "<IfModule mod_rewrite.c>",
        "  RewriteEngine On",
        "  RewriteBase /",
        "  ",
        "  # Remove trailing slash (301 redirect)",
        "  RewriteCond %{REQUEST_FILENAME} !-d",
        "  RewriteCond %{REQUEST_URI} (.+)/$",
        "  RewriteRule ^ %1 [R=301,L]",
        "  "
    ]
    for slug in sorted(all_slugs):
        htaccess_lines.append(f"  RewriteRule ^{slug}$ {slug}/index.html [L]")
    htaccess_lines.extend([
        "  ",
        "  # SPA fallback",
        "  RewriteCond %{REQUEST_FILENAME} !-f",
        "  RewriteCond %{REQUEST_FILENAME} !-d",
        "  RewriteRule . /index.html [L]",
        "</IfModule>"
    ])
    htaccess_content = "\n".join(htaccess_lines)
    (BUILD_DIR / ".htaccess").write_text(htaccess_content, encoding="utf-8")
    (PUBLIC_DIR / ".htaccess").write_text(htaccess_content, encoding="utf-8")
    print(f"  ✓ .htaccess")
    
    # Generate sitemap.xml
    today = datetime.now().strftime('%Y-%m-%d')
    sitemap_urls = [SITE_URL]
    for slug in sorted(all_slugs):
        sitemap_urls.append(f"{SITE_URL}/{slug}")
    
    sitemap_entries = []
    for url in sitemap_urls:
        sitemap_entries.append(f'  <url>\n    <loc>{url}</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>monthly</changefreq>\n  </url>')
    
    sitemap_xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(sitemap_entries)}
</urlset>'''
    (BUILD_DIR / "sitemap.xml").write_text(sitemap_xml, encoding="utf-8")
    (PUBLIC_DIR / "sitemap.xml").write_text(sitemap_xml, encoding="utf-8")
    print(f"  ✓ sitemap.xml ({len(sitemap_urls)} URLs)")
    
    print()
    print("=" * 60)
    print(f"Generation complete: {success_count}/{len(pages_to_generate)} pages")
    print("=" * 60)


async def run_ssg_with_db(db):
    """Run SSG using an existing database connection (called from server.py)."""
    try:
        css_files, js_files = get_react_assets()
        
        service_pages_cursor = db.service_pages.find({})
        service_pages = await service_pages_cursor.to_list(100)
        slugs = [p.get("slug") for p in service_pages if p.get("slug")]
        
        areas = await db.areas.find({}, {"_id": 0}).sort("order", 1).to_list(100)
        default_area = next((a for a in areas if a.get("is_default")), areas[0] if areas else {"slug": "helsinki", "name": "Helsinki", "name_inessive": "Helsingissä"})
        non_default_areas = [a for a in areas if not a.get("is_default")]
        
        pages_to_generate = [
            ("Home", "/", "index.html", lambda: generate_home_page(db, css_files, js_files)),
            ("References", "/referenssit", "referenssit/index.html", lambda: generate_references_page(db, css_files, js_files)),
            ("FAQ", "/ukk", "ukk/index.html", lambda: generate_faq_page(db, css_files, js_files)),
        ]
        
        for sp in service_pages:
            slug = sp.get("slug")
            if not slug:
                continue
            base_slug = slug
            if slug.endswith(f"-{default_area['slug']}"):
                base_slug = slug[:-len(f"-{default_area['slug']}")]
            
            pages_to_generate.append(
                (f"Service: {slug}", f"/{slug}", f"{slug}/index.html",
                 lambda s=slug: generate_service_page(db, s, css_files, js_files))
            )
            
            for area in non_default_areas:
                variant_slug = f"{base_slug}-{area['slug']}"
                pages_to_generate.append(
                    (f"Variant: {variant_slug}", f"/{variant_slug}", f"{variant_slug}/index.html",
                     lambda s=base_slug, a=area: generate_service_page(db, f"{s}-{default_area['slug']}", css_files, js_files, area_override=a))
                )
        
        success_count = 0
        for name, path_str, filename, generator_fn in pages_to_generate:
            try:
                html = await generator_fn()
                if html:
                    output_path = BUILD_DIR / filename
                    output_path.parent.mkdir(parents=True, exist_ok=True)
                    output_path.write_text(html, encoding="utf-8")
                    alt_path = BUILD_DIR / f"{filename.replace('/index.html', '.html')}"
                    if filename.endswith('/index.html') and filename != 'index.html':
                        alt_path.write_text(html, encoding="utf-8")
                    success_count += 1
            except Exception as e:
                logging.error(f"SSG error for {name}: {e}")
        
        logging.info(f"SSG in-process complete: {success_count}/{len(pages_to_generate)} pages")
        
        # Generate sitemap.xml with proper priority values (same logic as API endpoint)
        try:
            today = datetime.now().strftime('%Y-%m-%d')
            urls = []
            urls.append(("", "weekly", "1.0"))
            urls.append(("referenssit", "monthly", "0.7"))
            urls.append(("ukk", "monthly", "0.7"))
            
            service_pages_list = await db.service_pages.find({}, {"_id": 0, "slug": 1}).to_list(100)
            for sp in service_pages_list:
                slug = sp.get("slug", "")
                if not slug:
                    continue
                base_slug = slug
                if default_area and slug.endswith(f"-{default_area['slug']}"):
                    base_slug = slug[:-len(f"-{default_area['slug']}")]
                urls.append((slug, "monthly", "0.9"))
                for area in non_default_areas:
                    variant_slug = f"{base_slug}-{area['slug']}"
                    if variant_slug != slug:
                        urls.append((variant_slug, "monthly", "0.8"))
                if default_area and not slug.endswith(f"-{default_area['slug']}"):
                    default_variant = f"{base_slug}-{default_area['slug']}"
                    urls.append((default_variant, "monthly", "0.8"))
            
            entries = []
            for path_val, freq, prio in urls:
                loc = f"{SITE_URL}/{path_val}" if path_val else SITE_URL
                entries.append(f'  <url>\n    <loc>{loc}</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>{freq}</changefreq>\n    <priority>{prio}</priority>\n  </url>')
            
            sitemap_xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(entries)}
</urlset>'''
            (BUILD_DIR / "sitemap.xml").write_text(sitemap_xml, encoding="utf-8")
            if PUBLIC_DIR.exists():
                (PUBLIC_DIR / "sitemap.xml").write_text(sitemap_xml, encoding="utf-8")
            # Also write to nginx production root if it exists
            nginx_root = Path("/usr/share/nginx/html")
            if nginx_root.exists():
                (nginx_root / "sitemap.xml").write_text(sitemap_xml, encoding="utf-8")
            logging.info(f"Sitemap updated: {len(urls)} URLs with priorities")
        except Exception as e:
            logging.error(f"Sitemap generation error: {e}")
        
        return success_count
    except Exception as e:
        logging.error(f"SSG run_ssg_with_db error: {e}")
        return 0


if __name__ == "__main__":
    asyncio.run(main())
