import type {
  GrammarProgressInput,
  GrammarProgressRow,
  GrammarStatus,
  GrammarTopic,
  GrammarTopicRow,
} from './types'

export const GRAMMAR_STAGE_TITLES: Record<number, string> = {
  1: 'Nền tảng câu và từ loại',
  2: 'Hệ thống thì',
  3: 'Mở rộng',
  4: 'Ứng dụng',
  5: 'Nâng cao và luyện thi TOEIC',
}

export const GRAMMAR_STAGES = [1, 2, 3, 4, 5] as const

export const GRAMMAR_STATUSES: GrammarStatus[] = [
  'not_started',
  'learning',
  'needs_review',
  'mastered',
]

interface StatusMeta {
  label: string
  hint: string
  /** Chấm nhận diện trạng thái (luôn đi kèm nhãn chữ). */
  dot: string
  /** Badge đọc: nền nhạt + chữ màu, dùng ở danh sách và đầu trang chi tiết. */
  badge: string
  /** Nút/chip đang chọn: nền đặc theo trạng thái. */
  solid: string
  /** Nút/chip chưa chọn: nền nhạt cùng màu để vẫn có sắc. */
  chipIdle: string
  /** Viền trên của bảng tiến độ. */
  panelBorder: string
}

export const GRAMMAR_STATUS_META: Record<GrammarStatus, StatusMeta> = {
  not_started: {
    label: 'Chưa học',
    hint: 'Chưa mở chủ đề này.',
    dot: 'bg-tab-slate',
    badge: 'bg-tab-slate text-highlighter-ink',
    solid: 'border-tab-slate bg-tab-slate text-highlighter-ink',
    chipIdle: 'border-tab-slate/70 bg-tab-slate/25 text-ink hover:border-tab-slate',
    panelBorder: 'border-t-tab-slate',
  },
  learning: {
    label: 'Đang học',
    hint: 'Đang làm quen; ôn lại sau 1 ngày.',
    dot: 'bg-cool',
    badge: 'bg-cool text-on-accent',
    solid: 'border-cool bg-cool text-on-accent',
    chipIdle: 'border-cool/70 bg-cool/25 text-cool hover:border-cool hover:bg-cool/30',
    panelBorder: 'border-t-cool',
  },
  needs_review: {
    label: 'Cần ôn',
    hint: 'Làm lại sau 3 ngày.',
    dot: 'bg-warn',
    badge: 'bg-warn text-on-accent',
    solid: 'border-warn bg-warn text-on-accent',
    chipIdle: 'border-warn/70 bg-warn/25 text-warn hover:border-warn hover:bg-warn/30',
    panelBorder: 'border-t-warn',
  },
  mastered: {
    label: 'Đã nắm',
    hint: 'Học lại sau 1 tuần nếu thật sự cần.',
    dot: 'bg-accent',
    badge: 'bg-accent text-on-accent',
    solid: 'border-accent bg-accent text-on-accent',
    chipIdle: 'border-accent/70 bg-accent/25 text-accent hover:border-accent hover:bg-accent/30',
    panelBorder: 'border-t-accent',
  },
}

/** Màu nhận diện 5 giai đoạn — chip, chấm và ô số thứ tự. */
export const GRAMMAR_STAGE_TONES: Record<
  number,
  { tile: string; header: string; bar: string }
> = {
  1: {
    tile: 'bg-tab-sage text-highlighter-ink',
    header: 'bg-tab-sage/20',
    bar: 'border-l-tab-sage',
  },
  2: {
    tile: 'bg-tab-slate text-highlighter-ink',
    header: 'bg-tab-slate/20',
    bar: 'border-l-tab-slate',
  },
  3: {
    tile: 'bg-tab-ochre text-highlighter-ink',
    header: 'bg-tab-ochre/20',
    bar: 'border-l-tab-ochre',
  },
  4: {
    tile: 'bg-tab-mauve text-highlighter-ink',
    header: 'bg-tab-mauve/20',
    bar: 'border-l-tab-mauve',
  },
  5: {
    tile: 'bg-tab-clay text-highlighter-ink',
    header: 'bg-tab-clay/20',
    bar: 'border-l-tab-clay',
  },
}

