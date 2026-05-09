let audioCtx = null

function getCtx() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    } catch {
      return null
    }
  }
  return audioCtx
}

function createBeep(frequency, duration, type = 'sine', volume = 0.3) {
  const ctx = getCtx()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = frequency
    osc.type = type
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration / 1000)
  } catch {
    // ignore oscillator errors
  }
}

export function playCorrect() {
  createBeep(880, 80)
  setTimeout(() => createBeep(1046, 80), 90)
}

export function playWrong() {
  createBeep(200, 150, 'sawtooth', 0.2)
}

export function playLevelUp() {
  createBeep(523, 100)
  setTimeout(() => createBeep(659, 100), 110)
  setTimeout(() => createBeep(784, 150), 220)
}
