# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga.

## Latest Update: April 1, 2026

### Session 3: Areas Admin Panel + Navigation Fix (April 1, 2026)

#### Areas (Locations) Admin Panel - COMPLETED
- Created `AreasAdmin.js` component with full CRUD (Add/Edit/Delete cities)
- New "Alueet" tab in Admin Panel
- Info box explaining how area pages work
- "Päivitä SEO-sivut" regeneration button

#### Service Navigation Fix - COMPLETED
**Problem:** Hero section linked directly to city-specific pages (e.g., `/maalaustyot-helsinki`) instead of general pages.

**Solution:**
- Updated service `link_url` values in DB: `maalaustyot-helsinki` → `maalaustyot`
- Fixed city variant page logic: only `hero_title` and `seo_title` get city name, all other content stays identical
- **Flow:** Hero → `/maalaustyot` (general) → "Valitse alue" cards → `/maalaustyot-espoo` (city-specific)

**Files Modified:**
- `/app/frontend/src/components/admin/AreasAdmin.js` - NEW
- `/app/frontend/src/App.js` - Added AreasAdmin import, tab, render
- `/app/frontend/src/pages/DynamicServicePage.js` - Fixed city variant replacement logic

### Session 2: SEO Pre-rendering + Company Stats Bar (April 1, 2026)
- P0 SEO Fix: Pre-rendered HTML Content for Google Crawler
- Company Stats Bar + Trust Badge Relocation to Meistä section
- Dynamic Footer Service Links from DB
- Location-Specific SEO Pages Backend + SSG (33 pages for 4 cities × services)

### Session 1: Production SEO & Technical Fixes (March 2026)
- Flat HTML files for Nginx clean URLs
- Technical SEO cleanup (canonicals, sitemap, JSON-LD)
- Reference card pagination, internal service links

## Tech Stack
- Frontend: React 18, TailwindCSS, Framer Motion
- Backend: FastAPI, Motor (MongoDB async)
- Database: MongoDB
- SSG: Python + Jinja2 templates
- Serving: `serve` (static file server)

## Credentials
- Preview Admin: admin / jbadmin2024
- Production Admin: admin / Mi55iOn%44%

## Pending/Future Tasks

### P1 (High Priority)
- Import 52 FAQs to production via admin panel
- Google Reviews + Review JSON-LD schema
- Google Ads appeal ("Compromised Site" suspension) - USER VERIFICATION PENDING

### P2 (Medium Priority)
- Blog section for content marketing
- Backend refactoring (split server.py into modules)
- www to non-www redirect via Cloudflare Page Rule - USER VERIFICATION PENDING
- Hero section upgrade (add stats to hero)

### P3 (Low Priority)
- Price calculator feature
- Video testimonials integration
- Additional schema types
