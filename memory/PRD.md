# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga. Hintalaskuri on müügifunnel. SEO optimeerimine kohalike linnade jaoks (Helsinki, Espoo, Vantaa, Kauniainen).

## Latest Update: April 3, 2026

### Session 7: Etusivu SSG Dynamic + SEO Admin Fields - COMPLETED
- **Etusivu SSG dünaamiliseks**: build/index.html genereeritakse nüüd MongoDB andmetest
- **SEO väljad admin paneeli**: home_seo_title (60 char counter), home_seo_description (160 char counter), home_canonical_url
- **Avainluvut sektsioon**: Lisatud SSG mallile (company_stats)
- **Palvelualueet sektsioon**: Lisatud SSG mallile (areas + service_pages)
- **Automaatne SSG**: Admin salvestamine → SSG käivitub ~15 sek → build/index.html uueneb
- **Files changed**: App.js, server.py, generate_static_direct.py, templates/home.html

### Session 6: City Variant SEO/Hero Title + Description Overrides - COMPLETED
- Fixed SEO/Hero title string replacement bug
- Added structured custom_texts format: {service_slug: {text, seo_title, hero_title, seo_description}}
- Admin UI: 4 fields per service in Alueet → custom texts
- Helsinki support: Custom texts now also apply to default city pages
- Toimialue section: Removed description text, fixed landing page title
- Footer admin: Synced with actual footer content
- Auto SSG: Triggers on settings, service pages, and areas save

### How it works:
1. **Palvelusivut** = Edit Helsinki base page (template for all cities)
2. **Alueet → custom texts** = Override per city: seo_title, hero_title, seo_description, text
3. **Etusivu tab** = SEO title, meta description, canonical URL + all content sections
4. **Admin save → SSG auto-regenerate ~15 sec**

### Previous Sessions: COMPLETED
- Session 5a: Hintalaskuri Page Sections
- Session 4e-4a: Calculator features
- Custom_texts feature, FAQ fixes, 301 redirects, FOUC fix, Sitemap/Canonical fixes

## Key Files
- `/app/frontend/src/App.js` - Main app with admin panel, homepage, footer
- `/app/frontend/src/components/admin/AreasAdmin.js` - Areas admin with custom_texts UI
- `/app/frontend/src/pages/DynamicServicePage.js` - City variant rendering
- `/app/backend/generate_static_direct.py` - SSG script (etusivu + service pages)
- `/app/backend/templates/home.html` - Home page SSG template
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
