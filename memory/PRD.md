# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga.

## Latest Update: April 2, 2026

### Session 4: Premium Hintalaskuri v2 - COMPLETED
Complete rewrite of the Price Calculator with premium UX:
- 5-step wizard flow: Palvelu → Kohde → Tarkennukset → Lisävalinnat → Hinta-arvio
- Live sticky price box (desktop right sidebar / mobile bottom bar) showing price RANGE
- Price displayed as range (×0.9 – ×1.15) not exact amount
- "En tiedä pinta-alaa" option for slider steps (shows Pieni/Keskikokoinen/Suuri cards)
- `size_cards` step type for Julkisivumaalaus and Kattomaalaus (categories instead of slider)
- Addons as cards with hint descriptions (e.g., "Usein tehdään samalla")
- Result page: price range, "Mihin arvio perustuu" breakdown, expandable "Miten hinta muodostuu"
- 2 CTAs: "Kysy tarkka tarjous" + "Lähetä kuvat arviota varten"
- localStorage persistence
- Updated Finnish labels for premium feel (no technical jargon in UI)
- Correct Finnish tax logic (ALV 25.5%, Kotitalousvähennys 35% labor - 150€ omavastuu)

**Files:**
- `/app/frontend/src/pages/PriceCalculatorPage.js` (Complete rewrite)
- `/app/backend/server.py` (Updated calculator config with size_cards, dont_know_options, hints)

### Session 3b: Price Calculator v1 (Hintalaskuri) - SUPERSEDED by v2
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
