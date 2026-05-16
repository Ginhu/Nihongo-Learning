# 日本語マスター · Nihongo Master

> An interactive Japanese learning app covering hiragana, katakana, kanji, and vocabulary — built as a portfolio project.

[![Live on Vercel](https://img.shields.io/badge/Live%20on-Vercel-black?logo=vercel)](https://nihongo-learning.vercel.app/#/)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?logo=github)](https://ginhu.github.io/Nihongo-Learning/)
![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-38bdf8?logo=tailwind-css)

---

## Features

### Quiz
Practice hiragana, katakana, and kanji through multiple directions — kana-to-romaji, romaji-to-kana, kanji-to-meaning, and meaning-to-kanji. Each session earns XP (+10 per correct answer, +50 bonus for a perfect run) and tracks per-character accuracy for later review.

### Vocabulary Quiz
Guess the meaning of N5/N4 vocabulary words and kanji in an active multiple-choice game. Choose your type (Vocabulary or Kanji), level, direction (Word → Meaning or Meaning → Word), and difficulty (Easy: 2 options / Normal: 4 / Hard: 6). Sessions award XP with a tiered system — using tips reduces your reward. Correct answers auto-advance after 1 second; wrong answers reveal the correct option and advance after 1.5 seconds.

**Kanji tips:** Up to three sequential hints reveal example sentences for the current kanji. Each tip reduces XP earned: no tips = +10, one tip = +8, two = +4, three = +1. A perfect session (all correct) adds a +50 XP bonus.

### Flashcards
Study with 3D flip cards across vocabulary and kanji decks. Choose from JLPT N5 or N4 vocabulary (511 and 666 words), kanji N5/N4, or your personal Favorites deck. Cards are filtered by category, shuffled with Fisher-Yates, and delivered in configurable batch sizes. Swipe gestures and Known/Needs Practice tracking are supported. Results modal shows known vs. practice counts after each batch.

### Kanji Dictionary
Browse the full N5/N4 kanji set in a filterable grid. Filter by JLPT level, search by character or meaning, and tap any card to open a detail modal with on-yomi, kun-yomi, stroke count, and example sentences. Favorite kanji sync across the app.

### Progress & Gamification
Track XP, level (1–10), and daily streak from the Progress view. Accuracy charts break down performance by script type, and a Weak Characters grid surfaces the five characters that need the most work. Completing a level triggers a full-screen level-up overlay animation.

### Dark Mode
Full dark/light theme toggle with persistent preference. All colors are driven by CSS variables so every view — including modals and overlays — switches cleanly.

---

## Tech Stack

| Tool | Role |
|------|------|
| Vue 3 (Composition API) | UI framework |
| Vite 6 | Build tool & dev server |
| Pinia | State management + localStorage persistence |
| Vue Router (hash mode) | Client-side routing (GitHub Pages compatible) |
| Tailwind CSS v3 | Utility-first styling |
| GitHub Actions | CI/CD → auto-deploy to GitHub Pages |

---

## Getting Started

```bash
git clone git@github.com:Ginhu/Nihongo-Learning.git
cd Nihongo-Learning
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build → dist/
```

---

## Project Structure

```
src/
├── assets/        # Global CSS (CSS variables, keyframes)
├── components/    # Shared UI components (quiz, flashcards, vocabulary, layout)
├── data/          # Static data: hiragana, katakana, n5/n4 vocabulary, n5/n4 kanji
├── router/        # Vue Router config
├── stores/        # Pinia stores: settings, progress, quiz
└── views/         # One file per route
                   #   Home, QuizSelect, QuizSession,
                   #   FlashcardSelect, FlashcardsSession,
                   #   VocabularySelect, VocabularySession,
                   #   KanjiDictionary, Progress
```
