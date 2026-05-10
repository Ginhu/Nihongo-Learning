<template>
  <div class="card-scene card-scene-height" :style="{ height: sceneHeight + 'px' }" @click="flipped = !flipped" tabindex="0" @keydown.enter.prevent="flipped = !flipped" @keydown.space.prevent="flipped = !flipped">
    <div class="card-inner" :class="{ 'is-flipped': flipped }" :style="{ height: sceneHeight + 'px' }">

      <!-- Front face -->
      <div
        class="card-face w-full flex flex-col items-center justify-center p-8 border"
        :style="{ height: sceneHeight + 'px', background: 'var(--color-surface)', borderColor: 'var(--color-border)' }"
      >
        <div
          class="font-bold select-none text-center"
          :style="type === 'vocabulary'
            ? 'font-size: clamp(32px, 8vw, 56px); line-height: 1.2;'
            : 'font-size: clamp(72px, 18vw, 130px); line-height: 1;'"
        >
          {{ frontChar }}
        </div>

        <div
          v-if="frontHint && (type === 'vocabulary' || settings.romajiVisible)"
          class="mt-4 text-lg font-medium"
          style="color: var(--color-text-muted);"
        >
          {{ frontHint }}
        </div>

        <div class="mt-6 text-xs" style="color: var(--color-text-muted);">tap to flip</div>
      </div>

      <!-- Back face -->
      <div
        class="card-face card-face--back w-full flex flex-col items-center justify-start p-8 border overflow-y-auto"
        :style="{ height: sceneHeight + 'px', background: 'var(--color-surface)', borderColor: 'var(--color-border)' }"
        @click.stop
      >
        <template v-if="type === 'kanji'">
          <div class="font-bold text-4xl mb-2">{{ card.kanji }}</div>
          <div class="text-xl font-semibold text-center">{{ card.meaning.join(', ') }}</div>

          <div class="mt-4 w-full space-y-1 text-sm">
            <div v-if="card.onyomi.length" style="color: var(--color-text-muted);">
              <span class="font-semibold" style="color: var(--color-text);">On: </span>{{ card.onyomi.join('、') }}
            </div>
            <div v-if="card.kunyomi.length" style="color: var(--color-text-muted);">
              <span class="font-semibold" style="color: var(--color-text);">Kun: </span>{{ card.kunyomi.join('、') }}
            </div>
          </div>

          <div v-if="card.examples?.length" class="mt-4 w-full">
            <div
              v-for="ex in card.examples.slice(0, 2)"
              :key="ex.word"
              class="mt-1 p-2 rounded-lg text-sm"
              style="background: var(--color-surface-2);"
            >
              <span class="font-bold">{{ ex.word }}</span>
              <span class="ml-2" style="color: var(--color-text-muted);">{{ ex.reading }}</span>
              <span class="ml-2">— {{ ex.meaning }}</span>
            </div>
          </div>
        </template>

        <template v-else-if="type === 'vocabulary'">
          <div
            class="font-bold text-center select-none"
            style="font-size: clamp(32px, 8vw, 56px); line-height: 1.2;"
          >
            {{ card.expression }}
          </div>
          <div class="mt-3 text-xl font-medium" style="color: var(--color-text-muted);">
            {{ card.reading }}
          </div>
          <div class="mt-6 text-2xl font-semibold text-center">
            {{ card.meaning }}
          </div>
        </template>

        <template v-else>
          <div class="font-bold select-none" style="font-size: clamp(48px, 12vw, 80px); line-height: 1;">
            {{ card.kana }}
          </div>
          <div class="mt-4 text-3xl font-semibold">{{ card.romaji }}</div>
          <div class="mt-2 text-sm px-3 py-1 rounded-full" style="background: var(--color-surface-2); color: var(--color-text-muted);">
            {{ card.group }} group
          </div>
        </template>

        <div class="mt-6 text-xs" style="color: var(--color-text-muted);">tap to flip back</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps({
  card:  { type: Object, required: true },
  type:  { type: String, required: true },
  sceneHeight: { type: Number, default: 300 }
})

const settings = useSettingsStore()
const flipped = ref(false)

watch(() => props.card, () => { flipped.value = false })

const frontChar = computed(() => {
  if (props.type === 'vocabulary') return props.card.expression
  if (props.type === 'kanji') return props.card.kanji
  return props.card.kana
})

const frontHint = computed(() => {
  if (props.type === 'vocabulary') return props.card.reading ?? null
  if (props.type === 'kanji') return null
  return props.card.romaji ?? null
})
</script>
