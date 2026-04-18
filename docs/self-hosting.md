# Self-hosting migration

See projekt on nuud voimalik jooksutada ilma Emergentita.

## Stack

- `frontend`: React SPA + Node static server
- `backend`: FastAPI
- `database`: MongoDB
- `proxy`: Nginx

## 1. Valmista env failid

Loo fail:

- `backend/.env`

Vota aluseks:

- [backend/.env.example](C:/dev/koduleht/backend/.env.example)
- [frontend/.env.example](C:/dev/koduleht/frontend/.env.example)

Olulised vaartused backendis:

- `MONGO_URL`
- `DB_NAME`
- `JWT_SECRET`
- `ADMIN_PASSWORD`
- `ADMIN_RESET_KEY`
- `SITE_URL`
- `CORS_ORIGINS`

Soovitus Docker Compose jaoks:

```env
MONGO_URL=mongodb://mongodb:27017
DB_NAME=jbta_site
JWT_SECRET=<long-random-secret>
ADMIN_PASSWORD=<strong-password>
ADMIN_RESET_KEY=<long-random-secret>
DATA_SYNC_KEY=<long-random-secret>
SITE_URL=https://jbtasoitusmaalaus.fi
RESEND_API_KEY=
NOTIFICATION_EMAIL=info@jbtasoitusmaalaus.fi
CORS_ORIGINS=https://jbtasoitusmaalaus.fi,https://www.jbtasoitusmaalaus.fi
```

## 2. Kaivita infrastruktuur

Repo sisaldab nuud valmis stacki:

- [docker-compose.yml](C:/dev/koduleht/docker-compose.yml)
- [deploy/nginx.selfhost.conf](C:/dev/koduleht/deploy/nginx.selfhost.conf)
- [deploy/vps_rollout.sh](C:/dev/koduleht/deploy/vps_rollout.sh)
- [deploy/import_backup.sh](C:/dev/koduleht/deploy/import_backup.sh)
- [deploy/rewrite_image_urls.sh](C:/dev/koduleht/deploy/rewrite_image_urls.sh)
- [deploy/check_stack.sh](C:/dev/koduleht/deploy/check_stack.sh)

Kaivitus:

```bash
docker compose build
docker compose up -d mongodb backend frontend nginx
```

Voi koik korraga:

```bash
bash deploy/vps_rollout.sh https://jbtasoitusmaalaus.fi
```

Kontroll:

```bash
docker compose ps
curl http://localhost/api/settings
curl http://localhost/__server-info
```

## 3. Impordi sisu MongoDB-sse

Repo juures on olemas backup:

- [production_data_export.json](C:/dev/koduleht/production_data_export.json)

Importimiseks:

```bash
export MONGO_URL="mongodb://localhost:27017"
export DB_NAME="jbta_site"
python scripts/import_backup_to_mongo.py
```

NB:

- admini kaudu ules laetud pildid elavad MongoDB `images` kollektsioonis, seega need saab export/importiga kaasa votta
- vanades andmetes voivad URL-id veel viidata vana domeeni peale

Parast importi kirjuta pildi-URL-id uue domeeni peale:

```bash
export MONGO_URL="mongodb://localhost:27017"
export DB_NAME="jbta_site"
export TARGET_BASE_URL="https://jbtasoitusmaalaus.fi"
python scripts/rewrite_image_urls.py
```

Voi Compose stacki sees:

```bash
bash deploy/import_backup.sh
bash deploy/rewrite_image_urls.sh https://jbtasoitusmaalaus.fi
```

## 4. Kontrolli avalik flow

- `http://your-server/`
- `http://your-server/ukk`
- `http://your-server/referenssit`
- `http://your-server/hintalaskuri`
- `http://your-server/tasoitustyot-helsinki`

API kontroll:

- `http://your-server/api/settings`
- `http://your-server/api/services`

## 5. DNS ja HTTPS

Parast funktsionaalse deploy kinnitamist:

- suuna domeen serveri IP peale
- lisa TLS kas Nginx + Let's Encrypt voi Cloudflare proxy kaudu

## Mis on veel Emergentist alles

- vanas backupis voib olla veel `*.emergentagent.com` pildi-URL-e, aga nende umberkirjutamiseks on skript olemas
- `.emergent/` kaust on ajalooline ja pole self-hostinguks vajalik
- vanad dokumendid, mis viitavad Next.js-only stackile, ei ole enam source of truth

## Soovitatud jarjekord

1. luua `backend/.env`
2. kaivitada Mongo + backend + frontend + nginx
3. importida backup MongoDB-sse
4. kontrollida public route'id ja admin login
5. alles siis siduda domeen ja TLS

## Automaatne deploy GitHub Actions kaudu

Kui tahad, et iga `main` branchi push uuendaks VPS-i automaatselt:

1. Ava repo `Settings > Secrets and variables > Actions > Secrets`.
2. Lisa väärtused:
   - `VPS_HOST` (näiteks `84.247.191.77`)
   - `VPS_USER` (VPS ssh kasutajanimi, näiteks `root`)
   - `VPS_SSH_KEY` (privaatvõti, mida VPS `authorized_keys` aktsepteerib)
   - `VPS_PROJECT_PATH` (VPS-is repo kataloog, näiteks `/opt/jb-koduleht`)
   - `VPS_SSH_PORT` (soovituslikult `22`, kui pole muudetud)
3. Võid lisada deploy triggeri:
   - push main branchile (automaatne)
   - või `workflow_dispatch` (käsitsi käivitamine GitHubis)
4. GitHubi job töötab:
   - `git fetch`
   - `git checkout main`
   - `git pull --ff-only origin main`
   - `bash deploy/vps_rollout.sh`
