# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga. Hintalaskuri on müügifunnel. SEO optimeerimine kohalike linnade jaoks (Helsinki, Espoo, Vantaa, Kauniainen).

## Latest Update: April 8, 2026

### Session 9: Hintalaskuri Hard Patch — Surface Options, Package Removal, Admin Texts - COMPLETED
**Changes:**
- **Sisämaalaus surface step**: Added new "Mitä pintoja maalataan?" step with 3 options (Seinät/2.0×, Katot/1.0×, Seinät+katot/3.0×) using `area_multiplier` field
- **area_multiplier logic**: New calculation: `effectiveArea = floorArea × areaMultiplier`, used for base price and addon pricing
- **helper_text**: Area slider now supports `helper_text` field from config (Sisämaalaus shows floor area → paintable area guidance)
- **Package removal**: Removed Perus/Suositeltu/Premium package selector from customer flow. DB/admin data preserved for backward compat.
- **Admin enhancements**: Step titles editable, option labels/descriptions editable, area_multiplier (×m²) inputs, global settings: addons_step_title, addons_step_subtitle, disclaimer textarea
- **Backend migration**: `migrate_calculator_surface_step()` auto-adds surface step + helper_text on startup
- **Files changed**: PriceCalculatorPage.js, CalculatorAdmin.js, server.py

### Session 8: Hintalaskuri Admin Centralization & Page Restructure - COMPLETED
- Laskuri-välilehteen lisätty "Sivun SEO & Hero" -osio
- Hintalaskuri piilotettu Palvelusivut-listasta
- Poistettu turhat markkinointiosiot (TrustBadges, Description, Features, WhyChoose, ServiceAreas)

### Earlier Sessions: COMPLETED
- Session 7: Etusivu SSG Dynamic + SEO Admin Fields
- Session 6: City Variant SEO/Hero Title + Description Overrides
- Sessions 1-5: Calculator features, FAQ, footer redesign, FOUC fix, express SSR server

## Data Architecture
### calculator_config.services[].steps[]
- `type: "cards"` — options can have `multiplier` (price) and/or `area_multiplier` (area)
- `type: "slider"` — supports `helper_text` for guidance text
- `type: "size_cards"` — options with `area_value`

### calculator_config.global_settings
- tax_rate, kotitalousvahennys_rate, kotitalousvahennys_max_per_person, labor_percentage, material_percentage
- cta_title, cta_subtitle, disclaimer
- addons_step_title, addons_step_subtitle

## Key Files
- `/app/frontend/src/pages/PriceCalculatorPage.js` - Calculator with area_multiplier logic
- `/app/frontend/src/components/admin/CalculatorAdmin.js` - Calculator admin + SEO/Hero
- `/app/frontend/src/components/admin/ServicePagesAdmin.js` - Service pages (hintalaskuri filtered)
- `/app/frontend/src/App.js` - Main app, Footer, FOUC
- `/app/backend/server.py` - API + migration + SSG

## Credentials
- Preview Admin: admin / jbadmin2024
- Production Admin: admin / Mi55iOn%44%

## Pending/Future Tasks
### P1
- Import 52 FAQs to production
- Google Reviews + Review JSON-LD schema
### P2
- Blog section
- Backend refactoring (server.py → routes/, models/, utils/)
### P3
- Video testimonials
- Additional schema types
