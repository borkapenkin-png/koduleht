# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga. Hintalaskuri on müügifunnel.

## Latest Update: April 2, 2026

### Session 4e: Conditional Step Options - COMPLETED
- **Kattomaalaus dynamic condition**: Peltikatto shows rust options (ruoste), Tiilikatto shows moss options (sammal)
- Uses `conditional_on` + `conditional_options` in step config
- Auto-triggers: rust conditions → ruostekäsittely ON, moss conditions → pesu+sammalesto ON
- Downstream selections auto-clear when target_type changes

### Session 4d: Admin Panel + Slider Upgrade - COMPLETED
- Admin packages management (3 tabs per service)
- Admin addon CRUD (label, hint, price, group, badge, warning)
- Katto+Julkisivu slider for floor area input

### Session 4c: Müügifunnel Upgrade - COMPLETED
### Session 4b: Design & Logic Fixes - COMPLETED
### Session 4a: Premium Hintalaskuri v2 - COMPLETED

## Key Files
- `/app/frontend/src/pages/PriceCalculatorPage.js` - Calculator with conditional options
- `/app/frontend/src/components/admin/CalculatorAdmin.js` - Admin with tabs + CRUD
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
