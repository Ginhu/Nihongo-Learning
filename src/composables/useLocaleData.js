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
