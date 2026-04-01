# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga.

## Latest Update: April 1, 2026

### Session 3b: Price Calculator (Hintalaskuri) - COMPLETED (April 1, 2026)

#### Premium Multi-Step Price Calculator
**Problem:** No online price estimation tool. Competitors require contact info before showing prices.

**Solution:** Built a premium multi-step wizard calculator at `/hintalaskuri`:
- **6 services** with service-specific fields: Sisämaalaus, Tasoitustyöt, Mikrosementti, Julkisivumaalaus, Kattomaalaus, Julkisivurappaus
- **Multi-step wizard** with smooth animations (Framer Motion)
- **Real-time price preview** during wizard steps
- **Detailed price breakdown:** Labor, Materials, Addons, ALV 25.5%, Kotitalousvähennys (-35%)
- **No contact info required** to see price (competitor differentiator!)
- **Contact form** available optionally after seeing price
- **Admin panel "Laskuri" tab** for full configurability:
  - Global settings (ALV %, kotitalousvähennys, labor %, CTA texts)
  - Per-service base prices (€/m²)
  - Step multipliers for each option
  - Addon prices and toggles

**Files Created/Modified:**
- `/app/frontend/src/pages/PriceCalculatorPage.js` - NEW
- `/app/frontend/src/components/admin/CalculatorAdmin.js` - NEW
- `/app/frontend/src/App.js` - Added imports, route, admin tab, navbar link
- `/app/backend/server.py` - Added calculator-config endpoints + default config
- `/app/backend/generate_static_direct.py` - Added /hintalaskuri rewrite

**Testing:** 100% pass rate (16 backend + full Playwright UI verification)

### Session 3a: Areas Admin Panel + Navigation Fix (April 1, 2026)
- AreasAdmin.js CRUD component for managing cities
- Fixed service navigation: Hero → general page → city-specific pages
- Fixed city variant page logic (only title gets city name)

### Session 2: SEO Pre-rendering + Company Stats Bar
- P0 SEO Fix: Pre-rendered HTML for Google crawler
- Company Stats Bar + Trust Badges in Meistä section
- Dynamic Footer Service Links
- Location-Specific SEO Pages (33 pages × 4 cities)

### Session 1: Production SEO & Technical Fixes
- Flat HTML for Nginx, Technical SEO, Reference pagination

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
- Google Ads appeal - USER VERIFICATION PENDING

### P2 (Medium Priority)
- Blog section for content marketing
- Backend refactoring (split server.py into modules)
- www to non-www redirect via Cloudflare - USER VERIFICATION PENDING
- Hero section upgrade (add stats to hero)

### P3 (Low Priority)
- Video testimonials integration
- Additional schema types
