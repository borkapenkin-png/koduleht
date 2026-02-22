# J&B Tasoitus ja Maalaus - Verkkosivusto

## Alkuperäinen tavoite
Modernisoida yrityksen verkkosivusto (jbtasoitusmaalaus.fi) helposti hallittavaksi ja päivitettäväksi.

## Tekniset vaatimukset
- **Frontend:** React, TailwindCSS, Framer Motion
- **Backend:** FastAPI, Motor (async MongoDB)
- **Tietokanta:** MongoDB
- **Autentikointi:** JWT + bcrypt (päivitetty 22.2.2025)

## Turvallisuusominaisuudet (Toteutettu 22.2.2025)
- ✅ **JWT-autentikointi** - Token-pohjainen kirjautuminen (24h voimassaolo)
- ✅ **Rate limiting** - Max 5 kirjautumisyritystä / 5 min per IP
- ✅ **Salasanan hashaus** - Bcrypt-salaus tietokannassa
- ✅ **Salasanan vaihto** - Admin-paneelissa oma välilehti
- ✅ **Token-tallennus** - localStorage (kirjautuminen säilyy)

## Sivuston osiot
1. **Hero** - Pääbanneri teksteineen ja kuvineen
2. **Palvelut** - Dynaaminen palvelulista (admin-hallinta)
3. **Meistä** - Yritysesittely
4. **Referenssit** - Asiakasreferenssit (admin-hallinta)
5. **Laatutakuu** - Kumppanit ja sertifikaatit (admin-hallinta)
6. **Yhteystiedot** - Lomake + yhteystiedot

## Admin-paneeli (/admin)
- **Kirjautumistiedot:** admin / jbadmin2024 (oletussalasana)
- **Välilehdet:**
  - Sivusto - Hero, Meistä, Yhteystiedot tekstit/kuvat
  - Palvelut - CRUD
  - Referenssit - CRUD
  - Laatutakuu - CRUD
  - Viestit - Yhteydenottolomakkeen viestit
  - Turvallisuus - Salasanan vaihto ja suojaustiedot

## SEO (Toteutettu)
- Meta-tagit (title, description)
- robots.txt
- sitemap.xml

## Tietokantamallit
- `admin_users` - {username, password_hash, created_at, updated_at}
- `site_settings` - Sivuston tekstit ja kuvat
- `services` - Palvelut
- `references` - Referenssit
- `partners` - Kumppanit/laatutakuu
- `contact_forms` - Yhteydenottolomakkeen viestit
- `images` - Ladatut kuvat (base64)

## API-päätepisteet
### Julkiset
- GET /api/settings - Sivuston asetukset
- GET /api/services - Palvelut
- GET /api/references - Referenssit
- GET /api/partners - Kumppanit
- POST /api/contact - Yhteydenottolomake
- GET /api/images/{id} - Kuvat

### Admin (JWT vaaditaan)
- POST /api/admin/login - Kirjautuminen (palauttaa JWT-tokenin)
- GET /api/admin/verify - Tokenin tarkistus
- POST /api/admin/change-password - Salasanan vaihto
- PUT /api/admin/settings - Päivitä asetukset
- POST/PUT/DELETE /api/admin/services/{id}
- POST/PUT/DELETE /api/admin/references/{id}
- POST/PUT/DELETE /api/admin/partners/{id}
- GET/DELETE /api/admin/contacts/{id}
- POST /api/admin/upload - Kuvan lataus

## Tulevat tehtävät
- P1: Käyttäjän oma sisällönlisäys
- P2: Backend-koodin refaktorointi (router-jako)
- P2: Google Analytics (käyttäjä lisää itse)

## Muutoshistoria
- 22.2.2025: JWT-autentikointi, rate limiting, salasanan hashaus ja vaihto
- Aiemmin: Perussivusto, admin-paneeli, SEO
