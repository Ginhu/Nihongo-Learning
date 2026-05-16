# pt-BR Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Portuguese (pt-BR) language support with a toggle button; translate all UI strings and all learning-content meanings (vocabulary, kanji) via overlay JSON files.

**Architecture:** vue-i18n v9 (Composition API, `legacy: false`) for UI strings stored in `src/i18n/en.json` + `src/i18n/pt-BR.json`. A `useLocaleData` composable overlays Portuguese meanings from three small JSON files without modifying source data files. Language preference persisted in settings store; i18n locale stays in sync via LanguageToggle.

**Tech Stack:** Vue 3 Composition API, vue-i18n v9, Pinia, Vite 6, Tailwind CSS v3

---

## File Map

**New files:**
- `src/i18n/index.js` — creates and exports i18n instance
- `src/i18n/en.json` — all English UI strings
- `src/i18n/pt-BR.json` — all Portuguese UI strings
- `src/components/layout/LanguageToggle.vue` — toggle button (same pattern as ThemeToggle)
- `src/composables/useLocaleData.js` — provides `getMeaning`, `getFirstMeaning`, `getExampleMeaning`
- `src/i18n/translations/vocab-n5-pt-BR.json` — 511-entry overlay: `"expression::reading": "meaning"`
- `src/i18n/translations/vocab-n4-pt-BR.json` — 666-entry overlay
- `src/i18n/translations/kanji-pt-BR.json` — overlay for kanji.js + n5_kanji.js + n4_kanji.js

**Modified files:**
- `src/main.js` — add `app.use(i18n)`, set initial locale from settings
- `src/stores/settings.js` — add `language` ref + `setLanguage()` + persist
- `src/components/layout/AppSidebar.vue` — add LanguageToggle, translate nav labels via $t()
- `src/components/layout/AppBottomNav.vue` — translate nav labels
- `src/components/layout/ThemeToggle.vue` — translate button text
- `src/App.vue` — add mobile LanguageToggle button
- `src/views/HomeView.vue` — translate welcome string
- `src/views/QuizSelectView.vue` — translate title, subtitle, card titles/descs, Questions label
- `src/views/QuizSessionView.vue` — translate level-up, correct, no-session strings
- `src/views/FlashcardSelectView.vue` — translate all labels and Start button
- `src/views/FlashcardsSessionView.vue` — translate all session UI strings
- `src/views/VocabularySelectView.vue` — translate all labels and option strings
- `src/views/VocabularySessionView.vue` — translate level-up, correct, back; wire useLocaleData
- `src/views/KanjiDictionaryView.vue` — translate search placeholder, empty state; wire useLocaleData
- `src/views/ProgressView.vue` — translate title and section headers
- `src/components/quiz/QuizModeCard.vue` — translate Direction/Difficulty/JLPT labels and Start Quiz
- `src/components/quiz/QuizEndScreen.vue` — translate % correct, Time, XP earned, Home, Retry
- `src/components/vocabulary/VocabQuestionCard.vue` — translate "What is this in Japanese?"; wire useLocaleData
- `src/components/vocabulary/VocabTipPanel.vue` — translate "Tip {n}"
- `src/components/vocabulary/KanjiDetailModal.vue` — translate On'yomi/Kun'yomi/Examples/strokes/favorite labels
- `src/components/flashcard/BatchResultModal.vue` — translate all modal strings
- `src/components/progress/XpBar.vue` — translate Level/MAX/XP strings
- `src/components/progress/StreakBadge.vue` — translate "day streak"
- `src/components/progress/WeakCharacters.vue` — translate section header and tip
- `src/components/progress/AccuracyChart.vue` — translate section header and "No data yet"
- `src/views/FlashcardsSessionView.vue` — wire useLocaleData for card meaning
- `CLAUDE.md` — update completed phases and changelog

---

## Task 1: Branch + i18n infrastructure + LanguageToggle

