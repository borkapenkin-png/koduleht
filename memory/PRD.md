# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga. Hintalaskuri on müügifunnel. SEO optimeerimine kohalike linnade jaoks (Helsinki, Espoo, Vantaa, Kauniainen).

## Latest Update: April 2, 2026

### Session 6: City Variant SEO/Hero Title Overrides - COMPLETED
- **Fixed SEO/Hero title string replacement bug**: When Helsinki base page contains "Helsinki, Espoo ja Vantaa", city variants no longer get corrupted (e.g., "Espoo, Espoo ja Vantaa")
- **Added structured custom_texts format**: Changed from `{service_slug: "text"}` to `{service_slug: {text, seo_title, hero_title}}`
- **Admin UI**: Each service in the "Alueet" → city custom texts panel now shows 3 fields: SEO-otsikko, Hero-otsikko, Uniikki teksti
- **Backward compatibility**: Legacy string format still works (normalized to object on load)
- **Files changed**: AreasAdmin.js, DynamicServicePage.js, generate_static_direct.py, server.py (comment)

### Session 5a: Hintalaskuri Page Sections - COMPLETED
- Added DynamicServicePage sections below calculator: TrustBadges, Description, Features, WhyChooseUs, Process, ServiceAreas, FAQ, ContactForm, RelatedServices, StrongCTA
- Content is CMS-editable via admin panel (Palvelusivut > Hintalaskuri)

### Session 4e: Conditional Step Options - COMPLETED
### Session 4d: Admin Panel + Slider Upgrade - COMPLETED
### Session 4c: Müügifunnel Upgrade - COMPLETED
### Session 4b: Design & Logic Fixes - COMPLETED
### Session 4a: Premium Hintalaskuri v2 - COMPLETED

## Key Files
- `/app/frontend/src/components/admin/AreasAdmin.js` - Areas admin with custom_texts UI (SEO/Hero/Text per city/service)
- `/app/frontend/src/pages/DynamicServicePage.js` - City variant rendering with custom_texts overrides
- `/app/backend/generate_static_direct.py` - SSG with custom_texts overrides
- `/app/frontend/src/pages/PriceCalculatorPage.js` - Calculator + service page sections
- `/app/backend/server.py` - API + calculator config

## Credentials
- Preview Admin: admin / jbadmin2024
- Production Admin: admin / Mi55iOn%44%

## Pending/Future Tasks
### P1
- Import 52 FAQs to production
- Google Reviews + Review JSON-LD schema
- Add FAQs specific to Hintalaskuri
### P2
- Blog section
- Backend refactoring (server.py modulaarseks → routes/, models/, utils/)
- Hero upgrade
### P3
- Video testimonials
- Additional schema types
