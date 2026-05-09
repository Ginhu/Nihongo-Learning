// 46 base katakana + 25 dakuten/handakuten variants = 71 total
export default [
  // --- Vowels ---
  { kana: 'ア', romaji: 'a',   group: 'vowel' },
  { kana: 'イ', romaji: 'i',   group: 'vowel' },
  { kana: 'ウ', romaji: 'u',   group: 'vowel' },
  { kana: 'エ', romaji: 'e',   group: 'vowel' },
  { kana: 'オ', romaji: 'o',   group: 'vowel' },
  // --- K group ---
  { kana: 'カ', romaji: 'ka',  group: 'k' },
  { kana: 'キ', romaji: 'ki',  group: 'k' },
  { kana: 'ク', romaji: 'ku',  group: 'k' },
  { kana: 'ケ', romaji: 'ke',  group: 'k' },
  { kana: 'コ', romaji: 'ko',  group: 'k' },
  // --- S group ---
  { kana: 'サ', romaji: 'sa',  group: 's' },
  { kana: 'シ', romaji: 'shi', group: 's' },
  { kana: 'ス', romaji: 'su',  group: 's' },
  { kana: 'セ', romaji: 'se',  group: 's' },
  { kana: 'ソ', romaji: 'so',  group: 's' },
  // --- T group ---
  { kana: 'タ', romaji: 'ta',  group: 't' },
  { kana: 'チ', romaji: 'chi', group: 't' },
  { kana: 'ツ', romaji: 'tsu', group: 't' },
  { kana: 'テ', romaji: 'te',  group: 't' },
  { kana: 'ト', romaji: 'to',  group: 't' },
  // --- N group ---
  { kana: 'ナ', romaji: 'na',  group: 'n' },
  { kana: 'ニ', romaji: 'ni',  group: 'n' },
  { kana: 'ヌ', romaji: 'nu',  group: 'n' },
  { kana: 'ネ', romaji: 'ne',  group: 'n' },
  { kana: 'ノ', romaji: 'no',  group: 'n' },
  // --- H group ---
  { kana: 'ハ', romaji: 'ha',  group: 'h' },
  { kana: 'ヒ', romaji: 'hi',  group: 'h' },
  { kana: 'フ', romaji: 'fu',  group: 'h' },
  { kana: 'ヘ', romaji: 'he',  group: 'h' },
  { kana: 'ホ', romaji: 'ho',  group: 'h' },
  // --- M group ---
  { kana: 'マ', romaji: 'ma',  group: 'm' },
  { kana: 'ミ', romaji: 'mi',  group: 'm' },
  { kana: 'ム', romaji: 'mu',  group: 'm' },
  { kana: 'メ', romaji: 'me',  group: 'm' },
  { kana: 'モ', romaji: 'mo',  group: 'm' },
  // --- Y group ---
  { kana: 'ヤ', romaji: 'ya',  group: 'y' },
  { kana: 'ユ', romaji: 'yu',  group: 'y' },
  { kana: 'ヨ', romaji: 'yo',  group: 'y' },
  // --- R group ---
  { kana: 'ラ', romaji: 'ra',  group: 'r' },
  { kana: 'リ', romaji: 'ri',  group: 'r' },
  { kana: 'ル', romaji: 'ru',  group: 'r' },
  { kana: 'レ', romaji: 're',  group: 'r' },
  { kana: 'ロ', romaji: 'ro',  group: 'r' },
  // --- W group ---
  { kana: 'ワ', romaji: 'wa',  group: 'w' },
  { kana: 'ヲ', romaji: 'wo',  group: 'w' },
  // --- N (special) ---
  { kana: 'ン', romaji: 'n',   group: 'special' },
  // --- G group (dakuten) ---
  { kana: 'ガ', romaji: 'ga',  group: 'g' },
  { kana: 'ギ', romaji: 'gi',  group: 'g' },
  { kana: 'グ', romaji: 'gu',  group: 'g' },
  { kana: 'ゲ', romaji: 'ge',  group: 'g' },
  { kana: 'ゴ', romaji: 'go',  group: 'g' },
  // --- Z group (dakuten) ---
  { kana: 'ザ', romaji: 'za',  group: 'z' },
  { kana: 'ジ', romaji: 'ji',  group: 'z' },
  { kana: 'ズ', romaji: 'zu',  group: 'z' },
  { kana: 'ゼ', romaji: 'ze',  group: 'z' },
  { kana: 'ゾ', romaji: 'zo',  group: 'z' },
  // --- D group (dakuten) ---
  { kana: 'ダ', romaji: 'da',  group: 'd' },
  { kana: 'ヂ', romaji: 'di',  group: 'd' },
  { kana: 'ヅ', romaji: 'du',  group: 'd' },
  { kana: 'デ', romaji: 'de',  group: 'd' },
  { kana: 'ド', romaji: 'do',  group: 'd' },
  // --- B group (dakuten) ---
  { kana: 'バ', romaji: 'ba',  group: 'b' },
  { kana: 'ビ', romaji: 'bi',  group: 'b' },
  { kana: 'ブ', romaji: 'bu',  group: 'b' },
  { kana: 'ベ', romaji: 'be',  group: 'b' },
  { kana: 'ボ', romaji: 'bo',  group: 'b' },
  // --- P group (handakuten) ---
  { kana: 'パ', romaji: 'pa',  group: 'p' },
  { kana: 'ピ', romaji: 'pi',  group: 'p' },
  { kana: 'プ', romaji: 'pu',  group: 'p' },
  { kana: 'ペ', romaji: 'pe',  group: 'p' },
  { kana: 'ポ', romaji: 'po',  group: 'p' },
]