**Files:**
- Create: `src/i18n/index.js`
- Create: `src/i18n/en.json`
- Create: `src/i18n/pt-BR.json`
- Create: `src/components/layout/LanguageToggle.vue`
- Modify: `src/stores/settings.js`
- Modify: `src/main.js`
- Modify: `src/components/layout/AppSidebar.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: Create branch**

```bash
git checkout -b feat/pt-br
```

- [ ] **Step 2: Install vue-i18n**

```bash
npm install vue-i18n@9
```

Verify: `package.json` now lists `"vue-i18n": "^9.x.x"` in dependencies.

- [ ] **Step 3: Create `src/i18n/en.json`**

```json
{
  "nav": {
    "home": "Home",
    "quiz": "Quiz",
    "flashcards": "Flashcards",
    "vocabularyQuiz": "Vocabulary Quiz",
    "kanjiDictionary": "Kanji Dictionary",
    "progress": "Progress",
    "cards": "Cards",
    "words": "Words",
    "kanji": "Kanji"
  },
  "home": {
    "welcome": "Welcome. Choose a section to begin."
  },
  "quiz": {
    "title": "Quiz",
    "subtitle": "Select a mode, set your options, and start.",
    "questions": "Questions:",
    "all": "All",
    "direction": "Direction",
    "jlptLevel": "JLPT Level",
    "difficulty": "Difficulty",
    "easy": "Easy (2)",
    "medium": "Medium (4)",
    "hard": "Hard (6)",
    "startQuiz": "Start Quiz",
    "kanaToRomaji": "Kana → Romaji",
    "romajiToKana": "Romaji → Kana",
    "kanjiToMeaning": "Kanji → Meaning",
    "meaningToKanji": "Meaning → Kanji",
    "hiraganaTitle": "Hiragana",
    "hiraganaDesc": "Practice the 46 base + 25 voiced hiragana characters.",
    "katakanaTitle": "Katakana",
    "katakanaDesc": "Practice the 46 base + 25 voiced katakana characters.",
    "kanjiTitle": "Kanji",
    "kanjiDesc": "Test your JLPT N5 and N4 kanji knowledge.",
    "levelUp": "Level Up!",
    "noSession": "No active session.",
    "chooseQuiz": "Choose a quiz",
    "correct": "Correct:",
    "tapToContinue": "— tap the green button to continue"
  },
  "endScreen": {
    "percentCorrect": "% correct",
    "time": "Time:",
    "xpEarned": "+{xp} XP earned",
    "home": "Home",
    "retry": "Retry"
  },
  "flashcards": {
    "title": "Flashcards",
    "subtitle": "Choose your deck and start practicing.",
    "type": "Type",
    "level": "Level",
    "cardsPerRound": "Cards per round",
    "categories": "Categories",
    "optional": "optional",
    "start": "Start →",
    "back": "← Back",
    "noCards": "No cards in this deck yet.",
    "favoriteTip": "Favorite some cards to see them here.",
    "knownOf": "{known} / {total} known",
    "cardOf": "Card {current} of {total}",
    "shuffle": "Shuffle",
    "needsPractice": "✗ Needs Practice",
    "known": "✓ Known",
    "favorited": "♥ Favorited",
    "favorite": "♡ Favorite",
    "prev": "← Prev",
    "next": "Next →"
  },
  "batchResult": {
    "roundComplete": "Round Complete! 🎉",
    "known": "✓ Known",
    "needsPractice": "✗ Needs Practice",
    "continue": "Continue →",
    "backToSelection": "← Back to Selection"
  },
  "vocabQuiz": {
    "title": "Vocabulary Quiz",
    "subtitle": "Test your knowledge. Guess the meaning.",
    "type": "Type",
    "vocabulary": "Vocabulary",
    "kanji": "Kanji",
    "level": "Level",
    "direction": "Direction",
    "wordMeaning": "Word → Meaning",
    "meaningWord": "Meaning → Word",
    "difficulty": "Difficulty",
    "easy": "Easy",
    "normal": "Normal",
    "hard": "Hard",
    "categories": "Categories",
    "optional": "optional",
    "count": "Count",
    "start": "Start →",
    "back": "← Back",
    "whatIsInJapanese": "— What is this in Japanese?",
    "tip": "Tip",
    "correct": "Correct:",
    "levelUp": "Level Up!",
    "noSession": "No active session.",
    "chooseQuiz": "Choose a quiz"
  },
  "kanjiDict": {
    "searchPlaceholder": "Search by kanji or meaning...",
    "noKanjiFound": "No kanji found.",
    "noKanjiFoundFor": "No kanji found for \"{search}\".",
    "onyomi": "On'yomi:",
    "kunyomi": "Kun'yomi:",
    "strokes": "strokes",
    "examples": "Examples",
    "addToFlashcards": "☆ Add to Flashcard Deck",
    "removeFromFlashcards": "★ Remove from Flashcard Deck"
  },
  "progress": {
    "title": "Progress",
    "recentQuizzes": "RECENT QUIZZES",
    "noQuizzes": "No quizzes completed yet. Start a quiz to see your history!",
    "accuracyByScript": "ACCURACY BY SCRIPT",
    "noData": "No data yet",
    "weakCharacters": "WEAK CHARACTERS",
    "weakCharactersTip": "Keep practicing — weak characters appear after 3+ attempts on each.",
    "level": "Level",
    "max": "MAX",
    "xpProgress": "{xp} / 500 XP",
    "xpTotal": "{xp} XP total",
    "dayStreak": "day streak"
  },
  "theme": {
    "dark": "Dark Mode",
    "light": "Light Mode"
  },
  "language": {
    "en": "English",
    "ptBR": "Português"
  }
}
```

- [ ] **Step 4: Create `src/i18n/pt-BR.json`**

```json
{
  "nav": {
    "home": "Início",
    "quiz": "Quiz",
    "flashcards": "Flashcards",
    "vocabularyQuiz": "Quiz de Vocabulário",
    "kanjiDictionary": "Dicionário de Kanji",
    "progress": "Progresso",
    "cards": "Cards",
    "words": "Palavras",
    "kanji": "Kanji"
  },
  "home": {
    "welcome": "Bem-vindo. Escolha uma seção para começar."
  },
  "quiz": {
    "title": "Quiz",
    "subtitle": "Selecione um modo, configure as opções e comece.",
    "questions": "Questões:",
    "all": "Todos",
    "direction": "Direção",
    "jlptLevel": "Nível JLPT",
    "difficulty": "Dificuldade",
    "easy": "Fácil (2)",
    "medium": "Médio (4)",
    "hard": "Difícil (6)",
    "startQuiz": "Iniciar Quiz",
    "kanaToRomaji": "Kana → Romaji",
    "romajiToKana": "Romaji → Kana",
    "kanjiToMeaning": "Kanji → Significado",
    "meaningToKanji": "Significado → Kanji",
    "hiraganaTitle": "Hiragana",
    "hiraganaDesc": "Pratique os 46 caracteres base + 25 hiragana sonoros.",
    "katakanaTitle": "Katakana",
    "katakanaDesc": "Pratique os 46 caracteres base + 25 katakana sonoros.",
    "kanjiTitle": "Kanji",
    "kanjiDesc": "Teste seu conhecimento de kanji JLPT N5 e N4.",
    "levelUp": "Subiu de Nível!",
    "noSession": "Nenhuma sessão ativa.",
    "chooseQuiz": "Escolher quiz",
    "correct": "Correto:",
    "tapToContinue": "— toque no botão verde para continuar"
  },
  "endScreen": {
    "percentCorrect": "% correto",
    "time": "Tempo:",
    "xpEarned": "+{xp} XP ganho",
    "home": "Início",
    "retry": "Tentar Novamente"
  },
  "flashcards": {
    "title": "Flashcards",
    "subtitle": "Escolha seu baralho e comece a praticar.",
    "type": "Tipo",
    "level": "Nível",
    "cardsPerRound": "Cards por rodada",
    "categories": "Categorias",
    "optional": "opcional",
    "start": "Iniciar →",
    "back": "← Voltar",
    "noCards": "Nenhum card neste baralho ainda.",
    "favoriteTip": "Favorite alguns cards para vê-los aqui.",
    "knownOf": "{known} / {total} conhecidos",
    "cardOf": "Card {current} de {total}",
    "shuffle": "Embaralhar",
    "needsPractice": "✗ Precisa Praticar",
    "known": "✓ Sei",
    "favorited": "♥ Favoritado",
    "favorite": "♡ Favoritar",
    "prev": "← Anterior",
    "next": "Próximo →"
  },
  "batchResult": {
    "roundComplete": "Rodada Completa! 🎉",
    "known": "✓ Sei",
    "needsPractice": "✗ Precisa Praticar",
    "continue": "Continuar →",
    "backToSelection": "← Voltar à Seleção"
  },
  "vocabQuiz": {
    "title": "Quiz de Vocabulário",
    "subtitle": "Teste seu conhecimento. Adivinhe o significado.",
    "type": "Tipo",
    "vocabulary": "Vocabulário",
    "kanji": "Kanji",
    "level": "Nível",
    "direction": "Direção",
    "wordMeaning": "Palavra → Significado",
    "meaningWord": "Significado → Palavra",
    "difficulty": "Dificuldade",
    "easy": "Fácil",
    "normal": "Normal",
    "hard": "Difícil",
    "categories": "Categorias",
    "optional": "opcional",
    "count": "Quantidade",
    "start": "Iniciar →",
    "back": "← Voltar",
    "whatIsInJapanese": "— Como se diz em japonês?",
    "tip": "Dica",
    "correct": "Correto:",
    "levelUp": "Subiu de Nível!",
    "noSession": "Nenhuma sessão ativa.",
    "chooseQuiz": "Escolher quiz"
  },
  "kanjiDict": {
    "searchPlaceholder": "Buscar por kanji ou significado...",
    "noKanjiFound": "Nenhum kanji encontrado.",
    "noKanjiFoundFor": "Nenhum kanji encontrado para \"{search}\".",
    "onyomi": "On'yomi:",
    "kunyomi": "Kun'yomi:",
    "strokes": "traços",
    "examples": "Exemplos",
    "addToFlashcards": "☆ Adicionar aos Flashcards",
    "removeFromFlashcards": "★ Remover dos Flashcards"
  },
  "progress": {
    "title": "Progresso",
    "recentQuizzes": "QUIZZES RECENTES",
    "noQuizzes": "Nenhum quiz concluído ainda. Inicie um quiz para ver seu histórico!",
    "accuracyByScript": "PRECISÃO POR ESCRITA",
    "noData": "Sem dados ainda",
    "weakCharacters": "CARACTERES FRACOS",
    "weakCharactersTip": "Continue praticando — caracteres fracos aparecem após 3+ tentativas.",
    "level": "Nível",
    "max": "MÁX",
    "xpProgress": "{xp} / 500 XP",
    "xpTotal": "{xp} XP total",
    "dayStreak": "dias seguidos"
  },
  "theme": {
    "dark": "Modo Escuro",
    "light": "Modo Claro"
  },
  "language": {
    "en": "English",
    "ptBR": "Português"
  }
}
```

- [ ] **Step 5: Create `src/i18n/index.js`**

```js
import { createI18n } from 'vue-i18n'
import en from './en.json'
import ptBR from './pt-BR.json'

