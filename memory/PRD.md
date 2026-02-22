# J&B Tasoitus ja Maalaus - Sivuston Uudistus

## Alkuperäinen ongelma
Asiakas halusi uudistaa nykyisen verkkosivuston (jbtasoitusmaalaus.fi) modernimmaksi ja helpommin muokattavaksi.

## Käyttäjävalinnat
- Moderni & minimalistinen design (paljon tyhjää tilaa, selkeät linjat)
- Sininen värimaailma säilytetään
- Referenssiprojektit kortteina teksteineen
- Yhteydenottolomake

## Arkkitehtuuri
- **Frontend**: React.js + Tailwind CSS + Framer Motion
- **Backend**: FastAPI + MongoDB
- **Tyyli**: Nordic Minimalist, ammattimainen, luotettava

## Toteutetut ominaisuudet (22.2.2026)
- ✅ Hero-osio LAATUJOHTAJAT-sloganilla
- ✅ Navigaatiopalkki glassmorphism-efektillä
- ✅ Palvelut-osio (3 korttia: Julkisivurappaus, Tasoitustyöt, Maalaustyöt)
- ✅ Meistä-osio yritystiedoilla
- ✅ Referenssit-osio (6 projektia kortteina)
- ✅ Laatutakuu-osio
- ✅ Yhteystiedot ja yhteydenottolomake
- ✅ Footer
- ✅ Mobiiliresponsiivinen design
- ✅ Backend API: /api/contact lomakkeen lähetykseen
- ✅ Backend API: /api/references referenssien hallintaan

## Kohderyhmä
Suomalaiset asunnonomistajat, yritykset ja taloyhtiöt, jotka etsivät ammattitaitoisia maalaus- ja tasoituspalveluita Uudellamaalla.

## Backlog / Seuraavat vaiheet
- P0: Lisää asiakkaan oma logo PDF-muodossa
- P1: Admin-paneeli referenssien hallintaan
- P1: Lomakkeen sähköpostivahvistukset
- P2: Google Analytics integraatio
- P2: SEO-optimointi (meta-tagit, sitemap)
- P3: Asiakasarvostelut/Google-arviot integraatio

## Tekninen dokumentaatio
- Frontend: /app/frontend/src/App.js (pääkomponentti)
- Backend: /app/backend/server.py (API)
- Styles: /app/frontend/src/index.css, /app/frontend/src/App.css
