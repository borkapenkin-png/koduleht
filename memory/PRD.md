# J&B Tasoitus ja Maalaus - Product Requirements Document

## Original Problem Statement
Moderniseerida jbtasoitusmaalaus.fi veebisait koos admin paneeliga.

## Latest Update: April 1, 2026

### P0 Critical SEO Fix: Pre-rendered HTML Content for Google Crawler (April 1, 2026) - COMPLETED
**Problem:** Google's crawler saw empty pages with only a `<noscript>` message "JavaScript on vajalik selle lehe vaatamiseks" (incorrectly in Estonian instead of Finnish). All SSG templates were empty - they only had meta tags but NO actual HTML content in the page body. This meant Google couldn't index any real content without executing JavaScript.

**Root Cause:** SSG templates (`home.html`, `service_page.html`, `faq.html`, `references.html`) all only extended `base.html` with a comment - no content blocks were defined.

**Solution Implemented:**
- Added `{% block seo_content %}{% endblock %}` to `base.html` inside `<div id="root">`
- **home.html**: Full hero section, services list with links, about section, contact info, footer navigation
- **service_page.html**: Hero, full description text, features, "why choose us", process steps, service areas, contact
- **faq.html**: All 52 FAQ questions AND answers pre-rendered (critical for FAQ rich results!)
- **references.html**: All reference projects with details (type, contractor, location, year, images)
- Fixed Estonian `<noscript>` text to Finnish
- SSG no longer overwrites `public/index.html` (prevents breaking CRA dev server)

**Result:**
- Google now sees full page content immediately without JavaScript
- All 9 pages have pre-rendered HTML (6 service + home + UKK + referenssit)
- React hydrates/replaces the content when JavaScript loads
- FAQ rich results possible (52 Q&A pairs in HTML)
- 100% test pass rate (22/22 backend, all frontend pages verified)

**Files Modified:**
- `/app/backend/templates/base.html` - Added `{% block seo_content %}` block
- `/app/backend/templates/home.html` - Full homepage content
- `/app/backend/templates/service_page.html` - Full service page content with correct DB field names
- `/app/backend/templates/faq.html` - All FAQ Q&A pairs
- `/app/backend/templates/references.html` - All reference projects
- `/app/backend/generate_static_direct.py` - Skip writing to `public/index.html`
- `/app/frontend/public/index.html` - Clean CRA template (no SSG content)

### P0 Production SEO Fix - RESOLVED (March 15, 2026)
**Problem:** Emergent platform's production Nginx uses `try_files $uri $uri/ /index.html;` which doesn't check for `$uri/index.html`. This caused all clean URLs like `/maalaustyot-helsinki` to return the homepage instead of the unique static page.

**Solution Implemented (WORKING):**
- Multiple routing config files - Created `_redirects`, `vercel.json`, `.htaccess`, `serve.json`
- Flat HTML files - Generated both `/slug/index.html` AND `/slug.html` formats
- Clean URLs working - All service pages now accessible
- Production verified - All 9 pages tested and working

### Hybrid SSR Architecture for SEO (March 14, 2026)
- FastAPI + Jinja2 SSR - Server-side rendering for public pages
- Full HTML content in View Source - All page content visible to crawlers
- SEO meta tags - Title, description, canonical URL, Open Graph, Twitter Card
- JSON-LD structured data - LocalBusiness, Service, FAQPage, BreadcrumbList
- Static HTML generation - `generate_static_direct.py` creates pre-rendered pages
- React hydration - Client-side interactivity preserved
- Dynamic sitemap - Auto-generated from database content

**Generated static pages:**
- `/` (index.html)
- `/referenssit`
- `/ukk`
- `/tasoitustyot-helsinki`
- `/maalaustyot-helsinki`
- `/mikrosementti-helsinki`
- `/julkisivumaalaus-helsinki`
- `/julkisivurappaus-helsinki`
- `/kattomaalaus-helsinki`

## Tech Stack
- **Frontend:** React 18, TailwindCSS, Framer Motion, React Router
- **Backend:** FastAPI, Motor (MongoDB async)
- **Database:** MongoDB
- **Authentication:** JWT with bcrypt
- **Email:** Resend
- **SSG:** Python + Jinja2 templates
- **Serving:** `serve` (static file server)

## Credentials
- **Preview Admin:** admin / jbadmin2024
- **Production Admin:** admin / Mi55iOn%44%

## Key Files
```
/app/
├── backend/
│   ├── server.py                   # Main API
│   ├── generate_static_direct.py   # SSG generator
│   └── templates/                  # Jinja2 SSG templates
│       ├── base.html               # Base template with seo_content block
│       ├── home.html               # Homepage SSG content
│       ├── service_page.html       # Service page SSG content
│       ├── faq.html                # FAQ page SSG content
│       └── references.html         # References page SSG content
├── frontend/
│   ├── public/index.html           # CRA template (clean)
│   ├── build/                      # Production build + SSG content
│   └── src/
│       ├── App.js
│       └── pages/
```

## Pending/Future Tasks

### P1 (High Priority)
- Import 52 FAQs to production via admin panel
- Collect Google Reviews & Add Review JSON-LD schema
- Google Ads appeal (Compromised Site suspension)

### P2 (Medium Priority)
- Add Blog Section for content marketing
- Location-specific service pages (Espoo, Vantaa)
- Backend refactoring (split server.py into modules)
- www to non-www redirect via Cloudflare Page Rule

### P3 (Low Priority)
- Rich text editor for service page descriptions
- Additional schema types
