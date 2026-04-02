# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga. Hintalaskuri on ehitatud müügifunnelina, mitte lihtsalt kalkulaatorina.

## Latest Update: April 2, 2026

### Session 4c: Müügifunnel Upgrade (Packages + Smart Logic) - COMPLETED
- **Good/Better/Best packages**: Perus, Suositeltu (default), Premium per teenus
- **Smart auto-triggers**: Condition-based auto-selection (sammal → pesu+sammalesto, epätasainen → tasoitus)
- **Grouped addons**: Esityöt, Tarvittaessa, Lisäpalvelut sections
- **Soft warnings**: Amber text when deselecting recommended addons
- **Badges**: "Suositeltu" ja "Usein valitaan" on addon cards
- **New addons (painter logic)**: 30+ addons across 6 services:
  - Sisämaalaus: +halkeamien korjaus, listojen maalaus, ovien maalaus
  - Tasoitustyöt: +kulmasuojat, halkeamien korjaus, hionta
  - Mikrosementti: +alustan tasoitus, vedeneristys
  - Julkisivumaalaus: +pesu, vanhan maalin poisto, kaksinkertainen maalaus, ikkunoiden maalaus
  - Kattomaalaus: +ruostekäsittely, paikkakorjaukset, saumojen tiivistys, kaksinkertainen maalaus, kourujen puhdistus
  - Julkisivurappaus: +halkeamien korjaus, vanhan rappauksen poisto, pintakäsittely
- **Updated CTAs**: "Pyydä tarkka tarjous (maksuton)" + "Lähetä kuvat nopeaa arviota varten"
- **Price box context**: "Hinta tarkentuu yleensä ±10 %"

### Session 4b: Design & Logic Fixes - COMPLETED
- Hero section + trust badges added to calculator page
- Room type multipliers set to 1.0
- Lisäsävy addon clarified: "100 € / kohde"

### Session 4a: Premium Hintalaskuri v2 - COMPLETED
- 5-step wizard, live sticky price box, price as RANGE
- "En tiedä pinta-alaa", size_cards, localStorage persistence

### Earlier Sessions
- Session 3: Areas Admin + Navigation
- Session 2: SEO Pre-rendering + Stats Bar
- Session 1: Production SEO & Technical Fixes

## Key Files
- `/app/frontend/src/pages/PriceCalculatorPage.js` - Calculator with packages, auto-triggers, grouped addons
- `/app/backend/server.py` - API + calculator config (services, packages, auto_triggers, addons with groups/badges/warnings)
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
