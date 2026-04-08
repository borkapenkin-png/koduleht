# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga. Hintalaskuri on müügifunnel. SEO optimeerimine kohalike linnade jaoks (Helsinki, Espoo, Vantaa, Kauniainen).

## Latest Update: April 8, 2026

### Session 8: Hintalaskuri Admin Centralization & Page Restructure - COMPLETED
- **Laskuri-välilehti**: Lisätty "Sivun SEO & Hero" -osio Laskuri admin-välilehteen. Kentät: SEO-otsikko, Meta-kuvaus, Hero-otsikko (H1), Hero-alaotsikko, Hero-taustakuva URL, SEO-teksti (description_text).
- **Palvelusivut**: Hintalaskuri piilotettu Palvelusivut-listasta (filter: slug !== 'hintalaskuri')
- **Hintalaskuri-sivu**: Poistettu turhat markkinointiosiot (2. TrustBadges, DescriptionSection, FeaturesSection, WhyChooseSection, ServiceAreasSection)
- **Pidetyt osiot**: Hero, 1x Trust-palkki, Laskuri-widget, Työvaiheet (ProcessSection), UKK, Yhteydenottolomake, Referenssit, Footer CTA
- **Dynaaminen Hero**: Hero-otsikko ja -alaotsikko tulevat nyt tietokannasta
- **Files changed**: CalculatorAdmin.js, ServicePagesAdmin.js, PriceCalculatorPage.js

### Session 7: Etusivu SSG Dynamic + SEO Admin Fields - COMPLETED
- Etusivu SSG dünaamiliseks, SEO väljad admin paneeli, Avainluvut, Palvelualueet
- Automaatne SSG, Express SSR server

### Session 6: City Variant SEO/Hero Title + Description Overrides - COMPLETED
- custom_texts format with seo_title, hero_title, seo_description

### How it works:
1. **Palvelusivut** = Edit Helsinki base page (template for all cities)
2. **Alueet -> custom texts** = Override per city: seo_title, hero_title, seo_description, text
3. **Etusivu tab** = SEO title, meta description, canonical URL + all content sections
4. **Laskuri tab** = Calculator pricing + SEO/Hero fields for /hintalaskuri page
5. **Admin save -> SSG auto-regenerate ~15 sec**

### Previous Sessions: COMPLETED
- Session 5a: Hintalaskuri Page Sections
- Session 4e-4a: Calculator features
- Custom_texts feature, FAQ fixes, 301 redirects, FOUC fix, Sitemap/Canonical fixes
- Footer redesign, Kotitalousvähennys admin fields, clickable progress bar

## Key Files
- `/app/frontend/src/App.js` - Main app with admin panel, homepage, footer
- `/app/frontend/src/components/admin/AreasAdmin.js` - Areas admin with custom_texts UI
- `/app/frontend/src/components/admin/CalculatorAdmin.js` - Calculator config + SEO/Hero admin
- `/app/frontend/src/components/admin/ServicePagesAdmin.js` - Service pages (hintalaskuri filtered out)
- `/app/frontend/src/pages/PriceCalculatorPage.js` - Calculator page (simplified layout)
- `/app/frontend/src/pages/DynamicServicePage.js` - City variant rendering
- `/app/backend/generate_static_direct.py` - SSG script
- `/app/backend/server.py` - API

## Credentials
- Preview Admin: admin / jbadmin2024
- Production Admin: admin / Mi55iOn%44%

## Pending/Future Tasks
### P1
- Import 52 FAQs to production
- Google Reviews + Review JSON-LD schema
### P2
- Blog section
- Backend refactoring (server.py -> routes/, models/, utils/)
### P3
- Video testimonials
- Additional schema types