export default createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, 'pt-BR': ptBR }
})
```

- [ ] **Step 6: Update `src/stores/settings.js`**

Replace the entire file with:

```js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'nihongo-settings'

export const useSettingsStore = defineStore('settings', () => {
  let saved = {}
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { /* use defaults */ }

  const quizLength    = ref(saved.quizLength    ?? 10)
  const romajiVisible = ref(saved.romajiVisible ?? true)
  const soundEnabled  = ref(saved.soundEnabled  ?? true)
  const theme         = ref(saved.theme         ?? 'dark')
  const language      = ref(saved.language      ?? 'en')

  function applyTheme() {
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme()
  }

  function setLanguage(lang) {
    language.value = lang
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      quizLength:    quizLength.value,
      romajiVisible: romajiVisible.value,
      soundEnabled:  soundEnabled.value,
      theme:         theme.value,
      language:      language.value
    }))
  }

  watch([quizLength, romajiVisible, soundEnabled, theme, language], persist, { deep: true })

  return { quizLength, romajiVisible, soundEnabled, theme, language, applyTheme, toggleTheme, setLanguage }
})
```

- [ ] **Step 7: Update `src/main.js`**

Replace the entire file with:

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { useSettingsStore } from './stores/settings'
import './assets/main.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)

const settings = useSettingsStore()
i18n.global.locale.value = settings.language
settings.applyTheme()

app.mount('#app')
```

- [ ] **Step 8: Create `src/components/layout/LanguageToggle.vue`**

```vue
<template>
  <button
    class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-primary/10"
    style="color: inherit;"
    @click="toggle"
  >
    <span class="text-lg">🌐</span>
    <span>{{ locale === 'en' ? $t('language.ptBR') : $t('language.en') }}</span>
  </button>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'

const { locale } = useI18n()
const settings = useSettingsStore()

function toggle() {
  const next = locale.value === 'en' ? 'pt-BR' : 'en'
  locale.value = next
  settings.setLanguage(next)
}
</script>
```

- [ ] **Step 9: Update `src/components/layout/AppSidebar.vue`**

Replace the entire file with:

```vue
<template>
  <aside
    class="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 z-20 border-r"
    style="background: var(--color-surface); border-color: var(--color-border);"
  >
    <div class="p-4 border-b" style="border-color: var(--color-border);">
      <span class="text-lg font-bold text-primary">日本語マスター</span>
    </div>
    <nav class="flex flex-col gap-1 p-3 flex-1">
      <RouterLink
        v-for="link in links"
        :key="link.name"
        :to="link.to"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="[(route.name === link.name || (link.name === 'vocabulary' && route.name === 'vocabulary-session') || (link.name === 'flashcards' && route.name === 'flashcards-session'))
          ? 'bg-primary text-white'
          : 'hover:bg-primary/10']"
        style="color: inherit;"
      >
        <span class="text-lg">{{ link.icon }}</span>
        {{ $t(link.labelKey) }}
      </RouterLink>
    </nav>
    <div class="p-3 border-t space-y-1" style="border-color: var(--color-border);">
      <LanguageToggle />
      <ThemeToggle />
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import ThemeToggle    from './ThemeToggle.vue'
import LanguageToggle from './LanguageToggle.vue'

const route = useRoute()

const links = [
  { name: 'home',             to: '/',                icon: '🏠', labelKey: 'nav.home'             },
  { name: 'quiz-select',      to: '/quiz',            icon: '🎯', labelKey: 'nav.quiz'             },
  { name: 'flashcards',       to: '/flashcards',      icon: '🃏', labelKey: 'nav.flashcards'       },
  { name: 'vocabulary',       to: '/vocabulary',      icon: '🎮', labelKey: 'nav.vocabularyQuiz'   },
  { name: 'kanji-dictionary', to: '/kanji-dictionary',icon: '📖', labelKey: 'nav.kanjiDictionary'  },
  { name: 'progress',         to: '/progress',        icon: '📊', labelKey: 'nav.progress'         },
]
</script>
```

- [ ] **Step 10: Update `src/App.vue` — add mobile LanguageToggle**

Read the current `src/App.vue`. Find the mobile theme toggle button (`md:hidden` floating button). Add a LanguageToggle import and place a mobile language toggle button next to the theme toggle. The existing mobile theme toggle looks like a floating button top-right. Add the language toggle just to its left (or below it). Import `LanguageToggle` from `@/components/layout/LanguageToggle.vue` and add it in the `md:hidden` area.

The exact position depends on App.vue's current layout — read it first, then add `<LanguageToggle />` alongside the existing mobile theme toggle in the md:hidden section. Wrap both in a `flex gap-2` container if needed.

- [ ] **Step 11: Run build, confirm no errors**

```bash
npm run build
```

Expected: build succeeds. If import errors occur (e.g., missing JSON), check that `src/i18n/en.json` and `src/i18n/pt-BR.json` exist with valid JSON.

- [ ] **Step 12: Commit**

