# Nihongo Master — API Migration Design Spec

**Date:** 2026-05-19  
**Status:** Approved  
**Scope:** Full API backend + frontend migration from localStorage/bundled-data to API-backed architecture

---

## 1. Goal

Move Nihongo Master from a fully static, localStorage-only SPA to a full-stack application with:
- User accounts (email/password + Google/GitHub OAuth)
- Cross-device progress sync (XP, streak, favorites, flashcard state, quiz history)
- Content served from API (vocab, kanji, kana — no more bundled JS data files)
- All user data owned by the backend — localStorage fully removed

---

## 2. Architecture Overview

```
┌─────────────────────────────────┐        ┌──────────────────────────────┐
│  Vue 3 SPA (GitHub Pages)        │◄──────►│  FastAPI (Render)            │
│                                 │  HTTPS  │                              │
│  - auth store (JWT)             │        │  - /auth  (register/login/    │
│  - progress store (API-backed)  │        │            OAuth)             │
│  - settings store (API-backed)  │        │  - /content (kana/vocab/kanji)│
│  - useContentStore (cached)     │        │  - /progress                  │
│  - useApi composable (axios)    │        │  - /settings                  │
│  - no localStorage              │        │  - /favorites                 │
│  - no bundled data files        │        │  - /flashcards                │
└─────────────────────────────────┘        └──────────────┬───────────────┘
                                                          │
                                           ┌──────────────▼───────────────┐
                                           │  PostgreSQL (Render managed)  │
                                           └──────────────────────────────┘
```

**Stack:**
- Backend: Python 3.12 + FastAPI + SQLAlchemy (async) + Alembic migrations
- Database: PostgreSQL 16 (Render managed)
- Auth: JWT (python-jose) + bcrypt + Google/GitHub OAuth (authlib)
- Hosting: Render (API + DB)
- Frontend: Vue 3 + Pinia + Axios (unchanged stack, updated stores/composables)

---

## 3. Database Schema

### Users & Auth

```sql
users
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  email         TEXT UNIQUE NOT NULL
  username      TEXT UNIQUE NOT NULL
  password_hash TEXT NULL          -- NULL for OAuth-only users
  created_at    TIMESTAMPTZ DEFAULT now()
  updated_at    TIMESTAMPTZ DEFAULT now()

oauth_accounts
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE
  provider         TEXT NOT NULL    -- 'google' | 'github'
  provider_user_id TEXT NOT NULL
  UNIQUE(provider, provider_user_id)
```

### User State

```sql
user_settings
  user_id        UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
  quiz_length    INT DEFAULT 10
  romaji_visible BOOL DEFAULT true
  sound_enabled  BOOL DEFAULT true
  theme          TEXT DEFAULT 'dark'
  language       TEXT DEFAULT 'en'

user_progress
  user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
  xp               INT DEFAULT 0
  streak           INT DEFAULT 0
  last_played_date DATE NULL

quiz_history
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE
  mode      TEXT NOT NULL    -- 'hiragana'|'katakana'|'kanji'|'vocabulary'|'kanji-vocab'
  score     INT NOT NULL
  total     INT NOT NULL
  xp_gained INT NOT NULL
  played_at TIMESTAMPTZ DEFAULT now()

character_stats
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE
  char_key  TEXT NOT NULL    -- kana char or kanji char
  correct   INT DEFAULT 0
  incorrect INT DEFAULT 0
  PRIMARY KEY (user_id, char_key)

flashcard_known
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
  card_id TEXT NOT NULL     -- 'expression::reading' for vocab, kanji char for kanji
  known   BOOL NOT NULL
  PRIMARY KEY (user_id, card_id)

favorites
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE
  item_type TEXT NOT NULL   -- 'kanji' | 'vocabulary'
  item_key  TEXT NOT NULL   -- kanji char or 'expression::reading'
  PRIMARY KEY (user_id, item_type, item_key)
```

### Content (replaces bundled JS data files)

