export interface CardRow {
  id: string
  user_id: string
  collection_id: string | null
  word: string
  meaning: string
  example: string | null
  note: string | null
  phonetic: string | null
  audio_url: string | null
  due: string
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  learning_steps: number
  reps: number
  lapses: number
  state: number
  last_review: string | null
  created_at: string
}

export interface CollectionRow {
  id: string
  user_id: string
  name: string
  created_at: string
}

/** Trường người dùng nhập/sửa được. */
export type CardInput = Pick<
  CardRow,
  'word' | 'meaning' | 'example' | 'note' | 'collection_id' | 'phonetic' | 'audio_url'
>

/** Trường cập nhật được, gồm cả trường FSRS. */
export type CardUpdate = Partial<Omit<CardRow, 'id' | 'user_id' | 'created_at'>>

/* ---- Ngữ pháp ---- */

/** `not_started` chưa học · `learning` đang học · `needs_review` cần ôn · `mastered` đã nắm. */
export type GrammarStatus = 'not_started' | 'learning' | 'needs_review' | 'mastered'

export interface GrammarExample {
  en: string
  vi: string
}

export interface GrammarExercise {
  prompt: string
  /** Đúng 4 lựa chọn. */
  options: string[]
  /** Index 0–3 của đáp án đúng. */
  answer: number
  explanation: string
}

/** Nội dung chủ đề: dùng chung cho mọi user, sửa được trong app. */
export interface GrammarTopicRow {
  id: string
  slug: string
  stage: number
  position: number
  title: string
  title_en: string | null
  summary: string
  content: string
  examples: GrammarExample[]
  exercises: GrammarExercise[]
  is_new: boolean
  created_at: string
  updated_at: string
}

/** Tiến độ của riêng user cho một chủ đề. */
export interface GrammarProgressRow {
  id: string
  user_id: string
  topic_id: string
  status: GrammarStatus
  mastery: number | null
  /** Ngày dạng `YYYY-MM-DD` (date picker), không phải timestamp. */
  last_studied_on: string | null
  /** Ngày dạng `YYYY-MM-DD`. */
  next_review_on: string | null
  reviewed_at: string | null
  review_count: number
  updated_at: string
}

export type GrammarProgressInput = Partial<
  Pick<
    GrammarProgressRow,
    'status' | 'mastery' | 'last_studied_on' | 'next_review_on' | 'reviewed_at' | 'review_count'
  >
>

export type GrammarTopicContentInput = Pick<
  GrammarTopicRow,
  'title' | 'title_en' | 'summary' | 'content' | 'examples' | 'exercises'
>

/** Chủ đề + tiến độ của user hiện tại (null = chưa có bản ghi). */
export type GrammarTopic = GrammarTopicRow & { progress: GrammarProgressRow | null }
