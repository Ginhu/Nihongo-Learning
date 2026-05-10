# Phase 6 — Dark Mode Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dark/light mode toggle button — in the sidebar footer (desktop, alongside RomajiToggle) and as a small fixed button in the top-right corner (mobile only).

**Architecture:** Everything is already wired: `useSettingsStore` has `theme` ('dark'|'light'), `toggleTheme()` switches the theme and calls `applyTheme()` which toggles `.dark` on `<html>`, and CSS vars under `.dark {}` are already defined in `main.css`. This phase only adds UI. A new `ThemeToggle.vue` component is used in the sidebar footer. `App.vue` gets a mobile floating button inline (no separate component needed for a one-line button).

**Already complete — no changes needed:**
- `src/stores/settings.js` — `toggleTheme()` and `applyTheme()` fully implemented
- `src/assets/main.css` — `.dark` CSS vars already defined
- `src/App.vue` — `applyTheme()` called on mount

**Tech Stack:** Vue 3, Pinia (`useSettingsStore`), Tailwind CSS

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/components/layout/ThemeToggle.vue` | Create | Sun/moon toggle button, sidebar-style (icon + label) |
| `src/components/layout/AppSidebar.vue` | Modify | Add `<ThemeToggle />` to footer, below `<RomajiToggle />` |
| `src/App.vue` | Modify | Add mobile floating button (top-right, `md:hidden`) |

---

## Task 1: Create feat/dark-mode branch

- [ ] **Create and switch to feat/dark-mode branch**

```bash
git checkout main && git checkout -b feat/dark-mode
```

Expected: `Switched to a new branch 'feat/dark-mode'`

---

## Task 2: Create ThemeToggle.vue

**Files:**
- Create: `src/components/layout/ThemeToggle.vue`

- [ ] **Write ThemeToggle.vue**

```vue
<template>
  <button
    class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-primary/10"
    :aria-label="settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="settings.toggleTheme()"
  >
    <span class="text-lg">{{ settings.theme === 'dark' ? '☀️' : '🌙' }}</span>
    <span>{{ settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}</span>
  </button>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settings'
const settings = useSettingsStore()
</script>
```

---

## Task 3: Add ThemeToggle to AppSidebar.vue

**Files:**
- Modify: `src/components/layout/AppSidebar.vue`

The sidebar footer currently looks like:
```html
    <div class="p-3 border-t" style="border-color: var(--color-border);">
      <RomajiToggle />
    </div>
```

- [ ] **Add ThemeToggle import and usage to AppSidebar.vue**

Replace the footer section:
```html
    <div class="p-3 border-t" style="border-color: var(--color-border);">
      <RomajiToggle />
    </div>
```
With:
```html
    <div class="p-3 border-t space-y-1" style="border-color: var(--color-border);">
      <RomajiToggle />
      <ThemeToggle />
    </div>
```

And add the import in `<script setup>`:
```js
import RomajiToggle from './RomajiToggle.vue'
import ThemeToggle from './ThemeToggle.vue'
```

---

## Task 4: Add mobile floating toggle to App.vue

**Files:**
- Modify: `src/App.vue`

The current App.vue template:
```html
<template>
  <div class="min-h-screen" style="background: var(--color-bg); color: var(--color-text);">
    <AppSidebar />

    <main class="md:ml-56 pb-16 md:pb-0 min-h-screen">
      <RouterView />
    </main>

    <AppBottomNav />
  </div>
</template>
```

- [ ] **Add mobile theme toggle button to App.vue**

Replace the template with:
```html
<template>
  <div class="min-h-screen" style="background: var(--color-bg); color: var(--color-text);">
    <AppSidebar />

    <!-- Mobile theme toggle (fixed top-right, hidden on desktop where sidebar handles it) -->
    <button
      class="md:hidden fixed top-3 right-3 z-30 p-2 rounded-lg border text-lg transition-colors hover:bg-primary/10"
      style="background: var(--color-surface); border-color: var(--color-border);"
      :aria-label="settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="settings.toggleTheme()"
    >{{ settings.theme === 'dark' ? '☀️' : '🌙' }}</button>

    <main class="md:ml-56 pb-16 md:pb-0 min-h-screen">
      <RouterView />
    </main>

    <AppBottomNav />
  </div>
</template>
```

And add `settings` to the script (it's already imported — just expose it to the template):

The existing script:
```js
const settings = useSettingsStore()
const progress = useProgressStore()

onMounted(() => {
  settings.applyTheme()
  progress.checkStreak()
})
```

No change needed — `settings` is already declared and accessible in the template.

---

## Task 5: Build verification

- [ ] **Run production build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Smoke test in dev server**

```bash
npm run dev
```

Verify:
1. Desktop (≥768px): sidebar footer shows both RomajiToggle and ThemeToggle. Click ThemeToggle → page switches between dark/light. Refresh → theme persists.
2. Mobile (<768px): small ☀️/🌙 button appears in the top-right corner. Tap it → theme switches. Bottom nav unchanged.
3. Dark mode: backgrounds are dark (`#0f0f0f` / `#1a1a1a`), text is light
4. Light mode: backgrounds are light (`#ffffff` / `#f3f4f6`), text is dark
5. All pages (quiz, flashcards, vocabulary, progress) respond correctly to both themes

---

## Task 6: Commit, push, merge to main

- [ ] **Stage and commit**

```bash
git add src/components/layout/ThemeToggle.vue src/components/layout/AppSidebar.vue src/App.vue
git commit -m "$(cat <<'EOF'
feat: add dark/light mode toggle

Theme toggle button in sidebar footer (desktop) and fixed top-right
corner (mobile). Uses existing settingsStore.toggleTheme() which
persists the choice to localStorage and toggles the .dark class on
<html>. CSS vars for both modes were already defined.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Push and merge**

```bash
git push -u origin feat/dark-mode
git checkout main
git merge feat/dark-mode --no-ff -m "merge: feat/dark-mode → main"
git push origin main
```
