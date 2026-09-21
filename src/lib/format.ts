export const STATE_LABELS: Record<number, string> = {
  0: 'Mới',
  1: 'Đang học',
  2: 'Ôn tập',
  3: 'Học lại',
}

export const STATE_TONES: Record<number, string> = {
  0: 'border border-rule text-ink-soft',
  1: 'bg-ochre/15 text-ochre',
  2: 'bg-pen/12 text-pen',
  3: 'bg-red-pen/12 text-red-pen',
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** Khoảng thời gian giữa 2 mốc, dạng "10 phút", "3 ngày", "2.5 tháng". */
export function formatInterval(from: Date, to: Date): string {
  const ms = to.getTime() - from.getTime()
  if (ms < MINUTE) return `${Math.max(1, Math.round(ms / 1000))} giây`
  if (ms < HOUR) return `${Math.round(ms / MINUTE)} phút`
  if (ms < DAY) return `${Math.round(ms / HOUR)} giờ`
  const days = ms / DAY
  if (days < 30) return `${Math.round(days)} ngày`
  if (days < 365) return `${(days / 30.4375).toFixed(1)} tháng`
  return `${(days / 365.25).toFixed(1)} năm`
}

/** Ngày giờ đầy đủ theo giờ máy, ví dụ "21/09/2026 14:30". */
export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Mốc `due` so với hiện tại: "quá hạn 2 giờ" / "trong 3 ngày". */
export function formatDueRelative(due: string, now = new Date()): string {
  const target = new Date(due)
  const overdue = target.getTime() <= now.getTime()
  const span = formatInterval(overdue ? target : now, overdue ? now : target)
  return overdue ? `quá hạn ${span}` : `trong ${span}`
}