```sql
kana
  id      SERIAL PRIMARY KEY
  kana    TEXT NOT NULL
  romaji  TEXT NOT NULL
  type    TEXT NOT NULL    -- 'hiragana' | 'katakana'
  grp     TEXT NOT NULL    -- 'vowel', 'k', 's', etc.

vocabulary
  id          SERIAL PRIMARY KEY
  expression  TEXT NOT NULL
  reading     TEXT NOT NULL
  meaning     TEXT NOT NULL      -- English
  meaning_pt  TEXT NULL          -- Portuguese (pt-BR)
  jlpt        TEXT NOT NULL      -- 'n5' | 'n4'
  pos         TEXT NULL          -- part of speech
  category    TEXT NULL
  UNIQUE(expression, reading)

kanji
  id           SERIAL PRIMARY KEY
  kanji        TEXT UNIQUE NOT NULL
  meaning      TEXT[] NOT NULL       -- English meanings array
  meaning_pt   TEXT[] NULL           -- Portuguese meanings array
  onyomi       TEXT[] NOT NULL
  kunyomi      TEXT[] NOT NULL
  jlpt         TEXT NOT NULL         -- 'n5' | 'n4'
  stroke_count INT NOT NULL
  examples     JSONB NOT NULL DEFAULT '[]'
  -- examples shape: [{word, reading, meaning, meaning_pt}]
```

---

## 4. API Endpoints

### Auth — `/auth`

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/auth/register` | `{email, username, password}` | `{user, token}` |
| POST | `/auth/login` | `{email, password}` | `{user, token}` |
| POST | `/auth/logout` | — | `204` |
| POST | `/auth/refresh` | — | `{token}` |
| GET | `/auth/google` | — | redirect |
| GET | `/auth/google/callback` | — | redirect to frontend |
| GET | `/auth/github` | — | redirect |
| GET | `/auth/github/callback` | — | redirect to frontend |
| GET | `/auth/me` | — | `{id, email, username}` |

JWT is set as an `httpOnly` cookie by the API. The frontend never reads the raw token — it just sends cookies automatically via `axios.defaults.withCredentials = true`.

OAuth callback redirects to `https://ginhu.github.io/Nihongo-Learning/#/login?status=success` on success.

### Content — `/content` (public, no auth)

| Method | Path | Query params | Response |
|--------|------|-------------|----------|
| GET | `/content/kana` | `type=hiragana\|katakana` | `kana[]` |
| GET | `/content/vocabulary` | `jlpt=n5\|n4\|all`, `lang=en\|pt-BR`, `category=...` | `vocabulary[]` |
| GET | `/content/kanji` | `jlpt=n5\|n4\|all`, `lang=en\|pt-BR` | `kanji[]` |

Content endpoints are public — no auth needed. This allows the app to pre-load data before login.

### Settings — `/settings` (auth required)

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/settings` | — | settings object |
| PATCH | `/settings` | partial settings object | updated settings |

### Progress — `/progress` (auth required)

| Method | Path | Body / Query | Response |
|--------|------|-------------|----------|
| GET | `/progress` | — | `{xp, level, streak, lastPlayedDate}` |
| POST | `/progress/quiz` | `{mode, score, total, answers: [{char_key, was_correct}]}` | `{xp_gained, new_level}` |
| POST | `/progress/vocab-quiz` | `{mode, score, total, xp_total}` | `{xp_gained, new_level}` |
| GET | `/progress/history` | `?mode=quiz\|vocabulary` (optional) | `quiz_history[]` last 50 |
| GET | `/progress/character-stats` | — | `[{char_key, correct, incorrect}]` |

`POST /progress/quiz` handles everything server-side in one call: XP calculation, streak check, level-up detection, and character stat updates from `answers[]`. No separate PATCH needed on quiz end.  
`POST /progress/vocab-quiz` receives `xp_total` pre-calculated on client (tip-tiered XP logic stays on frontend). Vocab quiz has no per-character stats.  
`new_level` is `null` if no level-up occurred.

### Flashcards — `/flashcards` (auth required)

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/flashcards/known` | — | `[{card_id, known}]` |
| PUT | `/flashcards/known/{card_id}` | `{known: bool}` | `204` |
| DELETE | `/flashcards/known/{card_id}` | — | `204` |

### Favorites — `/favorites` (auth required)

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/favorites` | — | `{kanji: [], vocabulary: []}` |
| POST | `/favorites/kanji/{kanji}` | — | `{favorited: bool}` |
| POST | `/favorites/vocabulary/{key}` | — | `{favorited: bool}` |

Both POST favorites endpoints toggle — if already favorited, removes it.

---

## 5. Frontend Changes

### New files

```
src/stores/auth.js                  — user state, login/logout/OAuth actions
src/stores/content.js               — cached kana/vocab/kanji from API, fetchAll(lang)
src/composables/useApi.js           — axios instance, withCredentials, 401 → /login redirect
src/views/LoginView.vue             — email/password form + Google/GitHub OAuth buttons
src/views/RegisterView.vue          — email + username + password form
src/views/ProfileView.vue           — username, level, joined date, logout button
```

### Modified files

```
src/stores/progress.js              — remove localStorage; reads from /progress on login;
                                      writes are fire-and-forget (optimistic UI)
