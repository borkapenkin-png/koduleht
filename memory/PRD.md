# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga.

## Latest Update: March 13, 2026

### Completed Features

#### SEO Content Optimization (March 13, 2026) - LATEST
- ✅ **Full SEO content rewrite** for all 6 service pages
- ✅ **Keyword-optimized titles:** "Tasoitustyöt Helsinki", "Maalaustyöt Helsinki", etc.
- ✅ **Local SEO:** Every page mentions Helsinki, Espoo, Vantaa, Uusimaa naturally
- ✅ **Proper H1/H2 structure:** Each page has one H1 and multiple H2 sections
- ✅ **Service-specific "Miksi valita" lists:** Unique for each service
- ✅ **Updated meta descriptions** with keywords
- ✅ **Updated sitemap.xml** with new Finnish URLs
- ✅ **Global settings updated** with SEO-rich content

#### Service Pages Redesign (March 13, 2026) - MAJOR UPDATE
- ✅ **Complete visual overhaul** - Service pages now match homepage design system
- ✅ **Identical navbar** - Logo, menu links, "Pyydä tarjous" CTA button
- ✅ **Hero section** - Same gradient overlay, left-aligned text, background images
- ✅ **Trust badges** - 4 badges (Vuodesta 2018, Ammattitaitoinen työ, Kotitalousvähennys, Tyytyväisyystakuu)
- ✅ **Breadcrumbs navigation** - Etusivu > Palvelut > Service Title
- ✅ **Professional landing page sections:**
  - PALVELUN KUVAUS (two-column layout)
  - MITÄ PALVELU SISÄLTÄÄ (4 feature cards)
  - MIKSI VALITA MEIDÄT (checklist with icons)
  - NÄIN PROJEKTI ETENEE (4 numbered steps)
  - PALVELUALUEET (area tags + contact info)
  - OTA YHTEYTTÄ (CTA with contact form)
  - MUUT PALVELUT (3 related service cards)
- ✅ **Identical footer** - Logo, tagline, nav links, copyright
- ✅ **Consistent styling** - Same fonts, colors, spacing, card styles, button styles

#### Core Website
- ✅ Modern responsive design with React + TailwindCSS
- ✅ Hero section with customizable content
- ✅ Services section (6 services)
- ✅ About section with company info
- ✅ References section (client testimonials)
- ✅ Quality guarantee section (partner logos)
- ✅ Contact form with message storage & email notifications (Resend)
- ✅ Footer with company info
- ✅ Location section with Google Maps ("Löydät meidät")

#### Admin Panel (/admin)
- ✅ JWT-based secure authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting on login
- ✅ Password change functionality
- ✅ **9 tabs for comprehensive management:**
  - Teema (Theme - colors, fonts, sizes, logo, favicon)
  - **Yleiset (Global Settings)** - NEW: company info, contact details, service areas, trust badges, CTA texts, process steps
  - Etusivu (Homepage sections)
  - **Palvelusivut (Service Pages CMS)** - NEW: full CMS for service landing pages
  - Palvelut (Services)
  - Referenssit (References)
  - Laatutakuu (Quality guarantee)
  - Viestit (Messages)
  - Turvallisuus (Security)

#### CMS-Driven Service Pages (March 13, 2026) - NEW
- ✅ **Full CMS system for service pages** - All content editable from admin
- ✅ **6 SEO-friendly Finnish URLs:**
  - /tasoitustyot-helsinki
  - /maalaustyot-helsinki
  - /mikrosementti-helsinki
  - /julkisivurappaus-helsinki
  - /kattomaalaus-helsinki
  - /julkisivumaalaus-helsinki
- ✅ Each service page includes:
  - Editable H1 hero title, subtitle, background image
  - SEO meta tags (title, description, keywords)
  - Trust badges from global settings
  - "Mitä palvelu sisältää" features section
  - "Miksi valita meidät" section (overridable)
  - "Näin projekti etenee" process steps (from global settings)
  - Quick contact form sidebar
  - Contact information sidebar
  - Service areas section
  - Related services links
