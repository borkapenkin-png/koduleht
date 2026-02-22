# J&B Tasoitus ja Maalaus - Sivuston Uudistus

## Alkuperäinen ongelma
Asiakas halusi uudistaa nykyisen verkkosivuston (jbtasoitusmaalaus.fi) modernimmaksi ja helpommin muokattavaksi.

## Käyttäjävalinnat
- Moderni & minimalistinen design
- Sininen värimaailma
- Referenssiprojektit teksti-kortteina
- Palvelut-osio kuvilla
- Admin-paneeli kaikelle sisällölle
- Kuvien lataus suoraan administa
- Laatutakuu-osio kumppanilogoille

## Arkkitehtuuri
- **Frontend**: React.js + Tailwind CSS + Framer Motion + React Router
- **Backend**: FastAPI + MongoDB + python-multipart (kuvien lataus)
- **Tyyli**: Nordic Minimalist

## Toteutetut ominaisuudet

### v1.0 (22.2.2026) - Perusversio
- ✅ Moderni single-page sivusto
- ✅ Hero-osio LAATUJOHTAJAT-sloganilla
- ✅ Palvelut-osio (dynaamiset kortit tietokannasta)
- ✅ Referenssit-osio
- ✅ Yhteystiedot ja yhteydenottolomake

### v1.1 (22.2.2026) - Admin-paneeli
- ✅ Admin-paneeli (/admin)
- ✅ Palveluiden CRUD
- ✅ Referenssien CRUD
- ✅ Yhteydenottojen hallinta

### v1.2 (22.2.2026) - Kuvat ja Laatutakuu
- ✅ **Uusi korjattu logo** (vaakasuuntainen, sininen)
- ✅ **Kuvien lataus** administa (base64 MongoDB-tallennuksella)
- ✅ **Laatutakuu/Kumppanit-osio** admin-hallinnalla
- ✅ Voit lisätä kumppani-logoja (Luotettava kumppani, Kasvuyritys jne.)
- ✅ ImageUpload-komponentti palveluille ja kumppaneille

## API-reitit

### Julkiset
- GET /api/services - Palvelut
- GET /api/references - Referenssit
- GET /api/partners - Kumppanit/Laatutakuu
- GET /api/images/{id} - Ladatut kuvat
- POST /api/contact - Yhteydenottolomake

### Admin (vaatii kirjautumisen)
- POST /api/admin/upload - Kuvan lataus
- CRUD /api/admin/services
- CRUD /api/admin/references
- CRUD /api/admin/partners
- GET/DELETE /api/admin/contacts
- POST /api/admin/seed - Alkudata

## Admin-tunnukset
- Käyttäjätunnus: admin
- Salasana: jbadmin2024

## Backlog
- P1: Sähköpostivahvistukset lomakkeelle
- P2: SEO-optimointi
- P2: Google Analytics
- P3: Asiakasarvostelut
