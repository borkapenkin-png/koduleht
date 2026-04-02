# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga. Hintalaskuri on müügifunnel. SEO optimeerimine kohalike linnade jaoks (Helsinki, Espoo, Vantaa, Kauniainen).

## Latest Update: April 2, 2026

### Session 6: City Variant SEO/Hero Title + Description Overrides - COMPLETED
- **Fixed SEO/Hero title string replacement bug**: City variants no longer get corrupted titles
- **Added structured custom_texts format**: `{service_slug: {text, seo_title, hero_title, seo_description}}`
- **Admin UI**: 4 fields per service in "Alueet" → custom texts: SEO-otsikko, Hero-otsikko, Meta-kuvaus, Uniikki teksti
- **Helsinki support**: Custom texts now also apply to default city (Helsinki) pages
- **Backward compatibility**: Legacy string format still works
- **Files changed**: AreasAdmin.js, DynamicServicePage.js, generate_static_direct.py, server.py

### How it works:
1. **Palvelusivut** = Edit Helsinki base page (template for all cities)
2. **Alueet → custom texts** = Override per city: seo_title, hero_title, seo_description, text

### Previous Sessions: COMPLETED
- Session 5a: Hintalaskuri Page Sections
- Session 4e-4a: Calculator features
- Custom_texts feature, FAQ fixes, 301 redirects, FOUC fix, Sitemap/Canonical fixes

## Key Files
- `/app/frontend/src/components/admin/AreasAdmin.js` - Areas admin with custom_texts UI
- `/app/frontend/src/pages/DynamicServicePage.js` - City variant rendering with custom_texts overrides
- `/app/backend/generate_static_direct.py` - SSG with custom_texts overrides
- `/app/backend/server.py` - API

## Credentials
- Preview Admin: admin / jbadmin2024
- Production Admin: admin / Mi55iOn%44%

## Pending/Future Tasks
### P1
- Import 52 FAQs to production
- Google Reviews + Review JSON-LD schema
### P2
- Blog section
- Backend refactoring (server.py → routes/, models/, utils/)
### P3
- Video testimonials
- Additional schema types
