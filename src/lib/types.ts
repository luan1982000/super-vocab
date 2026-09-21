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
