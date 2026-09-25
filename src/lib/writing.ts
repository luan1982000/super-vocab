import { supabase } from './supabase'
import type { CardRow } from './types'

/** Một lỗi AI chỉ ra trong câu người học viết. */
export interface WritingError {
  /** Loại lỗi, ví dụ "Ngữ pháp", "Từ vựng", "Chính tả", "Collocation". */
  type: string
  /** Đoạn sai trong câu người học. */
  excerpt: string
  /** Giải thích ngắn bằng tiếng Việt. */
  explain: string
  /** Cách sửa. */
  fix: string
}

/** Kết quả chấm một câu. */
export interface WritingGrade {
  /** 0–100. */
  score: number
  /** Nhận xét ngắn, ví dụ "Tốt", "Khá", "Cần cố gắng". */
  level: string
  /** Nhận xét tổng quát. */
  verdict: string
  /** Câu có dùng đúng từ mục tiêu hay không. */
  usedWord: boolean
  errors: WritingError[]
  /** Câu đã sửa hoàn chỉnh. */
  corrected: string
  /** Vài câu khác người học có thể tham khảo. */
  alternatives: string[]
  /** Mẹo ngắn để viết tốt hơn. */
  tip: string
}

export interface WritingInput {
  card: CardRow
  sentence: string
}

const EMPTY_GRADE: WritingGrade = {
  score: 0,
  level: '',
  verdict: '',
  usedWord: true,
  errors: [],
  corrected: '',
  alternatives: [],
  tip: '',
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeError(raw: unknown): WritingError {
  const value = (raw ?? {}) as Record<string, unknown>
  return {
    type: asString(value.type) || 'Lỗi',
    excerpt: asString(value.excerpt),
    explain: asString(value.explain),
    fix: asString(value.fix),
  }
}

/** Ép phản hồi của model về đúng kiểu, chịu được field thiếu/sai. */
function normalize(raw: unknown): WritingGrade {
  const value = (raw ?? {}) as Record<string, unknown>
  const score = Number(value.score)
  return {
    ...EMPTY_GRADE,
    score: Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 0,
    level: asString(value.level),
    verdict: asString(value.verdict),
    usedWord: value.usedWord !== false,
    errors: Array.isArray(value.errors) ? value.errors.map(normalizeError) : [],
    corrected: asString(value.corrected),
    alternatives: Array.isArray(value.alternatives)
      ? value.alternatives.map(asString).filter((item) => item.length > 0)
      : [],
    tip: asString(value.tip),
  }
}

/** Đọc thông báo lỗi từ FunctionsHttpError (edge function trả JSON `{ error }`). */
async function messageFromError(error: unknown): Promise<string> {
  const context = (error as { context?: Response }).context
  if (context && typeof context.json === 'function') {
    try {
      const body = (await context.clone().json()) as { error?: unknown }
      if (body && typeof body.error === 'string') return body.error
    } catch {
      // Body không phải JSON — rơi xuống message mặc định.
    }
  }
  const message = (error as { message?: unknown }).message
  return typeof message === 'string' ? message : 'Không gọi được máy chấm.'
}

/** Gọi edge function `grade-writing` để chấm một câu. */
export async function gradeWriting({
  card,
  sentence,
}: WritingInput): Promise<{ grade: WritingGrade | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('grade-writing', {
    body: {
      word: card.word,
      meaning: card.meaning,
      example: card.example,
      note: card.note,
      sentence,
    },
  })

  if (error) return { grade: null, error: await messageFromError(error) }
  if (!data || typeof data !== 'object') return { grade: null, error: 'Phản hồi không hợp lệ từ máy chấm.' }

  const body = data as Record<string, unknown>
  if (typeof body.error === 'string') return { grade: null, error: body.error }

  return { grade: normalize(body), error: null }
}
