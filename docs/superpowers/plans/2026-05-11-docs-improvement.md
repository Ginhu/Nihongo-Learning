# Docs Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update CLAUDE.md with full branch lifecycle + changelog rules, and write a feature-forward README.md for the portfolio.

**Architecture:** Two independent file edits — CLAUDE.md gets new workflow rules and a Changelog section; README.md is written from scratch. No code changes, no tests needed.

**Tech Stack:** Markdown, Git

---

### Task 1: Update CLAUDE.md Workflow Rules

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Replace the existing branch rule with the full lifecycle rule**

Find and replace this line in the Workflow Rules section:
```
- One branch per feature: `feat/<name>` → merge to `main` via `--no-ff` → auto-deploys to GitHub Pages
```
With:
```
- **Branch lifecycle:** create `feat/<name>` → implement → test locally → push branch (`git push origin feat/<name>`) → merge to `main` with `--no-ff` → delete local branch (`git branch -d feat/<name>`) → delete remote branch (`git push origin --delete feat/<name>`) → auto-deploys to GitHub Pages
```

- [ ] **Step 2: Add the post-merge update rule**

After the line `- Never commit directly to main — always branch → implement → review → merge`, add:
```
- **After every merge to `main`:** update the Completed Phases table with what shipped and append a dated entry to the Changelog section at the bottom of this file
```

- [ ] **Step 3: Add Changelog section above the SSH Key section**

Insert this block between `## GitHub Actions Deploy` and `## SSH Key`:
```markdown
---

## Changelog

### 2026-05-09 — feat/dark-mode
- `ThemeToggle.vue` added to sidebar footer
- Mobile floating theme button (`md:hidden`) added to `App.vue` top-right
- Uses `toggleTheme()` + CSS variables already in place from design system

### 2026-05-09 — feat/gamification
- Level-up overlay (2s `Teleport`, `.anim-levelup` CSS keyframe)
- `playLevelUp()` wired to `recordQuizResult()` in progress store
- End screen gated behind overlay completion

### 2026-05-09 — feat/progress
- XP bar + streak badge in sidebar and home
- Accuracy charts (hiragana / katakana / kanji) using native SVG
- Weak characters grid (5 lowest-accuracy chars with ≥3 attempts)
- Quiz history list

### 2026-05-09 — feat/vocabulary
- Kanji grid with JLPT N5/N4 filter chips
- Search by kanji character or meaning
- Detail modal with readings, stroke count, example sentences
- Favorites toggle wired to progress store

### 2026-05-09 — feat/flashcards
- 3D flip cards with CSS perspective transform
- 5 decks: Hiragana, Katakana, Kanji, Weak Characters, Favorites
- Swipe left/right gesture support
- Fisher-Yates shuffle on index array
- Known/practice tracking persisted in progress store

### 2026-05-09 — feat/quiz
- Full quiz engine: hiragana / katakana / kanji modes
- Multiple directions: kana→romaji, romaji→kana, kanji→meaning, meaning→kanji
- XP tracking: +10 per correct, +50 perfect session bonus
- End screen with score, XP gained, accuracy breakdown

### 2026-05-09 — feat/scaffold
- Vite 6 + Vue 3 + Tailwind CSS v3 project scaffold
- Vue Router (hash mode) with all route shells
- Pinia stores: settings, progress, quiz
- GitHub Actions deploy to GitHub Pages
```

- [ ] **Step 4: Verify the file looks correct**

Open `CLAUDE.md` and confirm:
- Workflow Rules has 3 bullet points about branching/lifecycle
- Post-merge update rule is present
- Changelog section appears between GitHub Actions and SSH Key sections

---

### Task 2: Write README.md

**Files:**
- Modify: `README.md` (currently empty — full rewrite)

- [ ] **Step 1: Write the complete README.md**

Replace the entire file with:

```markdown
# 日本語マスター · Nihongo Master

> An interactive Japanese learning app covering hiragana, katakana, and kanji — built as a portfolio project.

[![Live on Vercel](https://img.shields.io/badge/Live%20on-Vercel-black?logo=vercel)](https://nihongo-learning.vercel.app/#/)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?logo=github)](https://ginhu.github.io/Nihongo-Learning/)
![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-38bdf8?logo=tailwind-css)

---

## Features

### Quiz
Practice hiragana, katakana, and kanji through multiple directions — kana-to-romaji, romaji-to-kana, kanji-to-meaning, and meaning-to-kanji. Each session earns XP (+10 per correct answer, +50 bonus for a perfect run) and tracks per-character accuracy for later review.

### Flashcards
Study with 3D flip cards across five decks: Hiragana, Katakana, Kanji, Weak Characters (auto-populated from your lowest-accuracy chars), and Favorites. Cards are shuffled with Fisher-Yates and support swipe gestures. Progress is saved locally.

### Vocabulary
Browse the full N5/N4 kanji set in a filterable grid. Filter by JLPT level, search by character or meaning, and tap any card to open a detail modal with on-yomi, kun-yomi, stroke count, and example sentences. Favorite kanji sync across the app.

### Progress & Gamification
Track XP, level (1–10), and daily streak from the Progress view. Accuracy charts break down performance by script type, and a Weak Characters grid surfaces the five characters that need the most work. Completing a level triggers a level-up overlay animation.

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
├── components/    # Shared UI components (modals, cards, overlays)
├── data/          # Static data: hiragana.js, katakana.js, kanji.js
├── router/        # Vue Router config
├── stores/        # Pinia stores: settings, progress, quiz
└── views/         # One file per route (Home, Quiz, Flashcards, Vocabulary, Progress)
```
```

- [ ] **Step 2: Verify the file renders correctly**

Check that:
- Badges display on the first pass (no broken image links)
- Feature blocks read clearly with consistent formatting
- Tech stack table has correct alignment
- Code blocks use the right language tags

- [ ] **Step 3: Commit both files**

```bash
git add README.md CLAUDE.md
git commit -m "docs: update CLAUDE.md workflow rules and write README"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All spec sections covered — branch lifecycle rule, post-merge rule, changelog section, README header with both deploy links, features (5 blocks), tech stack table, getting started commands, project structure tree
- [x] **Placeholder scan:** No TBDs, no TODOs, no "similar to above" references
- [x] **Type consistency:** N/A — no code types involved
