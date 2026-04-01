# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga.

## Latest Update: April 1, 2026

### Session 3: Areas Admin Panel UI (April 1, 2026)

#### Areas (Locations) Admin Panel - COMPLETED
**Problem:** Backend API for location-specific SEO pages existed but no admin UI to manage cities.

**Solution:** Created `AreasAdmin.js` component with full CRUD:
- New "Alueet" tab in Admin Panel between "Palvelusivut" and "Palvelut"
- List view showing all cities with slug, inessive form, order, and default badge
- Create form with auto-slug generation from Finnish city names
- Edit/Delete functionality (default city Helsinki protected from deletion)
- "Päivitä SEO-sivut" button to regenerate static pages after changes
- Info box explaining how area pages work

**Files Modified:**
- `/app/frontend/src/components/admin/AreasAdmin.js` - NEW: Areas CRUD component
- `/app/frontend/src/App.js` - Added AreasAdmin import, tab, and render block

**Testing:** 100% pass rate (14 backend tests + full Playwright UI verification)

### Session 2: SEO Pre-rendering + Company Stats Bar (April 1, 2026)

#### P0 SEO Fix: Pre-rendered HTML Content for Google Crawler - COMPLETED
**Problem:** Google's crawler saw empty pages with only a `<noscript>` message. SSG templates were empty.

**Solution:** Added semantic HTML content to all 9 SSG templates:
- home.html: Hero, services list, about, contact info
- service_page.html: Full description, features, process steps, service areas
- faq.html: All 52 FAQ Q&A pairs
- references.html: All reference projects with details

#### Company Stats Bar + Trust Badge Relocation - COMPLETED
**Solution:**
- Added dynamic stats bar with dark navy background (#0F172A) to Meistä section
- 4 initial stats: 300+ projects, 3.7M€ revenue, 18 employees, 40,000+ m² painted
- Trust badges moved from footer to stats bar
- Admin panel CRUD for stats

#### Dynamic Footer Service Links - COMPLETED
- Footer service links fetched from DB via `/api/service-pages`

#### Location-Specific SEO Pages (Backend + SSG) - COMPLETED
- Area DB schema, API endpoints, SSG generation for 33 city-specific pages
- Default cities: Helsinki, Espoo, Vantaa, Kauniainen

### Session 1: Production SEO & Technical Fixes (March 2026)
- Flat HTML files for Nginx clean URLs
- Trust badges in footer (now moved to Meistä)
- Technical SEO cleanup (canonicals, sitemap, JSON-LD)
- Reference card pagination
- Internal service links

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
