<template>
  <div class="px-4 py-6">

    <!-- Filters row -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <!-- Search -->
      <input
        v-model="search"
        type="text"
        :placeholder="$t('kanjiDict.searchPlaceholder')"
        aria-label="Search kanji"
        class="flex-1 px-4 py-2 rounded-xl border text-sm outline-none focus:border-primary transition-colors"
        style="background: var(--color-surface); border-color: var(--color-border); color: var(--color-text);"
      />

      <!-- JLPT filter chips -->
      <div class="flex gap-2 flex-shrink-0">
        <button
          v-for="lvl in ['all', 'N5', 'N4']"
          :key="lvl"
          class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
          :class="jlptFilter === lvl ? 'bg-primary text-white border-primary' : 'hover:bg-primary/10'"
          style="border-color: var(--color-border);"
          :aria-pressed="jlptFilter === lvl"
          @click="jlptFilter = lvl"
        >{{ lvl === 'all' ? 'All' : lvl }}</button>
      </div>
    </div>

    <!-- Result count -->
    <div class="text-sm mb-4" style="color: var(--color-text-muted);">
      {{ filteredKanji.length }} kanji
    </div>

    <!-- Kanji grid -->
    <div v-if="filteredKanji.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <KanjiCard
        v-for="k in filteredKanji"
        :key="k.kanji"
        :kanji="k"
        @select="selectedKanji = k"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-16" style="color: var(--color-text-muted);">
      <div class="text-4xl mb-3">🔍</div>
      <p>{{ search ? $t('kanjiDict.noKanjiFoundFor', { search }) : $t('kanjiDict.noKanjiFound') }}</p>
    </div>

    <!-- Detail modal -->
    <KanjiDetailModal
      :kanji="localizedSelectedKanji"
      :is-favorited="selectedKanji ? progress.favoritedKanji.includes(selectedKanji.kanji) : false"
      @close="selectedKanji = null"
      @toggle-favorite="onToggleFavorite"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProgressStore } from '@/stores/progress'
import { useLocaleData } from '@/composables/useLocaleData'
import kanjiData from '@/data/kanji.js'
import KanjiCard from '@/components/vocabulary/KanjiCard.vue'
import KanjiDetailModal from '@/components/vocabulary/KanjiDetailModal.vue'

const progress = useProgressStore()
const { locale } = useI18n()
const { getMeaning, getExampleMeaning } = useLocaleData()

const search = ref('')
const jlptFilter = ref('all')
const selectedKanji = ref(null)

const filteredKanji = computed(() => {
  let list = kanjiData
  if (jlptFilter.value !== 'all') {
    list = list.filter(k => k.jlpt === jlptFilter.value)
  }
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(k =>
      k.kanji.includes(q) ||
      k.meaning.some(m => m.toLowerCase().includes(q))
    )
  }
  return list
})

const localizedSelectedKanji = computed(() => {
  if (!selectedKanji.value || locale.value !== 'pt-BR') return selectedKanji.value
  const meaning = getMeaning(selectedKanji.value, 'kanji')
  const examples = selectedKanji.value.examples?.map(ex => ({
    ...ex,
    meaning: getExampleMeaning(ex, selectedKanji.value.kanji)
  }))
  return { ...selectedKanji.value, meaning, examples }
})

function onToggleFavorite() {
  if (!selectedKanji.value) return
  progress.toggleFavoriteKanji(selectedKanji.value.kanji)
}
</script>
