# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga. Hintalaskuri on müügifunnel.

## Latest Update: April 2, 2026

### Session 5a: Hintalaskuri Page Sections - COMPLETED
- **Added DynamicServicePage sections below calculator**: TrustBadges, Description, Features, WhyChooseUs, Process, ServiceAreas, FAQ, ContactForm, RelatedServices, StrongCTA
- Content is CMS-editable via admin panel (Palvelusivut > Hintalaskuri)
- Shared components exported from `DynamicServicePage.js` and imported in `PriceCalculatorPage.js`
- Hintalaskuri service page auto-seeded on backend startup

### Session 4e: Conditional Step Options - COMPLETED
- Peltikatto shows rust options (ruoste), Tiilikatto shows moss options (sammal)
- Auto-triggers for condition-based addons

### Session 4d: Admin Panel + Slider Upgrade - COMPLETED
### Session 4c: Müügifunnel Upgrade - COMPLETED
### Session 4b: Design & Logic Fixes - COMPLETED
### Session 4a: Premium Hintalaskuri v2 - COMPLETED

## Key Files
- `/app/frontend/src/pages/PriceCalculatorPage.js` - Calculator + service page sections
- `/app/frontend/src/pages/DynamicServicePage.js` - Shared section components (named exports)
- `/app/frontend/src/components/admin/CalculatorAdmin.js` - Admin with tabs + CRUD
- `/app/backend/server.py` - API + calculator config + hintalaskuri page seeding

## Credentials
- Preview Admin: admin / jbadmin2024
- Production Admin: admin / Mi55iOn%44%

## Pending/Future Tasks
### P1
- Import 52 FAQs to production
- Google Reviews + Review JSON-LD schema
- Add FAQs specific to Hintalaskuri (service_id=hintalaskuri) for the FAQ section
### P2
- Blog section
- Backend refactoring (server.py modulaarseks)
- Hero upgrade
### P3
- Video testimonials
- Additional schema types
