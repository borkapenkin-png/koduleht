# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga.

## Latest Update: March 12, 2026

### Completed Features

#### Core Website
- ✅ Modern responsive design with React + TailwindCSS
- ✅ Hero section with customizable content
- ✅ Services section (6 services)
- ✅ About section with company info
- ✅ References section (client testimonials)
- ✅ Quality guarantee section (partner logos)
- ✅ Contact form with message storage
- ✅ Footer with company info

#### Admin Panel (/admin)
- ✅ JWT-based secure authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting on login
- ✅ Password change functionality
- ✅ Theme customization (colors, fonts, sizes, logo, favicon)
- ✅ **Subtitle/Slogan customization (font, size, weight, letter-spacing)** - NEW
- ✅ Content management for all sections
- ✅ Service management with 30+ icon options
- ✅ Reference management
- ✅ Partner/Logo management (simplified)
- ✅ Contact messages viewer

#### SEO-Optimized Service Pages (March 12, 2026)
- ✅ All 6 services have "Lue lisää" links to dedicated pages
- ✅ Service pages at /palvelut/{slug}:
  - /palvelut/tasoitustyo
  - /palvelut/maalaustyot
  - /palvelut/mikrosementti
  - /palvelut/julkisivurappaus
  - /palvelut/kattomaalaus
  - /palvelut/julkisivumaalaus
- ✅ Professional service page layout with hero, trust badges, process timeline, contact form
- ✅ serviceSlugMap supports both old and new service naming conventions from database
- ✅ Resend email integration for contact form notifications
- ✅ Location section with Google Maps ("Löydät meidät")

#### SEO Optimization (Latest Session)
- ✅ Updated meta tags with target keywords:
  - "tasoitus helsinki"
  - "maalaustyöt helsinki"
  - "seinien tasoitus hinta"
  - "julkisivumaalaus uusimaa"
- ✅ Schema.org LocalBusiness structured data
- ✅ Service schema markup
- ✅ Open Graph tags for social sharing
- ✅ Twitter card support
- ✅ Geo tags for local SEO
- ✅ Updated sitemap.xml with service pages
- ✅ robots.txt configured
- ✅ Optimized images with alt texts
- ✅ Proper H1-H2 structure

#### Bug Fixes (Latest Session)
- ✅ Fixed image URL issues after deployment domain change
- ✅ Fixed admin logout issue with improved loadData error handling
- ✅ Improved CRUD error handling with user feedback

### Tech Stack
- **Frontend:** React 18, TailwindCSS, Framer Motion, React Router, React Helmet Async
- **Backend:** FastAPI, Motor (MongoDB async)
- **Database:** MongoDB
- **Authentication:** JWT with bcrypt password hashing
- **Rate Limiting:** slowapi

### Credentials
- **Admin URL:** /admin
- **Username:** admin
- **Password:** jbadmin2024

### Files Structure
```
/app/
├── backend/
│   ├── server.py (main API)
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── index.html (SEO meta tags, schema.org)
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── src/
│   │   ├── App.js (main application, Subtitle component)
│   │   ├── seo/
│   │   │   ├── SEOHead.js
│   │   │   └── serviceContent.js (SEO content for service pages)
│   │   └── pages/
│   │       └── ServicePage.js (individual service pages)
│   └── .env
└── memory/
    └── PRD.md
```

### Pending/Future Tasks

#### P0 (High Priority)
- **Google Analytics** - Blocked: waiting for user's Measurement ID (G-XXXXXXXXXX)

#### P1 (Medium Priority)
- **Dynamic meta descriptions per service page** - Currently using document.title only, should implement full react-helmet-async
- Backend refactoring (split server.py into modules)
- Refactor image URL storage to use relative paths (prevents "data loss" on domain changes)
- Move service page content from serviceContent.js to database for CMS editing

#### P2 (Low Priority)
- Google Analytics integration (user will add on own domain)
- Additional schema types (FAQ, Review)

### Known Issues
- Image URLs stored as absolute paths - causes apparent "data loss" when preview URL changes
- react-helmet-async for dynamic per-page meta descriptions not fully implemented

### Deployment Notes
- Ready for deployment
- Images must be re-uploaded after domain change
- Use Emergent Deploy feature
