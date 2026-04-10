# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga. Hintalaskuri on müügifunnel. SEO optimeerimine kohalike linnade jaoks (Helsinki, Espoo, Vantaa, Kauniainen).

## Latest Update: April 9, 2026

### Session 10c: Sitemap, Cache-Control, Admin Conditional Options (April 9, 2026)
- **Sitemap fix**: Dynamic `/api/sitemap.xml` endpoint generates sitemap from DB (all areas + city variants). `robots.txt` updated to point to API endpoint with `Allow: /api/sitemap.xml` before `Disallow: /api/`. SSG now regenerates sitemap on every run. Area create/delete now triggers SSG.
- **Calculator API Cache-Control**: Added `no-store, no-cache` headers to `/api/calculator-config` so admin price changes reflect immediately in browser
- **Kattomaalaus admin**: Added `conditional_options` support in CalculatorAdmin.js — Peltikatto and Tiilikatto condition options now editable separately
- **Production CSS fix**: `fix-assets.js` post-build script reads `asset-manifest.json` and fixes all HTML files

### Session 10b: Production CSS Bug Fix - COMPLETED (April 9, 2026)
- **Root cause**: SSG HTML files referenced old CSS hash (`main.37180c2f.css`) that didn't exist after new build
- **Fix**: Created `fix-assets.js` post-build script that reads `asset-manifest.json` and fixes ALL 86 HTML files in `build/`
- Added to package.json: `"build": "craco build && node fix-assets.js"`
- Also improved: `get_react_assets()` reads from manifest, `server.js` v2 with runtime asset fixing
- Production confirmed working

### Session 10: Add-on Quantity (kpl) Selection - COMPLETED
- Add-ons with `allow_quantity: True` show +/- buttons when activated
- Quantity multiplies `fixed_price` in calculator (e.g., 3 doors × 120€ = 360€ added)
- Admin panel: `kpl-valinta` checkbox per add-on in Laskuri tab
- DB migration auto-sets `allow_quantity: True` for ovien_maalaus, extra_color, ikkunoiden_maalaus, kourujen_puhdistus

### Session 9b: Tasoitustyöt area_multiplier Migration - COMPLETED
- Converted Tasoitustyöt target_type from price `multiplier` (1.0/1.3/1.2) to `area_multiplier` (2.0/1.0/3.0) — same logic as Sisämaalaus
- Added descriptions to Tasoitustyöt surface options (Seinäpintojen tasoitus, etc.)
- Added helper_text to area slider ("Syötä huoneiston pohjapinta-ala — laskuri muuntaa sen tasoitettavaksi pinta-alaksi.")
- Condition multipliers (Perustaso 0.6, Sileä 1.0, Erittäin sileä 1.5) remain as price multipliers

### Session 9a: Hintalaskuri Hard Patch — Surface Options, Package Removal, Admin Texts - COMPLETED
- Sisämaalaus surface step: "Mitä pintoja maalataan?" (Seinät×2.0, Katot×1.0, Seinät+katot×3.0)
- area_multiplier logic: effectiveArea = floorArea × areaMultiplier
- Package system removed from frontend. DB/admin data preserved.
- Admin: step titles/labels/descriptions editable, addons_step_title, addons_step_subtitle, disclaimer

### Session 8: Hintalaskuri Admin Centralization & Page Restructure - COMPLETED
- Laskuri-välilehteen lisätty "Sivun SEO & Hero" -osio
- Hintalaskuri piilotettu Palvelusivut-listasta

## Data Architecture
### calculator_config.services[].steps[]
- `type: "cards"` — options can have `multiplier` (price) and/or `area_multiplier` (area)
- `type: "slider"` — supports `helper_text` for guidance text
- `type: "size_cards"` — options with `area_value`

## Key Files
- `/app/frontend/src/pages/PriceCalculatorPage.js` - Calculator with area_multiplier logic
- `/app/frontend/src/components/admin/CalculatorAdmin.js` - Calculator admin + SEO/Hero
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