```bash
git add src/i18n/ src/components/layout/LanguageToggle.vue src/components/layout/AppSidebar.vue src/stores/settings.js src/main.js src/App.vue package.json package-lock.json
git commit -m "feat: add vue-i18n infrastructure, LanguageToggle, en/pt-BR locale files"
```

---

## Task 2: Update all components and views to use $t()

**Files:** All 20 files listed below — mechanical string-replacement task.

**Before each file:** Add `import { useI18n } from 'vue-i18n'` and `const { t } = useI18n()` inside `<script setup>` if the component uses strings in script (computed arrays, etc.). Use `$t('key')` in templates, `t('key')` in script.

- [ ] **Step 1: Update `src/views/HomeView.vue`**

```vue
<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold text-primary">日本語マスター</h1>
    <p class="mt-2" style="color: var(--color-text-muted)">{{ $t('home.welcome') }}</p>
  </div>
</template>

<script setup>
</script>
```

- [ ] **Step 2: Update `src/views/QuizSelectView.vue`**

Read the file. Add `import { useI18n } from 'vue-i18n'` and `const { t } = useI18n()` inside `<script setup>`.

Change the `cards` reactive array to use i18n key getters instead of hardcoded strings:

```js
const cards = reactive([
  {
    mode: 'hiragana',
    get title() { return t('quiz.hiraganaTitle') },
    get description() { return t('quiz.hiraganaDesc') },
    sampleChar: 'あ',
    direction: 'kana-to-romaji',
    difficulty: 'medium',
    jlpt: 'all'
  },
  {
    mode: 'katakana',
    get title() { return t('quiz.katakanaTitle') },
    get description() { return t('quiz.katakanaDesc') },
    sampleChar: 'ア',
    direction: 'kana-to-romaji',
    difficulty: 'medium',
    jlpt: 'all'
  },
  {
    mode: 'kanji',
    get title() { return t('quiz.kanjiTitle') },
    get description() { return t('quiz.kanjiDesc') },
    sampleChar: '日',
    direction: 'kanji-to-meaning',
    difficulty: 'medium',
    jlpt: 'all'
  }
])
```

In the template, update:
- `<h1 ...>Quiz</h1>` → `<h1 ...>{{ $t('quiz.title') }}</h1>`
- `"Select a mode..."` paragraph → `{{ $t('quiz.subtitle') }}`
- `<span ...>Questions:</span>` → `{{ $t('quiz.questions') }}`
- `>All</button>` (kanji count All button) → `{{ $t('quiz.all') }}`

- [ ] **Step 3: Update `src/views/QuizSessionView.vue`**

Read the file. Add `const { t } = useI18n()` (and import).

Replace:
- `"Level Up!"` text → `{{ $t('quiz.levelUp') }}`
- `"No active session."` → `{{ $t('quiz.noSession') }}`
- `"Choose a quiz"` button → `{{ $t('quiz.chooseQuiz') }}`
- `"Correct: "` → `{{ $t('quiz.correct') }}`
- `"— tap the green button to continue"` → `{{ $t('quiz.tapToContinue') }}`

- [ ] **Step 4: Update `src/views/FlashcardSelectView.vue`**

Read the file. Add `const { t } = useI18n()` (and import).

Replace:
- `"Flashcards"` h1 → `{{ $t('flashcards.title') }}`
- subtitle paragraph → `{{ $t('flashcards.subtitle') }}`
- `"Type"` section label → `{{ $t('flashcards.type') }}`
- `"Level"` section label → `{{ $t('flashcards.level') }}`
- `"Cards per round"` section label → `{{ $t('flashcards.cardsPerRound') }}`
- `"Categories"` section label → `{{ $t('flashcards.categories') }}`
- `"(optional)"` span → `({{ $t('flashcards.optional') }})`
- `"Start →"` button → `{{ $t('flashcards.start') }}`

- [ ] **Step 5: Update `src/views/FlashcardsSessionView.vue`**

Read the file. Add `const { t } = useI18n()` (and import).

Replace:
- `"← Back"` button → `{{ $t('flashcards.back') }}`
- `"No cards in this deck yet."` → `{{ $t('flashcards.noCards') }}`
- `"Favorite some cards to see them here."` → `{{ $t('flashcards.favoriteTip') }}`
- `{{ knownCount }} / {{ currentBatch.length }} known` → `{{ $t('flashcards.knownOf', { known: knownCount, total: currentBatch.length }) }}`
- `Card {{ currentIndex + 1 }} of {{ currentBatch.length }}` → `{{ $t('flashcards.cardOf', { current: currentIndex + 1, total: currentBatch.length }) }}`
- `"Shuffle"` button → `{{ $t('flashcards.shuffle') }}`
- `"✗ Needs Practice"` button → `{{ $t('flashcards.needsPractice') }}`
- `"✓ Known"` button → `{{ $t('flashcards.known') }}`
- `"♥ Favorited"` → `{{ $t('flashcards.favorited') }}`
- `"♡ Favorite"` → `{{ $t('flashcards.favorite') }}`
- `"← Prev"` button → `{{ $t('flashcards.prev') }}`
- `"Next →"` button → `{{ $t('flashcards.next') }}`

- [ ] **Step 6: Update `src/views/VocabularySelectView.vue`**

Read the file. Add `const { t } = useI18n()` (and import).

The `types`, `directions`, and `difficulties` arrays have hardcoded labels. Replace them so labels use `t()`:

```js
const types = computed(() => [
  { value: 'vocab', label: t('vocabQuiz.vocabulary') },
  { value: 'kanji', label: t('vocabQuiz.kanji') },
])

const directions = [
  { value: 'word-meaning', label: t('vocabQuiz.wordMeaning') },
  { value: 'meaning-word', label: t('vocabQuiz.meaningWord') },
]

const difficulties = [
  { value: 'easy',   label: t('vocabQuiz.easy') },
  { value: 'normal', label: t('vocabQuiz.normal') },
  { value: 'hard',   label: t('vocabQuiz.hard') },
]
```

Note: `directions` and `difficulties` are simple arrays (not reactive), so they re-evaluate on every render — this is fine for locale switching. If they were declared as `const` (not reactive), change to `computed`.

In template, replace:
- `"Vocabulary Quiz"` h1 → `{{ $t('vocabQuiz.title') }}`
- subtitle paragraph → `{{ $t('vocabQuiz.subtitle') }}`
- `"Type"` section label → `{{ $t('vocabQuiz.type') }}`
- `"Level"` section label → `{{ $t('vocabQuiz.level') }}`
- `"Direction"` section label → `{{ $t('vocabQuiz.direction') }}`
- `"Difficulty"` section label → `{{ $t('vocabQuiz.difficulty') }}`
- `"Categories"` section label → `{{ $t('vocabQuiz.categories') }}`
- `"(optional)"` → `({{ $t('vocabQuiz.optional') }})`
- `"Cards per round"` count label (if present) → `{{ $t('vocabQuiz.count') }}`
- `"Start →"` button → `{{ $t('vocabQuiz.start') }}`

