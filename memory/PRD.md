# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga.

## Latest Update: April 1, 2026

### Session 3b: Price Calculator (Hintalaskuri) - COMPLETED

#### Premium Multi-Step Price Calculator
- 6 services with service-specific fields
- Correct Finnish tax calculation: ALV 25.5%, Kotitalousvähennys (35% of labor - 150€ omavastuu, max 1600€/hlö)
- Navbar + Footer matching site design
- Admin panel "Laskuri" tab for full configurability
- Price shown without requiring contact info (competitor differentiator)

**Files:**
- `/app/frontend/src/pages/PriceCalculatorPage.js`
- `/app/frontend/src/components/admin/CalculatorAdmin.js`
- `/app/frontend/src/App.js` (route, import, admin tab, navbar link)
- `/app/backend/server.py` (calculator-config endpoints + default config)
- `/app/backend/generate_static_direct.py` (/hintalaskuri rewrite)

### Session 3a: Areas Admin Panel + Navigation Fix
- AreasAdmin.js CRUD for managing cities
- Service navigation: Hero → general page → city-specific pages

### Session 2: SEO Pre-rendering + Stats Bar
### Session 1: Production SEO & Technical Fixes

## Credentials
- Preview Admin: admin / jbadmin2024
- Production Admin: admin / Mi55iOn%44%

## Pending/Future Tasks

### P1 (High Priority)
- Import 52 FAQs to production
- Google Reviews + Review JSON-LD schema

### P2 (Medium Priority)
- Blog section
- Backend refactoring (server.py → modules)
- Hero section upgrade

### P3 (Low Priority)
- Video testimonials
- Additional schema types
