# Nihongo Master — Frontend API Migration Plan

**Date:** 2026-05-19  
**Status:** Ready to implement (blocked on API being live)  
**Spec:** `docs/superpowers/specs/2026-05-19-api-migration-design.md`  
**Branch:** `feat/api-migration`

---

## Prerequisites

- [ ] API deployed on Render and reachable at its public URL
- [ ] PostgreSQL seeded with kana, vocabulary, and kanji data
- [ ] Google and GitHub OAuth apps configured with correct redirect URIs
- [ ] API URL saved as `VITE_API_URL` in `.env.local` (e.g. `https://nihongo-api.onrender.com`)

---

## Phase 1 — API foundation (no visible change to users)

### Task 1.1 — Install axios and add `useApi` composable

**File:** `src/composables/useApi.js` (new)

- Create an axios instance with `baseURL: import.meta.env.VITE_API_URL`
- Set `withCredentials: true` (sends httpOnly cookie automatically)
- Add response interceptor: on 401, call `router.push('/login')`
- Export the instance as `api`

### Task 1.2 — Add `useAuthStore`

**File:** `src/stores/auth.js` (new)

State:
- `user` (null | `{id, email, username}`)
- `isAuthenticated` (computed: `!!user`)

Actions:
- `checkSession()` — `GET /auth/me`; on 200 populate user; on 401 set user to null
- `login(email, password)` — `POST /auth/login`; on success call `checkSession()`
- `register(email, username, password)` — `POST /auth/register`; on success call `login()`
- `logout()` — `POST /auth/logout`; clear user; `router.push('/login')`

### Task 1.3 — Add router guards

**File:** `src/router/index.js`

- Add `meta: { requiresAuth: true }` to all routes except `/login` and `/register`
- Add `beforeEach` guard: if `requiresAuth` and `!authStore.isAuthenticated`, redirect to `/login`
- Add `/login`, `/register`, `/profile` routes

---

## Phase 2 — Content store (replaces bundled data files)

### Task 2.1 — Add `useContentStore`

**File:** `src/stores/content.js` (new)

State:
- `kana: []`
- `vocabulary: []`
- `kanji: []`
- `loaded: false`

Actions:
- `fetchAll(lang)` — parallel `GET /content/kana?type=hiragana`, `GET /content/kana?type=katakana`, `GET /content/vocabulary?jlpt=all&lang={lang}`, `GET /content/kanji?jlpt=all&lang={lang}`
- `refetchLang(lang)` — re-fetches vocabulary and kanji with new lang (kana never changes)

Call `fetchAll` in `App.vue` `onMounted` after `checkSession()` resolves.

### Task 2.2 — Wire content store into views

Replace all `import hiragana from '@/data/hiragana.js'` etc. with reads from `useContentStore`.

Files to update:
- `src/utils/quiz-generator.js` — reads kana/kanji from content store
- `src/views/QuizSelectView.vue`
- `src/views/QuizSessionView.vue`
- `src/views/FlashcardSelectView.vue`
- `src/views/FlashcardsSessionView.vue`
- `src/views/KanjiDictionaryView.vue`
- `src/views/VocabularySelectView.vue`
- `src/views/VocabularySessionView.vue`

### Task 2.3 — Update `useLocaleData`

**File:** `src/composables/useLocaleData.js`

- Remove imports of `vocab-n5-pt-BR.json`, `vocab-n4-pt-BR.json`, `kanji-pt-BR.json`
- Read from `useContentStore` instead — content already arrives in the active language from the API
- `getMeaning(item, type)` becomes a simple field read (`item.meaning`) since the API returns the correct language

### Task 2.4 — Delete bundled data files

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

---

## Phase 3 — Settings store migration

### Task 3.1 — Rewrite `useSettingsStore`

**File:** `src/stores/settings.js`

- Remove all localStorage logic
- On init: `GET /settings` → populate state
- On change: `PATCH /settings` with updated fields (debounce 500ms to avoid hammering on rapid changes like slider drag)
- Keep `applyTheme()` and `toggleTheme()` logic unchanged (DOM side effect, no API needed)
- Keep `setLanguage(lang)` — after setting, call `contentStore.refetchLang(lang)`

---

## Phase 4 — Progress store migration

### Task 4.1 — Rewrite `useProgressStore`

