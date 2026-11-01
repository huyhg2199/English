/** Nút nghe dùng Web Speech API (`speechSynthesis`), giọng Mỹ. Không có API thì app ẩn nút nghe. */

export const SPEECH_LANG = 'en-US'

type SpeechGlobal = {
  speechSynthesis?: SpeechSynthesis
  SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance
}

export function canSpeak(g: SpeechGlobal = globalThis as SpeechGlobal): boolean {
  try {
    return typeof g.speechSynthesis?.speak === 'function' && typeof g.SpeechSynthesisUtterance === 'function'
  } catch {
    return false
  }
}

/** Đọc `text` bằng giọng en-US (ưu tiên giọng có sẵn đúng en-US). Lỗi thì bỏ qua, không crash. */
export function speak(text: string, opts: { rate?: number } = {}, g: SpeechGlobal = globalThis as SpeechGlobal): boolean {
  if (!canSpeak(g)) return false
  try {
    const synth = g.speechSynthesis!
    const utterance = new g.SpeechSynthesisUtterance!(text)
    utterance.lang = SPEECH_LANG
    utterance.rate = opts.rate ?? 0.9
    const voice = synth.getVoices?.().find((v) => v.lang === SPEECH_LANG || v.lang === 'en_US')
    if (voice) utterance.voice = voice
    synth.cancel()
    synth.speak(utterance)
    return true
  } catch {
    return false
  }
}