/** Mức độ nắm 1–5. Index 0 = mức 1. */
export const MASTERY_LABELS = [
  'chưa hiểu',
  'mới nhận biết',
  'làm được bài cơ bản',
  'áp dụng được bài trộn',
  'giải thích và dùng linh hoạt',
]

/** Khoảng cách gợi ý sau khi đánh dấu đã ôn. `null` = chưa học thì chưa đặt lịch. */
export const REVIEW_AFTER_DAYS: Record<GrammarStatus, number | null> = {
  not_started: null,
  learning: 1,
  needs_review: 3,
  mastered: 7,
}

/** Ngày hôm nay theo giờ máy, dạng `YYYY-MM-DD`. */
export function todayISO(now = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Cộng/trừ ngày trên chuỗi `YYYY-MM-DD`, giữ nguyên kiểu date-only. */
export function shiftISO(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  return todayISO(new Date(year, month - 1, day + days))
}

/** Ngày ôn tiếp gợi ý theo trạng thái, tính từ hôm nay. */
export function nextReviewFor(status: GrammarStatus, from = todayISO()): string | null {
  const days = REVIEW_AFTER_DAYS[status]
  return days === null ? null : shiftISO(from, days)
}

/** `20/10/2026`; `null` → `—`. */
export function formatDay(iso: string | null): string {
  if (!iso) return '—'
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

/** Số ngày lệch (âm = quá khứ), tính bằng UTC để không lệch vì DST. */
export function dayDiff(fromISO: string, toISO: string): number {
  const from = Date.parse(`${fromISO}T00:00:00Z`)
  const to = Date.parse(`${toISO}T00:00:00Z`)
  return Math.round((to - from) / 86_400_000)
}

/** Trạng thái lịch ôn của một chủ đề so với hôm nay. */
export interface ReviewTiming {
  due: boolean
  /** Nhãn ngắn: "Quá hạn 2 ngày", "Hôm nay", "Còn 3 ngày", "Chưa đặt lịch". */
  label: string
  overdueDays: number
  daysLeft: number | null
}

export function reviewTiming(nextReviewOn: string | null, today = todayISO()): ReviewTiming {
  if (!nextReviewOn) {
    return { due: false, label: 'Chưa đặt lịch', overdueDays: 0, daysLeft: null }
  }
  const diff = dayDiff(today, nextReviewOn)
  if (diff < 0) {
    const overdueDays = Math.abs(diff)
    return {
      due: true,
      label: `Quá hạn ${overdueDays} ngày`,
      overdueDays,
      daysLeft: diff,
    }
  }
  if (diff === 0) return { due: true, label: 'Hôm nay', overdueDays: 0, daysLeft: 0 }
  return { due: false, label: `Còn ${diff} ngày`, overdueDays: 0, daysLeft: diff }
}

/** Chủ đề đã học và đã tới ngày ôn. */
export function isDue(topic: GrammarTopic, today = todayISO()): boolean {
  const progress = topic.progress
  if (!progress || progress.status === 'not_started') return false
  return reviewTiming(progress.next_review_on, today).due
}

/** Ghép chủ đề với tiến độ của user; chủ đề chưa có bản ghi thì `progress = null`. */
export function mergeGrammarTopics(
  topics: GrammarTopicRow[],
  progress: GrammarProgressRow[],
): GrammarTopic[] {
  const byTopic = new Map(progress.map((row) => [row.topic_id, row]))
  return topics.map((topic) => ({ ...topic, progress: byTopic.get(topic.id) ?? null }))
}

/** Patch khi bấm "Đã ôn hôm nay": ghi ngày học và tính ngày ôn tiếp. */
export function reviewedPatch(
  progress: GrammarProgressRow | null,
  today = todayISO(),
): GrammarProgressInput {
  const status = progress?.status && progress.status !== 'not_started' ? progress.status : 'learning'
  return {
    status,
    last_studied_on: today,
    next_review_on: nextReviewFor(status, today),
    reviewed_at: new Date().toISOString(),
    review_count: (progress?.review_count ?? 0) + 1,
  }
}

/** Đổi trạng thái: đặt lại lịch ôn tiếp theo quy tắc của trạng thái mới. */
export function statusPatch(status: GrammarStatus, today = todayISO()): GrammarProgressInput {
  return { status, next_review_on: nextReviewFor(status, today) }
}