- [ ] **Step 7: Update `src/views/VocabularySessionView.vue`**

Read the file. Add `const { t } = useI18n()` (and import).

Replace:
- `"Level Up!"` → `{{ $t('vocabQuiz.levelUp') }}`
- `"← Back"` button → `{{ $t('vocabQuiz.back') }}`
- `"Correct:"` → `{{ $t('vocabQuiz.correct') }}`
- `"No active session."` → `{{ $t('vocabQuiz.noSession') }}`
- `"Choose a quiz"` button → `{{ $t('vocabQuiz.chooseQuiz') }}`

- [ ] **Step 8: Update `src/views/KanjiDictionaryView.vue`**

Read the file. No script changes needed for basic string translation. In template:

Replace:
- `placeholder="Search by kanji or meaning..."` → `:placeholder="$t('kanjiDict.searchPlaceholder')"`
- The empty state `<p>No kanji found{{ search ? ... : '' }}.</p>` → 
  ```html
  <p>{{ search ? $t('kanjiDict.noKanjiFoundFor', { search }) : $t('kanjiDict.noKanjiFound') }}</p>
  ```

- [ ] **Step 9: Update `src/views/ProgressView.vue`**

Read the file. In template:

Replace:
- `"Progress"` h1 → `{{ $t('progress.title') }}`
- `"RECENT QUIZZES"` section header → `{{ $t('progress.recentQuizzes') }}`
- `"No quizzes completed yet..."` → `{{ $t('progress.noQuizzes') }}`

- [ ] **Step 10: Update `src/components/quiz/QuizModeCard.vue`**

Read the file. Add `const { t } = useI18n()` (and import).

The `directions` computed and `difficulties` array use hardcoded labels. Update them:

```js
const directions = computed(() => {
  if (props.mode === 'kanji') {
    return [
      { value: 'kanji-to-meaning', label: t('quiz.kanjiToMeaning') },
      { value: 'meaning-to-kanji', label: t('quiz.meaningToKanji') },
    ]
  }
  return [
    { value: 'kana-to-romaji', label: t('quiz.kanaToRomaji') },
    { value: 'romaji-to-kana', label: t('quiz.romajiToKana') },
  ]
})

const difficulties = computed(() => [
  { value: 'easy',   label: t('quiz.easy') },
  { value: 'medium', label: t('quiz.medium') },
  { value: 'hard',   label: t('quiz.hard') },
])
```

In template:
- `"Direction"` label → `{{ $t('quiz.direction') }}`
- `"JLPT Level"` label → `{{ $t('quiz.jlptLevel') }}`
- `"Difficulty"` label → `{{ $t('quiz.difficulty') }}`
- `"All"` (JLPT all button) → `{{ lvl === 'all' ? $t('quiz.all') : lvl }}`
- `"Start Quiz"` button → `{{ $t('quiz.startQuiz') }}`

- [ ] **Step 11: Update `src/components/quiz/QuizEndScreen.vue`**

Read the file. In template:

Replace:
- `"% correct"` text → `{{ percentage }}{{ $t('endScreen.percentCorrect') }}`
- `"Time: {{ formattedTime }}"` → `{{ $t('endScreen.time') }} {{ formattedTime }}`
- `"+{{ xpGained }} XP earned"` → `{{ $t('endScreen.xpEarned', { xp: xpGained }) }}`
- `"Home"` button → `{{ $t('endScreen.home') }}`
- `"Retry"` button → `{{ $t('endScreen.retry') }}`

- [ ] **Step 12: Update `src/components/vocabulary/VocabQuestionCard.vue`**

Replace the "What is this in Japanese?" string (translation happens in Task 3 — for now just add $t):

```html
<div class="text-xs mt-2" style="color: var(--color-text-muted);">{{ $t('vocabQuiz.whatIsInJapanese') }}</div>
```

The meaning display (`item.meaning[0]` / `item.meaning`) stays as-is here — it gets localized in Task 3.

- [ ] **Step 13: Update `src/components/vocabulary/VocabTipPanel.vue`**

Read the file. Replace `Tip {{ i + 1 }}` with `{{ $t('vocabQuiz.tip') }} {{ i + 1 }}`.

- [ ] **Step 14: Update `src/components/vocabulary/KanjiDetailModal.vue`**

Read the file. In template:

Replace:
- `"On'yomi: "` → `{{ $t('kanjiDict.onyomi') }}`
- `"Kun'yomi: "` → `{{ $t('kanjiDict.kunyomi') }}`
- `"{{ kanji.strokeCount }} strokes"` → `{{ kanji.strokeCount }} {{ $t('kanjiDict.strokes') }}`
- `"Examples"` heading → `{{ $t('kanjiDict.examples') }}`
- `"★ Remove from Flashcard Deck"` → `{{ $t('kanjiDict.removeFromFlashcards') }}`
- `"☆ Add to Flashcard Deck"` → `{{ $t('kanjiDict.addToFlashcards') }}`

- [ ] **Step 15: Update `src/components/flashcard/BatchResultModal.vue`**

Read the file. In template:

Replace:
- `"Round Complete! 🎉"` → `{{ $t('batchResult.roundComplete') }}`
- `"✓ Known"` (label) → `{{ $t('batchResult.known') }}`
- `"✗ Needs Practice"` (label) → `{{ $t('batchResult.needsPractice') }}`
- `"Continue →"` button → `{{ $t('batchResult.continue') }}`
- `"← Back to Selection"` button → `{{ $t('batchResult.backToSelection') }}`

- [ ] **Step 16: Update `src/components/progress/XpBar.vue`**

Read the file. Add `const { t } = useI18n()` (and import).

In template:
- `"Level {{ progress.level }}"` → `{{ $t('progress.level') }} {{ progress.level }}`
- `'MAX'` (in the conditional) → `$t('progress.max')`
- `` `${xpInLevel} / 500 XP` `` → `$t('progress.xpProgress', { xp: xpInLevel })`
- `"{{ progress.xp }} XP total"` → `{{ $t('progress.xpTotal', { xp: progress.xp }) }}`

The isMaxLevel conditional: `{{ isMaxLevel ? $t('progress.max') : $t('progress.xpProgress', { xp: xpInLevel }) }}`

- [ ] **Step 17: Update `src/components/progress/StreakBadge.vue`**

Replace `"day streak"` → `{{ $t('progress.dayStreak') }}`

- [ ] **Step 18: Update `src/components/progress/WeakCharacters.vue`**

Replace:
- `"WEAK CHARACTERS"` → `{{ $t('progress.weakCharacters') }}`
- `"Keep practicing — weak characters..."` → `{{ $t('progress.weakCharactersTip') }}`