**File:** `src/stores/progress.js`

- Remove all localStorage logic
- On init (called after auth): `GET /progress` → populate xp, level, streak, lastPlayedDate
- `recordQuizResult(mode, score, total, answers)`:
  - Build `answers` as `[{char_key, was_correct}]` from existing answer objects
  - Fire-and-forget `POST /progress/quiz` — don't await, update local state optimistically
  - Return `{xpGained, newLevel}` from optimistic calculation (same formula as today)
- `recordVocabQuizResult(mode, score, total, xpTotal)`:
  - Fire-and-forget `POST /progress/vocab-quiz`
  - Return `{xpGained, newLevel}` optimistically
- `characterStats`: fetched via `GET /progress/character-stats` on init
- `quizHistory`: fetched via `GET /progress/history` on init
- `checkStreak()`: removed — server handles streak on `POST /progress/quiz`

### Task 4.2 — Rewrite favorites actions

- `toggleFavoriteKanji(kanji)` → `POST /favorites/kanji/{kanji}` (fire-and-forget + optimistic local toggle)
- `toggleFavoriteVocabulary(key)` → `POST /favorites/vocabulary/{key}` (same)
- `favoritedKanji` and `favoritedVocabulary` fetched from `GET /favorites` on init

### Task 4.3 — Rewrite flashcard known actions

- `recordFlashcardKnown(id, known)` → `PUT /flashcards/known/{card_id}` (fire-and-forget + optimistic)
- `flashcardKnown` fetched from `GET /flashcards/known` on init

---

## Phase 5 — Auth views

### Task 5.1 — Add `LoginView.vue`

**File:** `src/views/LoginView.vue` (new)  
**Route:** `/login`

- Email + password form → calls `authStore.login()`
- "Sign in with Google" button → `window.location.href = API_URL + '/auth/google'`
- "Sign in with GitHub" button → `window.location.href = API_URL + '/auth/github'`
- Link to `/register`
- On success: redirect to `/`

### Task 5.2 — Add `RegisterView.vue`

**File:** `src/views/RegisterView.vue` (new)  
**Route:** `/register`

- Email + username + password form → calls `authStore.register()`
- "Or sign in with Google/GitHub" buttons (same OAuth flow)
- Link back to `/login`
- On success: redirect to `/`

### Task 5.3 — Add `ProfileView.vue`

**File:** `src/views/ProfileView.vue` (new)  
**Route:** `/profile`

- Show: username, email, level title, XP, joined date
- Logout button → calls `authStore.logout()`

---

## Phase 6 — Nav updates

### Task 6.1 — Update `AppSidebar.vue` and `AppBottomNav.vue`

- Add user avatar (initials fallback) at bottom of sidebar
- Add "Profile" link → `/profile`
- Logout button visible when authenticated

---

## Phase 7 — App.vue boot sequence

### Task 7.1 — Update `App.vue` mount

Replace current theme init with full boot sequence:

```javascript
onMounted(async () => {
  settingsStore.applyTheme()           // apply theme immediately (no flash)
  await authStore.checkSession()       // check if logged in
  if (authStore.isAuthenticated) {
    await contentStore.fetchAll(settingsStore.language)
    await progressStore.init()         // load progress, favorites, flashcard state
  }
})
```

---

## Phase 8 — Language toggle update

### Task 8.1 — Update `LanguageToggle.vue`

When language changes:
1. `settingsStore.setLanguage(lang)` → PATCHes `/settings`
2. `contentStore.refetchLang(lang)` → re-fetches vocab + kanji in new language
3. `i18n.locale.value = lang` (unchanged)

---

## Notes for implementation

- **Optimistic writes:** Quiz results, favorites, and flashcard known state are all written optimistically — local state updates immediately, API call fires in background. No loading spinners during gameplay.
- **Error handling:** If the background API write fails, log to console but don't interrupt the user. A future improvement could add a subtle sync-failed indicator.
- **Token refresh:** The `httpOnly` cookie approach means the browser handles cookie sending automatically. `POST /auth/refresh` should be called by the 401 interceptor before giving up and redirecting to login.
- **Content caching:** `useContentStore` data survives the session in Pinia memory. If the user switches language, only vocab+kanji re-fetches (kana is language-independent).
- **CORS:** API must allow `https://ginhu.github.io` origin with `credentials: true`.
