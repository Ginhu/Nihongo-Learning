// useLocaleData.js — simplified: API returns data in active language already
// getMeaning, getFirstMeaning, getExampleMeaning all just read item.meaning directly

export function useLocaleData() {
  function getVocabMeaning(item) {
    return item.meaning
  }

  function getKanjiMeanings(item) {
    return item.meaning  // already array from API
  }

  function getFirstMeaning(item, type) {
    const m = type === 'kanji' ? item.meaning : item.meaning
    return Array.isArray(m) ? m[0] : m
  }

  function getMeaning(item, type) {
    return type === 'kanji' ? item.meaning : item.meaning
  }

  function getExampleMeaning(example) {
    return example.meaning
  }

  return { getMeaning, getFirstMeaning, getExampleMeaning }
}