- [ ] **Step 19: Update `src/components/progress/AccuracyChart.vue`**

Replace:
- `"ACCURACY BY SCRIPT"` → `{{ $t('progress.accuracyByScript') }}`
- `'No data yet'` (in the conditional expression) → add `const { t } = useI18n()` and use `bar.acc !== null ? bar.acc + '%' : t('progress.noData')`

- [ ] **Step 20: Update `src/components/layout/AppBottomNav.vue`**

Replace the `links` array to use `labelKey` and use `$t(link.labelKey)` in the template:

```js
const links = [
  { name: 'home',             to: '/',                icon: '🏠', labelKey: 'nav.home'           },
  { name: 'quiz-select',      to: '/quiz',            icon: '🎯', labelKey: 'nav.quiz'           },
  { name: 'flashcards',       to: '/flashcards',      icon: '🃏', labelKey: 'nav.cards'          },
  { name: 'vocabulary',       to: '/vocabulary',      icon: '🎮', labelKey: 'nav.words'          },
  { name: 'kanji-dictionary', to: '/kanji-dictionary',icon: '📖', labelKey: 'nav.kanji'          },
  { name: 'progress',         to: '/progress',        icon: '📊', labelKey: 'nav.progress'       },
]
```

In template: `{{ $t(link.labelKey) }}` instead of `{{ link.label }}`

- [ ] **Step 21: Update `src/components/layout/ThemeToggle.vue`**

Read the file. Replace `'Dark Mode'` / `'Light Mode'` strings with `$t('theme.dark')` / `$t('theme.light')`. Add `useI18n` import and setup.

- [ ] **Step 22: Run build, confirm no errors**

```bash
npm run build
```

Expected: build succeeds. Fix any `$t()` calls that reference missing keys.

- [ ] **Step 23: Commit**

```bash
git add src/views/ src/components/
git commit -m "feat: update all components to use vue-i18n $t() translations"
```

---

## Task 3: useLocaleData composable + wire into data-consuming components

**Files:**
- Create: `src/i18n/translations/vocab-n5-pt-BR.json` (stub)
- Create: `src/i18n/translations/vocab-n4-pt-BR.json` (stub)
- Create: `src/i18n/translations/kanji-pt-BR.json` (stub)
- Create: `src/composables/useLocaleData.js`
- Modify: `src/components/vocabulary/VocabQuestionCard.vue`
- Modify: `src/views/VocabularySessionView.vue`
- Modify: `src/views/KanjiDictionaryView.vue`
- Modify: `src/views/FlashcardsSessionView.vue`

- [ ] **Step 1: Create stub translation files**

`src/i18n/translations/vocab-n5-pt-BR.json`:
```json
{}
```

`src/i18n/translations/vocab-n4-pt-BR.json`:
```json
{}
```

`src/i18n/translations/kanji-pt-BR.json`:
```json
{}
```

These are intentional stubs — pt-BR mode will fall back to English until Tasks 4-6 fill them in.

- [ ] **Step 2: Create `src/composables/useLocaleData.js`**

```js
import { useI18n } from 'vue-i18n'
import vocabN5PT from '@/i18n/translations/vocab-n5-pt-BR.json'
import vocabN4PT from '@/i18n/translations/vocab-n4-pt-BR.json'
import kanjiPT   from '@/i18n/translations/kanji-pt-BR.json'

export function useLocaleData() {
  const { locale } = useI18n()

  function getVocabMeaning(item) {
    if (locale.value !== 'pt-BR') return item.meaning
    const key = `${item.expression}::${item.reading}`
    return vocabN5PT[key] ?? vocabN4PT[key] ?? item.meaning
  }

  function getKanjiMeanings(item) {
    if (locale.value !== 'pt-BR') return item.meaning
    return kanjiPT[item.kanji]?.meaning ?? item.meaning
  }

  function getFirstMeaning(item, type) {
    if (type === 'kanji') {
      const m = getKanjiMeanings(item)
      return Array.isArray(m) ? m[0] : m
    }
    return getVocabMeaning(item)
  }

  function getMeaning(item, type) {
    return type === 'kanji' ? getKanjiMeanings(item) : getVocabMeaning(item)
  }

  function getExampleMeaning(example, kanjiChar) {
    if (locale.value !== 'pt-BR') return example.meaning
    const entry = kanjiPT[kanjiChar]
    if (!entry?.examples) return example.meaning
    const ptEx = entry.examples.find(e => e.word === example.word)
    return ptEx?.meaning ?? example.meaning
  }

  return { getMeaning, getFirstMeaning, getExampleMeaning }
}
```

- [ ] **Step 3: Update `src/components/vocabulary/VocabQuestionCard.vue`**

Replace the entire file with (adds useLocaleData to display localized meaning in meaning→word direction):

```vue
<template>
  <div class="text-center py-8 min-h-[140px] flex flex-col items-center justify-center">

    <!-- Kanji, word→meaning: show kanji + readings -->
    <template v-if="type === 'kanji' && direction === 'word-meaning'">
      <div class="text-7xl font-bold mb-3" style="color: var(--color-text);">{{ item.kanji }}</div>
      <div class="text-sm" style="color: var(--color-text-muted);">
        <span v-if="item.onyomi.length">音: {{ item.onyomi.join('・') }}</span>
        <span v-if="item.onyomi.length && item.kunyomi.length"> · </span>
        <span v-if="item.kunyomi.length">訓: {{ item.kunyomi.join('・') }}</span>
      </div>
    </template>

    <!-- Vocab, word→meaning: show expression + reading -->
    <template v-else-if="type === 'vocab' && direction === 'word-meaning'">
      <div class="text-5xl font-bold mb-2" style="color: var(--color-text);">{{ item.expression }}</div>
      <div class="text-xl" style="color: var(--color-text-muted);">{{ item.reading }}</div>
    </template>

    <!-- Both types, meaning→word: show localized meaning -->
    <template v-else>
      <div class="text-2xl font-semibold px-4 leading-snug" style="color: var(--color-text);">
        {{ localizedMeaning }}
      </div>
      <div class="text-xs mt-2" style="color: var(--color-text-muted);">{{ $t('vocabQuiz.whatIsInJapanese') }}</div>
    </template>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLocaleData } from '@/composables/useLocaleData'

const props = defineProps({
  item:      { type: Object,  required: true },
  type:      { type: String,  required: true },
  direction: { type: String,  required: true },
})

const { getFirstMeaning } = useLocaleData()

const localizedMeaning = computed(() => getFirstMeaning(props.item, props.type))
</script>
```

- [ ] **Step 4: Update `src/views/VocabularySessionView.vue` — wire useLocaleData**

Read the file. Add at the top of `<script setup>`:

```js
import { useLocaleData } from '@/composables/useLocaleData'
const { getFirstMeaning, getExampleMeaning } = useLocaleData()
```

Find `generateOptions(item, pool)`. Replace every reference to `item.meaning[0]` and `d.meaning[0]` (for kanji) or `item.meaning` and `d.meaning` (for vocab) with `getFirstMeaning(item, type)` and `getFirstMeaning(d, type)`:

```js
function generateOptions(item, pool) {
  const correctAnswer = getFirstMeaning(item, type)
  const usedTexts = new Set([correctAnswer])
  const shuffled = fisherYates([...pool].filter(d => d !== item))
  const options = [{ text: correctAnswer, isCorrect: true }]

  for (const d of shuffled) {
    if (options.length >= numOptions) break
    const text = getFirstMeaning(d, type)
    if (!usedTexts.has(text)) {
      usedTexts.add(text)
      options.push({ text, isCorrect: false })
    }
  }

  return fisherYates(options)
}
```

(Adapt to match the exact variable names in the actual file — read it first.)

Find wherever `currentQ.item.examples` is passed to `VocabTipPanel`. Add a computed that localizes example meanings:

```js
const localizedExamples = computed(() => {
  if (!currentQ.value?.item?.examples) return []
  if (locale.value !== 'pt-BR') return currentQ.value.item.examples
  return currentQ.value.item.examples.map(ex => ({
    ...ex,
    meaning: getExampleMeaning(ex, currentQ.value.item.kanji)
  }))
})
```

Add `const { locale } = useI18n()` (and import `useI18n`) if not already present.

Pass `localizedExamples` to `<VocabTipPanel :examples="localizedExamples" .../>` instead of `currentQ.item.examples`.

- [ ] **Step 5: Update `src/views/KanjiDictionaryView.vue` — wire useLocaleData**

Read the file. Add:

```js
import { computed } from 'vue'
import { useLocaleData } from '@/composables/useLocaleData'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const { getMeaning, getExampleMeaning } = useLocaleData()

const localizedSelectedKanji = computed(() => {
  if (!selectedKanji.value || locale.value !== 'pt-BR') return selectedKanji.value
  const meaning = getMeaning(selectedKanji.value, 'kanji')
  const examples = selectedKanji.value.examples?.map(ex => ({
    ...ex,
    meaning: getExampleMeaning(ex, selectedKanji.value.kanji)
  }))
  return { ...selectedKanji.value, meaning, examples }
})
```

In template, pass `localizedSelectedKanji` to `<KanjiDetailModal :kanji="localizedSelectedKanji" .../>` instead of `selectedKanji`.

- [ ] **Step 6: Update `src/views/FlashcardsSessionView.vue` — wire useLocaleData for card backs**

Read the file. Add at top of `<script setup>`:

```js
import { useLocaleData } from '@/composables/useLocaleData'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const { getMeaning } = useLocaleData()

const localizedCurrentCard = computed(() => {
  if (!currentCard.value || locale.value !== 'pt-BR') return currentCard.value
  const meaning = getMeaning(currentCard.value, deckType)
  return { ...currentCard.value, meaning }
})
```

In template, pass `localizedCurrentCard` to `<FlashCard :card="localizedCurrentCard" .../>` instead of `currentCard`.

- [ ] **Step 7: Run build, confirm no errors**

```bash
npm run build
```

Expected: build succeeds. The app works in English; pt-BR mode shows English meanings as fallback (stubs are empty).

- [ ] **Step 8: Commit**

```bash
git add src/composables/ src/i18n/translations/ src/components/vocabulary/VocabQuestionCard.vue src/views/VocabularySessionView.vue src/views/KanjiDictionaryView.vue src/views/FlashcardsSessionView.vue
git commit -m "feat: add useLocaleData composable and wire localized meanings into quiz/dictionary/flashcards"
```

---

## Task 4: Translate N5 vocabulary (511 entries)

**Files:**
- Write: `src/i18n/translations/vocab-n5-pt-BR.json`

- [ ] **Step 1: Read source data**

Read `src/data/n5_vocabulary.js`. Each entry has shape:
```js
{ expression: '今', reading: 'いま', meaning: 'now', category: 'time' }
```

- [ ] **Step 2: Generate all 511 Portuguese translations**

Create `src/i18n/translations/vocab-n5-pt-BR.json` with ALL entries translated. Key = `expression::reading`, value = Portuguese meaning string.

Format:
```json
{
  "今::いま": "agora",
  "学生::がくせい": "estudante",
  "食べる::たべる": "comer",
  "飲む::のむ": "beber",
  "行く::いく": "ir",
  "来る::くる": "vir",
  "見る::みる": "ver",
  "聞く::きく": "ouvir; perguntar",
  "話す::はなす": "falar",
  "読む::よむ": "ler",
  "書く::かく": "escrever",
  "買う::かう": "comprar",
  "売る::うる": "vender",
  "起きる::おきる": "acordar; levantar",
  "寝る::ねる": "dormir; deitar",
  "日本語::にほんご": "japonês (idioma)",
  "先生::せんせい": "professor",
  "学校::がっこう": "escola",
  "大学::だいがく": "universidade",
  "友達::ともだち": "amigo"
}
```

**Translate ALL 511 entries from `src/data/n5_vocabulary.js`.** Read the file completely, then produce the full JSON object with every entry translated to natural Brazilian Portuguese. For compound meanings (e.g. "to go; to come"), separate with "; ". Keep translations concise (1-4 words typically).

- [ ] **Step 3: Verify entry count**

Run a quick Node snippet to confirm:
```bash
node -e "const d = require('./src/i18n/translations/vocab-n5-pt-BR.json'); console.log('entries:', Object.keys(d).length)"
```

Expected output: `entries: 511`

- [ ] **Step 4: Commit**

```bash
git add src/i18n/translations/vocab-n5-pt-BR.json
git commit -m "feat: add N5 vocabulary Portuguese translations (511 entries)"
```

---

## Task 5: Translate N4 vocabulary (666 entries)

**Files:**
- Write: `src/i18n/translations/vocab-n4-pt-BR.json`

- [ ] **Step 1: Read source data**

Read `src/data/n4_vocabulary.js`. Same shape as N5: `{ expression, reading, meaning, category }`.

- [ ] **Step 2: Generate all 666 Portuguese translations**

Create `src/i18n/translations/vocab-n4-pt-BR.json` with ALL N4 entries translated. Same format as N5:

```json
{
  "expression::reading": "significado em português"
}
```

Translate ALL 666 entries from `src/data/n4_vocabulary.js`. Natural Brazilian Portuguese, concise.

- [ ] **Step 3: Verify entry count**

