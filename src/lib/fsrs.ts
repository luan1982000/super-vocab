import { fsrs, generatorParameters, Rating, State, type Card, type Grade } from 'ts-fsrs'
import type { CardRow, CardUpdate } from './types'

const scheduler = fsrs(
  generatorParameters({
    request_retention: 0.9,
    enable_fuzz: true,
    enable_short_term: true,
  }),
)

/** Map row trong Supabase sang object `Card` của ts-fsrs. */
export function toFsrsCard(row: CardRow): Card {
  return {
    due: new Date(row.due),
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: row.elapsed_days,
    scheduled_days: row.scheduled_days,
    learning_steps: row.learning_steps,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state as State,
    last_review: row.last_review ? new Date(row.last_review) : undefined,
  }
}

/** Map object `Card` của ts-fsrs sang payload update cho bảng `cards`. */
export function toCardUpdate(card: Card): CardUpdate {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.toISOString() : null,
  }
}

/**
 * Tính trước cả 4 lựa chọn chấm điểm cho một card tại thời điểm `now`.
 * Dùng chính kết quả này để ghi DB → khoảng thời gian hiển thị đúng bằng lịch thật.
 */
export function schedule(row: CardRow, now = new Date()) {
  return scheduler.repeat(toFsrsCard(row), now)
}

export const GRADES: { rating: Grade; label: string; hotkey: string; edge: string }[] = [
  { rating: Rating.Again, label: 'Lại', hotkey: '1', edge: 'border-t-danger' },
  { rating: Rating.Hard, label: 'Khó', hotkey: '2', edge: 'border-t-warn' },
  { rating: Rating.Good, label: 'Được', hotkey: '3', edge: 'border-t-accent' },
  { rating: Rating.Easy, label: 'Dễ', hotkey: '4', edge: 'border-t-cool' },
]

export type GradeOption = (typeof GRADES)[number]
