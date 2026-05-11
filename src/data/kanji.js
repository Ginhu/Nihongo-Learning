// Combined JLPT kanji — re-exports n5_kanji + n4_kanji for backward compatibility
import n5Kanji from './n5_kanji.js'
import n4Kanji from './n4_kanji.js'
export default [...n5Kanji, ...n4Kanji]
