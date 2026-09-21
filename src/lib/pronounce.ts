/**
 * Phát âm tiếng Anh, không dùng API key:
 * - IPA: Wiktionary Action API (template {{IPA|en|/.../}}).
 * - Audio: file Wikimedia Commons `En-us-<word>.ogg` → bản mp3 transcode (nghe được cả trên iOS Safari).
 * - Phát: ưu tiên mp3 thật, lỗi thì rơi về Web Speech API (TTS có sẵn trong browser, không cần mạng).
 */

const FETCH_TIMEOUT_MS = 8000
const EN_LANG = 'en-US'

interface FetchOutcome {
  data: unknown | null
  failed: boolean
}

async function fetchJson(url: string): Promise<FetchOutcome> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) return { data: null, failed: true }
    return { data: (await response.json()) as unknown, failed: false }
  } catch {
    return { data: null, failed: true }
  } finally {
    clearTimeout(timer)
  }
}

/** Lấy IPA từ wikitext của Wiktionary: {{IPA|en|/ˈkæn.dɪd/|...}} → /ˈkæn.dɪd/. */
function ipaFromWikitext(wikitext: string): string | null {
  const template = wikitext.match(/\{\{IPA\|en\|([^}]*)\}\}/)
  if (!template) return null
  const phonemic = template[1].match(/\/[^/|]+\//)
  return phonemic ? phonemic[0].replace(/['"]/g, '') : null
}

/** Bản mp3 của file ogg trên Commons — cần cho Safari/iOS (không phát ogg). */
function mp3FromCommonsUrl(fileUrl: string): string {
  const match = fileUrl.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/(.+?)(\?.*)?$/)
  if (!match) return fileUrl
  const [, host, path] = match
  return `${host}/transcoded/${path}/${path.split('/').pop()}.mp3`
}

/** payload.parse.wikitext['*'] — JSON từ mạng nên kiểm tra từng tầng bằng `in`/`typeof`. */
function readWikitext(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null || !('parse' in payload)) return null
  const { parse } = payload
  if (typeof parse !== 'object' || parse === null || !('wikitext' in parse)) return null
  const { wikitext } = parse
  if (typeof wikitext !== 'object' || wikitext === null || !('*' in wikitext)) return null
  const text = wikitext['*']
  return typeof text === 'string' ? text : null
}

/** payload.query.pages[*].imageinfo[0].url */
function readCommonsFileUrl(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null || !('query' in payload)) return null
  const { query } = payload
  if (typeof query !== 'object' || query === null || !('pages' in query)) return null
  const { pages } = query
  if (typeof pages !== 'object' || pages === null) return null

  for (const value of Object.values(pages)) {
    const page: unknown = value
    if (typeof page !== 'object' || page === null || !('imageinfo' in page)) continue
    const { imageinfo } = page
    if (!Array.isArray(imageinfo)) continue
    const first: unknown = imageinfo[0]
    if (typeof first === 'object' && first !== null && 'url' in first && typeof first.url === 'string') {
      return first.url
    }
  }
  return null
}

export interface Pronunciation {
  phonetic: string | null
  audioUrl: string | null
  /** true khi có ít nhất một nguồn lỗi (mạng, timeout, 429…) — khác với "từ không có dữ liệu". */
  failed: boolean
}

export async function lookupPronunciation(word: string): Promise<Pronunciation> {
  const term = word.trim().toLowerCase()
  if (!term) return { phonetic: null, audioUrl: null, failed: false }

  const encoded = encodeURIComponent(word.trim())

  const [wiktionary, commons] = await Promise.all([
    fetchJson(
      `https://en.wiktionary.org/w/api.php?action=parse&format=json&prop=wikitext&redirects=1&origin=*&page=${encoded}`,
    ),
    fetchJson(
      `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&origin=*&titles=${encodeURIComponent(
        `File:En-us-${term}.ogg`,
      )}`,
    ),
  ])

  const wikitext = readWikitext(wiktionary.data)
  const phonetic = wikitext ? ipaFromWikitext(wikitext) : null

  const fileUrl = readCommonsFileUrl(commons.data)
  const audioUrl = fileUrl ? mp3FromCommonsUrl(fileUrl) : null

  // Commons không có file là chuyện bình thường (không tính là lỗi); Wiktionary lỗi thì không tra được IPA.
  const failed = wiktionary.failed && !phonetic

  return { phonetic, audioUrl, failed }
}

/** Chọn giọng đọc tiếng Anh tốt nhất có trên máy. */
function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null
  const english = voices.filter((voice) => voice.lang.startsWith('en'))
  if (english.length === 0) return voices[0]
  const preferred = ['en-US', 'en-GB', 'en-AU']
  for (const lang of preferred) {
    const found = english.find((voice) => voice.lang === lang)
    if (found) return found
  }
  return english[0]
}

export function speakWord(word: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = EN_LANG
  utterance.rate = 0.95
  const voice = pickVoice()
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
  return true
}

/**
 * Phát phát âm của một từ: mp3 thật nếu có, ngược lại (hoặc khi phát lỗi) dùng TTS.
 * Trả về nguồn đã dùng để UI biết có phát được hay không.
 */
export async function playPronunciation(word: string, audioUrl: string | null): Promise<'audio' | 'tts' | 'none'> {
  if (audioUrl) {
    try {
      const element = new Audio(audioUrl)
      await element.play()
      return 'audio'
    } catch {
      // File lỗi/định dạng không hỗ trợ (ví dụ ogg trên Safari) → dùng TTS.
    }
  }
  return speakWord(word) ? 'tts' : 'none'
}
