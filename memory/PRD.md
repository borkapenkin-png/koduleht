# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga.

## Latest Update: April 1, 2026

### Session 2: SEO Pre-rendering + Company Stats Bar (April 1, 2026)

#### P0 SEO Fix: Pre-rendered HTML Content for Google Crawler - COMPLETED
**Problem:** Google's crawler saw empty pages with only a `<noscript>` message in Estonian. SSG templates were empty - no actual HTML content in page body.

**Solution:** Added semantic HTML content to all 9 SSG templates:
- home.html: Hero, services list, about, contact info
- service_page.html: Full description, features, process steps, service areas
- faq.html: All 52 FAQ Q&A pairs (critical for FAQ rich results!)
- references.html: All reference projects with details

**Result:** Google now sees full page content immediately without JavaScript. 100% test pass.

#### Company Stats Bar + Trust Badge Relocation - COMPLETED
**Problem:** Meistä section lacked concrete numbers that competitors prominently display. Trust badges were hidden in footer.

**Solution:**
- Added dynamic stats bar with dark navy background (#0F172A) to Meistä section
- 4 initial stats: 300+ projects, 3.7M€ revenue, 18 employees, 40,000+ m² painted
- Trust badges moved from footer to stats bar (inverted white logos)
- Admin panel CRUD for stats (add/edit/remove via "Yrityksen avainluvut")
- Footer cleaned up (trust badges removed)

**Files Modified:**
- `/app/frontend/src/App.js` - AboutSection redesign, footer cleanup, admin panel stats CRUD
- `/app/backend/server.py` - Added `company_stats` to SiteSettings and SiteSettingsUpdate
- `/app/backend/templates/base.html` - Added `{% block seo_content %}`
- `/app/backend/templates/home.html` - Full homepage content
- `/app/backend/templates/service_page.html` - Full service content
- `/app/backend/templates/faq.html` - All FAQ Q&A
- `/app/backend/templates/references.html` - All references
- `/app/backend/generate_static_direct.py` - Skip public/index.html overwrite

### Session 1: Production SEO & Technical Fixes (March 2026)
- Flat HTML files for Nginx clean URLs
- Trust badges in footer (now moved to Meistä)
- Technical SEO cleanup (canonicals, sitemap, JSON-LD)
- Reference card pagination
- Internal service links

## Competitor Analysis (April 1, 2026)
Top 3 Helsinki competitors analyzed: Priimamaalaus, ILME, Maalausmestari
- J&B strength: 52 FAQs (competitors have 5-7), unique services (mikrosementti, rappaus)
- J&B gaps: No city-specific pages, no blog, no Google reviews on site

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
- Google Ads appeal ("Compromised Site" suspension)
- City-specific service pages (/maalaustyot-espoo, /maalaustyot-vantaa) - SEO gold per competitor analysis

### P2 (Medium Priority)
- Blog section for content marketing
- Backend refactoring (split server.py into modules)
- www to non-www redirect via Cloudflare Page Rule
- Hero section upgrade (add stats to hero as well)

### P3 (Low Priority)
- Price calculator feature
- Video testimonials integration
- Additional schema types