```bash
node -e "const d = require('./src/i18n/translations/vocab-n4-pt-BR.json'); console.log('entries:', Object.keys(d).length)"
```

Expected: `entries: 666`

- [ ] **Step 4: Commit**

```bash
git add src/i18n/translations/vocab-n4-pt-BR.json
git commit -m "feat: add N4 vocabulary Portuguese translations (666 entries)"
```

---

## Task 6: Translate kanji (all entries from kanji.js + n5_kanji.js + n4_kanji.js)

**Files:**
- Write: `src/i18n/translations/kanji-pt-BR.json`

- [ ] **Step 1: Read source data**

Read `src/data/kanji.js`, `src/data/n5_kanji.js`, `src/data/n4_kanji.js`.

Each kanji entry shape:
```js
{
  kanji: '一',
  meaning: ['one'],
  onyomi: ['イチ', 'イツ'],
  kunyomi: ['ひと-', 'ひと.つ'],
  jlpt: 'N5',
  strokeCount: 1,
  examples: [
    { word: '一つ', reading: 'ひとつ', meaning: 'one thing; one item' },
    { word: '一人', reading: 'ひとり', meaning: 'one person; alone' }
  ]
}
```

- [ ] **Step 2: Generate all kanji translations**

Create `src/i18n/translations/kanji-pt-BR.json`. Key = kanji character. Value = `{ meaning: string[], examples: [{ word: string, meaning: string }] }`.

Deduplicate by kanji character (some kanji may appear in multiple source files — use each kanji only once). Translate ALL kanji that appear across all three source files.

Format:
```json
{
  "一": {
    "meaning": ["um", "uma"],
    "examples": [
      { "word": "一つ", "meaning": "uma coisa; um item" },
      { "word": "一人", "meaning": "uma pessoa; sozinho" }
    ]
  },
  "日": {
    "meaning": ["dia", "sol", "Japão"],
    "examples": [
      { "word": "日曜日", "meaning": "domingo" },
      { "word": "今日", "meaning": "hoje" }
    ]
  },
  "本": {
    "meaning": ["livro", "origem", "principal"],
    "examples": [
      { "word": "日本", "meaning": "Japão" },
      { "word": "本屋", "meaning": "livraria" }
    ]
  }
}
```

Translate ALL kanji from all three source files. Include only `word` and `meaning` in each example object (not `reading` — that stays as-is from the source).

- [ ] **Step 3: Verify entry count**

```bash
node -e "const d = require('./src/i18n/translations/kanji-pt-BR.json'); console.log('entries:', Object.keys(d).length)"
```

Expected: at least 80 entries (likely 200+ covering all unique kanji across the three files).

- [ ] **Step 4: Commit**

```bash
git add src/i18n/translations/kanji-pt-BR.json
git commit -m "feat: add kanji Portuguese translations"
```

---

## Task 7: Final integration, CLAUDE.md update, merge to main

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Run full build and verify**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 2: Verify app functionality**

Start dev server and manually verify:

```bash
npm run dev
```

Check:
1. Toggle language button appears in sidebar (desktop) and mobile area
2. Switching to Português: all nav labels, headings, buttons change to pt-BR
3. Switching back to English: reverts correctly
4. Vocabulary quiz in pt-BR: answer options show Portuguese meanings
5. Kanji dictionary modal: shows Portuguese meanings when in pt-BR
6. Flashcard backs: show Portuguese meanings when in pt-BR
7. Language preference persists on page reload (localStorage)
8. All existing features (quiz, flashcards, progress) work normally

- [ ] **Step 3: Push branch**

```bash
git push origin feat/pt-br
```

- [ ] **Step 4: Merge to main**

```bash
git checkout main
git merge --no-ff feat/pt-br -m "feat: add Portuguese (pt-BR) language support with toggle"
git push origin main
git branch -d feat/pt-br
git push origin --delete feat/pt-br
```

- [ ] **Step 5: Update CLAUDE.md**

Add to the Completed Phases table:
```
| `feat/pt-br` | ✅ merged to main | Portuguese (pt-BR) language toggle; vue-i18n v9; all UI strings + vocabulary/kanji meanings translated |
```

Add to the Changelog:
```
### 2026-05-16 — feat/pt-br
- `vue-i18n@9` installed (Composition API, `legacy: false`)
- `src/i18n/index.js` + `src/i18n/en.json` + `src/i18n/pt-BR.json`: all UI strings in both languages
- `src/components/layout/LanguageToggle.vue`: globe icon button, shown in sidebar footer + mobile; toggles locale and persists to settings store
- `src/stores/settings.js`: added `language` ref (default `'en'`) + `setLanguage()` action + persisted to localStorage
- `src/main.js`: applies stored language to i18n on startup
- All 22 views and components updated to use `$t()` / `t()` for UI strings
- `src/composables/useLocaleData.js`: provides `getMeaning`, `getFirstMeaning`, `getExampleMeaning` — overlays PT-BR meanings from JSON files without touching source data
- `src/i18n/translations/vocab-n5-pt-BR.json` (511 entries), `vocab-n4-pt-BR.json` (666 entries), `kanji-pt-BR.json` (all kanji): Portuguese meaning overlays
- VocabQuestionCard, VocabularySessionView (generateOptions + tips), KanjiDictionaryView (modal), FlashcardsSessionView (card backs) wired to useLocaleData
```

Also update the Router section in Key Architecture Notes to include the note that vue-i18n is now a dependency.

- [ ] **Step 6: Commit CLAUDE.md**

```bash
git add CLAUDE.md
git commit -m "chore: update CLAUDE.md for feat/pt-br merge"
git push origin main
```

---

## Self-Review

**Spec coverage:**
- ✅ Portuguese language toggle button — LanguageToggle component in sidebar + mobile
- ✅ Persisted language preference — settings store + localStorage
- ✅ All UI strings translated — en.json + pt-BR.json, all 22 components
- ✅ Vocabulary meanings in pt-BR — useLocaleData + vocab-n5/n4-pt-BR.json
- ✅ Kanji meanings in pt-BR — kanji-pt-BR.json
- ✅ Source data files untouched — overlay approach
- ✅ Auto-advance and quiz logic unaffected — only display strings change
- ✅ English fallback — empty stubs fall back gracefully

**Type consistency:**
- `getFirstMeaning(item, type)` → returns `string` — used in generateOptions (correct answer text) and VocabQuestionCard (meaning→word prompt)
- `getMeaning(item, type)` → returns `string | string[]` — used for KanjiDetailModal (meaning array) and FlashCard (meaning field)
- `getExampleMeaning(example, kanjiChar)` → returns `string` — used for tip panel and modal examples
- Translation JSON keys: vocab uses `expression::reading` composite key; kanji uses character as key

**Placeholder scan:** No TBD or incomplete steps. All steps include exact code or clear read-first instructions.