src/stores/settings.js             — remove localStorage; PATCH /settings on each change
src/composables/useLocaleData.js   — reads from content store instead of bundled JSONs
src/router/index.js                — add /login, /register, /profile routes;
                                      navigation guard: redirect to /login if no valid session
src/App.vue                        — call contentStore.fetchAll(lang) on mount after auth check
src/components/layout/AppSidebar.vue   — add user avatar + logout
src/components/layout/AppBottomNav.vue — same
```

### Deleted files

```
src/data/hiragana.js
src/data/katakana.js
src/data/kanji.js
src/data/n5_kanji.js
src/data/n4_kanji.js
src/data/n5_vocabulary.js
src/data/n4_vocabulary.js
src/i18n/translations/vocab-n5-pt-BR.json
src/i18n/translations/vocab-n4-pt-BR.json
src/i18n/translations/kanji-pt-BR.json
```

### Content caching strategy

```javascript
// src/stores/content.js
// fetchAll() called once in App.vue onMounted, after auth resolves
// All quiz/flashcard/dictionary views read from this store — no loading mid-session
useContentStore {
  kana: []         // hiragana + katakana combined
  vocabulary: []   // N5 + N4, in active language
  kanji: []        // N5 + N4, in active language
  fetchAll(lang)   // parallel fetch of all three content types
  refetchLang(lang) // called when user toggles language
}
```

### Auth flow

1. App boot → `GET /auth/me`
   - 200: populate auth store, fetch content, show app
   - 401: redirect to `/login`
2. Login/register → API sets `httpOnly` cookie → `GET /auth/me` → populate store
3. OAuth: `GET /auth/google` → Google → `GET /auth/google/callback` → API sets cookie → redirect to `/#/?status=success`
4. Logout: `POST /auth/logout` → cookie cleared → redirect to `/login`

---

## 6. API Build Prompt

Use this prompt to build the backend in a separate codebase:

---

