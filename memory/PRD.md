# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga.

## Latest Update: April 2, 2026

### Session 4b: Design & Logic Fixes - COMPLETED
- Hero section + trust badges added to calculator page (matches rest of site)
- Room type multipliers all set to 1.0 (Huone/Kaksio/Kolmio give same price at same area)
- Lisäsävy addon clarified: "100 € / kohde" with hint "Yksi lisävärisävy koko kohteeseen"

### Session 4a: Premium Hintalaskuri v2 - COMPLETED
- 5-step wizard: Palvelu → Kohde → Tarkennukset → Lisävalinnat → Hinta-arvio
- Live sticky price box (desktop right / mobile bottom) showing price RANGE (×0.9 – ×1.15)
- "En tiedä pinta-alaa" option, size_cards step type, addons as cards with hints
- Result page: breakdown, expandable price explanation, 2 CTAs, localStorage persistence
- Finnish tax logic: ALV 25.5%, Kotitalousvähennys 35% labor - 150€

### Session 3: Areas Admin + Navigation + Calculator v1 (superseded)
### Session 2: SEO Pre-rendering + Stats Bar
### Session 1: Production SEO & Technical Fixes

## Key Files
- `/app/frontend/src/pages/PriceCalculatorPage.js` - Calculator with hero
- `/app/backend/server.py` - API + calculator config (lines 1436-1731)
- `/app/frontend/src/App.js` - Routes, Navbar, Footer

## Credentials
- Preview Admin: admin / jbadmin2024
- Production Admin: admin / Mi55iOn%44%

## Pending/Future Tasks
### P1 (High)
- Import 52 FAQs to production
- Google Reviews + Review JSON-LD schema

### P2 (Medium)
- Blog section
- Backend refactoring (server.py → modules)
- Hero section upgrade

### P3 (Low)
- Video testimonials
- Additional schema types
