import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/composables/useApi'

const normalizeKana = k => ({ ...k, group: k.grp ?? k.group })
const normalizeKanji = k => ({ ...k, strokeCount: k.stroke_count ?? k.strokeCount })

export const useContentStore = defineStore('content', () => {
  const kana = ref([])
  const vocabulary = ref([])
  const kanji = ref([])
  const loaded = ref(false)

  async function fetchAll(lang = 'en') {
    try {
      const [hiraganaRes, katakanaRes, vocabRes, kanjiRes] = await Promise.all([
        api.get('/content/kana?type=hiragana'),
        api.get('/content/kana?type=katakana'),
        api.get(`/content/vocabulary?jlpt=all&lang=${lang}`),
        api.get(`/content/kanji?jlpt=all&lang=${lang}`),
      ])

      kana.value = [...hiraganaRes.data, ...katakanaRes.data].map(normalizeKana)
      vocabulary.value = vocabRes.data
      kanji.value = kanjiRes.data.map(normalizeKanji)
      loaded.value = true
    } catch (err) {
      console.error('[useContentStore] fetchAll failed:', err)
      throw err
    }
  }

  async function refetchLang(lang) {
    try {
      const [vocabRes, kanjiRes] = await Promise.all([
        api.get(`/content/vocabulary?jlpt=all&lang=${lang}`),
        api.get(`/content/kanji?jlpt=all&lang=${lang}`),
      ])

      vocabulary.value = vocabRes.data
      kanji.value = kanjiRes.data.map(normalizeKanji)
    } catch (err) {
      console.error('[useContentStore] refetchLang failed:', err)
      throw err
    }
  }

  return { kana, vocabulary, kanji, loaded, fetchAll, refetchLang }
})
