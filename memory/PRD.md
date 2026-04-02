# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga. Hintalaskuri on müügifunnel.

## Latest Update: April 2, 2026

### Session 4d: Admin Panel + Slider Upgrade - COMPLETED
- **Admin: Packages management** (3 tabs per service: Perustiedot/Lisäpalvelut/Paketit)
  - Package names/descriptions editable
  - Addon checkbox grid per package
  - "Aseta oletukseksi" button
- **Admin: Full addon CRUD** - add/edit/delete with all fields:
  - Label, hint, price (€/m² or fixed), group, badge, warning, price_label
- **Katto+Julkisivu slider**: Changed from size_cards to slider with dont_know_options
  - Client can enter exact house floor area (pohjapinta-ala)
  - "En tiedä" fallback shows size categories

### Session 4c: Müügifunnel Upgrade - COMPLETED
- Good/Better/Best packages, smart auto-triggers, grouped addons, soft warnings, badges

### Session 4b: Design & Logic Fixes - COMPLETED
### Session 4a: Premium Hintalaskuri v2 - COMPLETED
### Earlier Sessions: Areas Admin, SEO, Navigation fixes

## Key Files
- `/app/frontend/src/components/admin/CalculatorAdmin.js` - Admin with tabs + CRUD
- `/app/frontend/src/pages/PriceCalculatorPage.js` - Calculator with packages
- `/app/backend/server.py` - API + calculator config

## Credentials
- Preview Admin: admin / jbadmin2024
- Production Admin: admin / Mi55iOn%44%

## Pending/Future Tasks
### P1
- Import 52 FAQs to production
- Google Reviews + Review JSON-LD schema
### P2
- Blog section, Backend refactoring, Hero upgrade
### P3
- Video testimonials, Additional schema types
