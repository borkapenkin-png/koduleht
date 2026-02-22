# J&B Tasoitus ja Maalaus - Sivuston Uudistus

## Alkuperäinen ongelma
Asiakas halusi uudistaa nykyisen verkkosivuston (jbtasoitusmaalaus.fi) modernimmaksi ja helpommin muokattavaksi.

## Käyttäjävalinnat
- Moderni & minimalistinen design
- Sininen värimaailma säilytetään
- Referenssiprojektit kortteina teksteineen (ei kuvia)
- Palvelut-osio kuvilla
- Admin-paneeli sisällön hallintaan
- PNG-logo

## Arkkitehtuuri
- **Frontend**: React.js + Tailwind CSS + Framer Motion
- **Backend**: FastAPI + MongoDB
- **Tyyli**: Nordic Minimalist

## Toteutetut ominaisuudet

### v1.0 (22.2.2026)
- ✅ Moderni single-page sivusto
- ✅ Hero-osio LAATUJOHTAJAT-sloganilla
- ✅ Navigaatiopalkki glassmorphism-efektillä
- ✅ Palvelut-osio (dynaamiset kortit kuvilla tietokannasta)
- ✅ Meistä-osio
- ✅ Referenssit-osio (teksti-kortit tietokannasta)
- ✅ Laatutakuu-osio
- ✅ Yhteystiedot ja yhteydenottolomake

### v1.1 (22.2.2026) - Admin-paneeli
- ✅ PNG-logo lisätty
- ✅ Admin-paneeli (/admin)
- ✅ Kirjautuminen (admin / jbadmin2024)
- ✅ Palveluiden CRUD (lisää, muokkaa, poista)
- ✅ Referenssien CRUD
- ✅ Yhteydenottojen hallinta
- ✅ Dynaamiset palvelut ja referenssit API:sta
- ✅ Kuva-URL tuki palveluille

## API-reitit
- GET /api/services - Julkiset palvelut
- GET /api/references - Julkiset referenssit
- POST /api/contact - Yhteydenottolomake
- GET /api/admin/verify - Kirjautumisen tarkistus
- POST/PUT/DELETE /api/admin/services - Palveluiden hallinta
- POST/PUT/DELETE /api/admin/references - Referenssien hallinta
- GET/DELETE /api/admin/contacts - Viestien hallinta
- POST /api/admin/seed - Alkudatan lisäys

## Admin-tunnukset
- Käyttäjätunnus: admin
- Salasana: jbadmin2024

## Backlog
- P1: Kuvien lataus suoraan admin-paneelista
- P1: Sähköpostivahvistukset lomakkeelle
- P2: SEO-optimointi
- P2: Google Analytics
- P3: Asiakasarvostelut
