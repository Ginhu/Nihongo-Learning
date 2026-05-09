import hiragana from '@/data/hiragana.js'
import katakana from '@/data/katakana.js'
import kanji from '@/data/kanji.js'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickWrong(pool, correct, count) {
  return shuffle(pool.filter(v => v !== correct)).slice(0, count)
}

function buildKanaQuestions(data, direction, optionCount, length) {
  const pool = shuffle(data).slice(0, length)
  return pool.map(item => {
    const prompt = direction === 'kana-to-romaji' ? item.kana : item.romaji
    const correct = direction === 'kana-to-romaji' ? item.romaji : item.kana
    const wrongPool = data
      .filter(d => d.kana !== item.kana)
      .map(d => direction === 'kana-to-romaji' ? d.romaji : d.kana)
    const wrongs = pickWrong(wrongPool, correct, optionCount - 1)
    return {
      prompt,
      correctAnswer: correct,
      options: shuffle([correct, ...wrongs])
    }
  })
}

function buildKanjiQuestions(data, direction, optionCount, jlptFilter, length) {
  let filtered = jlptFilter === 'all' ? data : data.filter(k => k.jlpt === jlptFilter)
  if (filtered.length === 0) filtered = data
  const shuffled = shuffle(filtered)
  const pool = length == null ? shuffled : shuffled.slice(0, length)

  return pool.map(item => {
    let prompt, correct, wrongPool

    if (direction === 'kanji-to-meaning') {
      prompt = item.kanji
      correct = item.meaning[0]
      wrongPool = data.filter(k => k.kanji !== item.kanji).map(k => k.meaning[0])
    } else {
      prompt = item.kanji
      const readings = [...item.onyomi, ...item.kunyomi]
      correct = readings[0] ?? item.meaning[0]
      wrongPool = [...new Set(
        data
          .filter(k => k.kanji !== item.kanji)
          .flatMap(k => [...k.onyomi, ...k.kunyomi])
      )]
    }

    const wrongs = pickWrong(wrongPool, correct, optionCount - 1)
    return {
      prompt,
      correctAnswer: correct,
      options: shuffle([correct, ...wrongs]),
      onyomi: item.onyomi ?? [],
      kunyomi: item.kunyomi ?? []
    }
  })
}

export function generateQuestions({ mode, direction, difficulty, jlptFilter, length }) {
  const optionCount = { easy: 2, medium: 4, hard: 6 }[difficulty] ?? 4

  if (mode === 'hiragana') return buildKanaQuestions(hiragana, direction, optionCount, length)
  if (mode === 'katakana') return buildKanaQuestions(katakana, direction, optionCount, length)
  if (mode === 'kanji')    return buildKanjiQuestions(kanji, direction, optionCount, jlptFilter, length)
  return []
}