- ✅ Legacy URL support (/palvelut/{slug} still works)

#### Global Settings System (NEW)
- ✅ **Company information** (name, VAT ID, founded year, city)
- ✅ **Contact details** (phones, email, address) - auto-updates everywhere
- ✅ **Service areas** (Helsinki, Espoo, Vantaa, Kauniainen, Uusimaa)
- ✅ **Trust badges** (4 customizable badges with titles/subtitles)
- ✅ **CTA texts** (primary, secondary, phone)
- ✅ **Process steps** (4 steps with titles/descriptions)
- ✅ **"Why choose us" list** (6+ items)
- ✅ **Footer settings**

#### SEO Optimization
- ✅ Dynamic SEO meta tags per service page
- ✅ Schema.org LocalBusiness + Service structured data
- ✅ Open Graph + Twitter card tags
- ✅ Geo tags for local SEO
- ✅ Updated sitemap.xml with service pages
- ✅ robots.txt configured
- ✅ Proper H1-H2 structure on all pages
- ✅ Breadcrumbs navigation on service pages

### Tech Stack
- **Frontend:** React 18, TailwindCSS, Framer Motion, React Router
- **Backend:** FastAPI, Motor (MongoDB async)
- **Database:** MongoDB
- **Authentication:** JWT with bcrypt password hashing
- **Email:** Resend
- **Rate Limiting:** slowapi

### Credentials
- **Admin URL:** /admin
- **Username:** admin
- **Password:** jbadmin2024

### Files Structure
```
/app/
├── backend/
│   ├── server.py (main API with ServicePage CRUD)
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── index.html (SEO meta tags, schema.org)
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── src/
│   │   ├── App.js (main app with routing)
│   │   ├── components/
│   │   │   ├── shared/index.js (reusable components)
│   │   │   └── admin/
│   │   │       ├── ServicePagesAdmin.js (CMS for service pages)
│   │   │       └── GlobalSettingsAdmin.js (global settings)
│   │   ├── pages/
│   │   │   └── DynamicServicePage.js (CMS-driven service pages)
│   │   └── seo/
│   │       ├── SEOHead.js
│   │       └── serviceContent.js (serviceSlugMap)
│   └── .env
└── memory/
    └── PRD.md
```

### API Endpoints

#### Public
- `GET /api/settings` - Site settings (includes global company info)
- `GET /api/services` - Homepage services
- `GET /api/service-pages` - All published service pages
- `GET /api/service-pages/{slug}` - Single service page by slug
- `POST /api/contact` - Submit contact form (sends email)

#### Protected (Admin)
- `POST /api/admin/login` - Login
- `GET /api/admin/verify` - Verify token
- `PUT /api/site_content` - Update all settings
- `GET/POST/PUT/DELETE /api/admin/service-pages` - Service pages CRUD
- `GET/POST/PUT/DELETE /api/admin/services` - Services CRUD
- `GET/POST/PUT/DELETE /api/admin/references` - References CRUD
- `GET/POST/PUT/DELETE /api/admin/partners` - Partners CRUD

### Database Collections
- `site_settings` - All site settings including global company info
- `services` - Homepage services (title, description, icon, image)
- `service_pages` - CMS service pages (full content, SEO, features)
- `references` - Client testimonials
- `partners` - Partner/certification logos
- `contacts` - Contact form submissions

### Pending/Future Tasks

#### P0 (High Priority)
- **Google Analytics** - Blocked: waiting for user's Measurement ID (G-XXXXXXXXXX)

#### P1 (Medium Priority)
- Backend refactoring (split server.py into modules)
- Refactor image URL storage to use relative paths (prevents "data loss" on domain changes)

#### P2 (Low Priority)
- Additional schema types (FAQ, Review)
- Rich text editor for service page descriptions

### Known Issues
- Image URLs stored as absolute paths - causes apparent "data loss" when preview URL changes

### Deployment Notes
- Ready for deployment
- All 6 service pages created and tested
- Images must be re-uploaded after domain change
- Use Emergent Deploy feature