> **Prompt for building the Nihongo Master API:**
>
> Build a FastAPI backend for a Japanese language learning app called Nihongo Master. This is a separate codebase from the Vue 3 frontend (hosted on GitHub Pages at `https://ginhu.github.io/Nihongo-Learning/`). Deploy target is Render with a Render-managed PostgreSQL 16 database.
>
> **Tech stack:** Python 3.12, FastAPI, SQLAlchemy 2.x (async with asyncpg), Alembic migrations, python-jose (JWT), bcrypt (password hashing), authlib (Google + GitHub OAuth), CORS configured for `https://ginhu.github.io`.
>
> **Auth:** JWT stored as `httpOnly` cookie (not Authorization header). Support email+password registration/login and OAuth via Google and GitHub. OAuth callbacks redirect to `https://ginhu.github.io/Nihongo-Learning/#/login?status=success` on success.
>
> **Database schema — implement all of these tables:**
>
> - `users` (id UUID, email unique, username unique, password_hash nullable, created_at, updated_at)
> - `oauth_accounts` (id UUID, user_id FK, provider text, provider_user_id text, unique on provider+provider_user_id)
> - `user_settings` (user_id PK FK, quiz_length int=10, romaji_visible bool=true, sound_enabled bool=true, theme text='dark', language text='en')
> - `user_progress` (user_id PK FK, xp int=0, streak int=0, last_played_date date nullable)
> - `quiz_history` (id UUID, user_id FK, mode text, score int, total int, xp_gained int, played_at timestamptz)
> - `character_stats` (user_id + char_key composite PK, correct int=0, incorrect int=0)
> - `flashcard_known` (user_id + card_id composite PK, known bool)
> - `favorites` (user_id + item_type + item_key composite PK)
> - `kana` (id serial, kana text, romaji text, type text, grp text)
> - `vocabulary` (id serial, expression text, reading text, meaning text, meaning_pt text nullable, jlpt text, pos text nullable, category text nullable, unique on expression+reading)
> - `kanji` (id serial, kanji text unique, meaning text[], meaning_pt text[] nullable, onyomi text[], kunyomi text[], jlpt text, stroke_count int, examples jsonb)
>
> **Endpoints to implement:**
>
> Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`, `GET /auth/google`, `GET /auth/google/callback`, `GET /auth/github`, `GET /auth/github/callback`, `GET /auth/me`
>
> Content (public, no auth): `GET /content/kana?type=`, `GET /content/vocabulary?jlpt=&lang=&category=`, `GET /content/kanji?jlpt=&lang=`
>
> Settings (auth required): `GET /settings`, `PATCH /settings`
>
> Progress (auth required): `GET /progress`, `POST /progress/quiz` (body: `{mode, score, total, answers: [{char_key, was_correct}]}` — handles XP + streak + level + character stat updates server-side in one call, returns `{xp_gained, new_level}`), `POST /progress/vocab-quiz` (body: `{mode, score, total, xp_total}` — XP pre-calculated by client, returns `{xp_gained, new_level}`), `GET /progress/history?mode=`, `GET /progress/character-stats`
>
> Flashcards (auth required): `GET /flashcards/known`, `PUT /flashcards/known/{card_id}`, `DELETE /flashcards/known/{card_id}`
>
> Favorites (auth required): `GET /favorites`, `POST /favorites/kanji/{kanji}` (toggle), `POST /favorites/vocabulary/{key}` (toggle)
>
> **XP logic (implement in `POST /progress/quiz`):**
> - +10 XP per correct answer
> - +50 XP bonus if score == total (perfect session)
> - Level = floor(xp / 500) + 1, capped at 10
> - Streak: compare last_played_date to today; if yesterday → streak+1; if today → no change; else → reset to 1
> - Return `{xp_gained, new_level}` where new_level is null if no level-up occurred
>
> **Seed data:** Include an Alembic seed migration or a `seed.py` script that populates the `kana`, `vocabulary`, and `kanji` tables from the existing frontend data files (provide the data inline or as JSON imports). The seed must be idempotent (safe to run twice).
>
> **Project structure:**
> ```
> app/
>   main.py
>   database.py
>   models/
>   schemas/
>   routers/
>     auth.py
>     content.py
>     settings.py
>     progress.py
>     flashcards.py
>     favorites.py
>   services/
>     auth_service.py
>     progress_service.py
>   core/
>     config.py      (Pydantic Settings — reads .env)
>     security.py    (JWT + bcrypt helpers)
>   alembic/
> requirements.txt
> .env.example
> README.md
> ```
>
> **Environment variables needed (.env.example):**
> ```
> DATABASE_URL=postgresql+asyncpg://...
> SECRET_KEY=...
> ALGORITHM=HS256
> ACCESS_TOKEN_EXPIRE_MINUTES=60
> REFRESH_TOKEN_EXPIRE_DAYS=30
> GOOGLE_CLIENT_ID=...
> GOOGLE_CLIENT_SECRET=...
> GITHUB_CLIENT_ID=...
> GITHUB_CLIENT_SECRET=...
> FRONTEND_URL=https://ginhu.github.io/Nihongo-Learning
> ```
>
> Include a `README.md` with: local dev setup, how to run migrations, how to seed data, and how to deploy to Render.

---

## 7. Frontend Migration Plan (high-level)

These are the implementation steps for the Vue frontend once the API is live. Detailed plan in `docs/superpowers/plans/2026-05-19-api-migration-plan.md`.

1. **Add `useApi` composable** — axios instance, `withCredentials: true`, 401 interceptor → router push `/login`
2. **Add `useAuthStore`** — `user`, `isAuthenticated`, `login()`, `logout()`, `checkSession()` backed by `/auth/me`
3. **Add `useContentStore`** — `fetchAll(lang)` parallel-fetches kana + vocab + kanji; called in `App.vue` on mount
4. **Rewrite `useSettingsStore`** — swap localStorage for `GET /settings` on init + `PATCH /settings` on change
5. **Rewrite `useProgressStore`** — swap localStorage for API; all writes fire-and-forget; reads on login
6. **Add router guards** — `beforeEach`: if route requires auth and `!isAuthenticated`, redirect to `/login`
7. **Add LoginView + RegisterView** — forms + OAuth buttons
8. **Update `useLocaleData`** — read from `useContentStore` instead of bundled JSON imports
9. **Delete bundled data files** — `src/data/*.js` and `src/i18n/translations/*.json`
10. **Add ProfileView** — user info + logout
11. **Update nav components** — user avatar + logout in sidebar/bottom nav
