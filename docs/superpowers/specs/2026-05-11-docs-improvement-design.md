# Docs Improvement — Design Spec

**Date:** 2026-05-11  
**Scope:** CLAUDE.md workflow rules + README.md

---

## 1. CLAUDE.md Changes

### 1a. Branch Lifecycle Rule (addition to Workflow Rules)

Replace the existing one-liner about branches with a full lifecycle rule:

> **Branch lifecycle:** create `feat/<name>` → implement → test locally → push branch to remote → merge to `main` with `--no-ff` → delete local branch (`git branch -d feat/<name>`) → delete remote branch (`git push origin --delete feat/<name>`)

### 1b. Post-merge Update Rule (addition to Workflow Rules)

> **After every merge to `main`:** update the Completed Phases table with what shipped + append a dated entry to the Changelog section at the bottom of this file

### 1c. New Changelog Section

Add a `## Changelog` section at the bottom of CLAUDE.md (above SSH Key). Each entry format:

```
### YYYY-MM-DD — <branch-name>
- What shipped (bullet list)
```

First entry: `2026-05-09 — feat/dark-mode` (last merged feature).

---

## 2. README.md Structure (Approach B — Feature-forward)

### Section order

1. **Header**
   - Title: `日本語マスター · Nihongo Master`
   - Tagline: one sentence pitch
   - Two badges: `[Live on Vercel]` (https://nihongo-learning.vercel.app/#/) + `[GitHub Pages]` (https://ginhu.github.io/Nihongo-Learning/)
   - Tech badge row: Vue 3 · Vite · Pinia · Tailwind CSS

2. **Features** — 5 concise blocks
   - Quiz — hiragana/katakana/kanji, multiple directions, XP tracking
   - Flashcards — 3D flip, 5 decks incl. Favorites, swipe gestures
   - Vocabulary — kanji grid, JLPT filter, search, detail modal
   - Progress & Gamification — XP bar, streak, accuracy charts, level-up overlay
   - Dark Mode — persistent theme toggle, full CSS-variable theming

3. **Tech Stack** — two-column table (Tool | Role)

4. **Getting Started** — 4 commands: clone, install, dev, build

5. **Project Structure** — compact `src/` tree with one-liners per folder

---

## Decisions

- No contributing guide — personal/portfolio project
- No screenshots — text-only for now
- Vercel is primary live link; GitHub Pages listed as secondary
- README committed to git; CLAUDE.md stays in .gitignore (local only)
