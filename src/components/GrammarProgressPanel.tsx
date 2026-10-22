import { CheckCircle } from '@phosphor-icons/react'
import {
  GRAMMAR_STATUSES,
  GRAMMAR_STATUS_META,
  MASTERY_LABELS,
  REVIEW_AFTER_DAYS,
  formatDay,
  reviewTiming,
  statusPatch,
} from '../lib/grammar'
import { formatDateTime } from '../lib/format'
import type { GrammarProgressInput, GrammarStatus, GrammarTopic } from '../lib/types'

interface GrammarProgressPanelProps {
  topic: GrammarTopic
  today: string
  busy: boolean
  saved: boolean
  error: string | null
  onSave: (patch: GrammarProgressInput) => void
  onReview: () => void
}

/**
 * Bảng điều khiển tiến độ: trạng thái, mức nắm, hai ngày dạng date picker,
 * và nút đánh dấu đã ôn (tự ghi ngày học + tính ngày ôn tiếp).
 */
export function GrammarProgressPanel({
  topic,
  today,
  busy,
  saved,
  error,
  onSave,
  onReview,
}: GrammarProgressPanelProps) {
  const progress = topic.progress
  const status = progress?.status ?? 'not_started'
  const timing = reviewTiming(progress?.next_review_on ?? null, today)
  const mastery = progress?.mastery ?? null

  return (
    <section
      aria-labelledby="grammar-progress-title"
      className={`panel border-t-2 p-4 sm:p-5 ${GRAMMAR_STATUS_META[status].panelBorder}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="grammar-progress-title"
          className="font-serif text-[1.0625rem] font-medium tracking-[-0.01em] text-ink"
        >
          Tiến độ của bạn
        </h2>
        <span aria-live="polite" className="text-[0.75rem] text-ink-soft">
          {busy ? 'Đang lưu…' : saved ? 'Đã lưu' : ''}
        </span>
      </div>

      <button type="button" onClick={onReview} disabled={busy} className="btn btn-primary mt-4 w-full">
        <CheckCircle aria-hidden size={18} />
        Đã ôn hôm nay
      </button>
      <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-soft">
        Ghi ngày học hôm nay, tăng số lần ôn và tự đặt ngày ôn tiếp theo trạng thái.
      </p>

      <div className="mt-5">
        <span className="micro">Trạng thái</span>
        <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="Trạng thái học">
          {GRAMMAR_STATUSES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={status === option}
              disabled={busy}
              onClick={() => onSave(statusPatch(option, today))}
              className={`tap-target flex items-center justify-center gap-1.5 rounded-ui border px-2 py-1.5 text-sm transition-colors ${
                status === option
                  ? `${GRAMMAR_STATUS_META[option].solid} font-medium`
                  : GRAMMAR_STATUS_META[option].chipIdle
              }`}
            >
              <span
                aria-hidden
                className={`size-1.5 shrink-0 rounded-full ${
                  status === option ? 'bg-current opacity-70' : GRAMMAR_STATUS_META[option].dot
                }`}
              />
              {GRAMMAR_STATUS_META[option].label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-soft">
          {GRAMMAR_STATUS_META[status].hint}
        </p>
      </div>

      <div className="mt-5">
        <span className="micro">Mức độ nắm</span>
        <div className="mt-2 grid grid-cols-5 gap-1.5" role="group" aria-label="Mức độ nắm từ 1 đến 5">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              aria-pressed={mastery === level}
              aria-label={`Mức ${level}: ${MASTERY_LABELS[level - 1]}`}
              title={`${level} — ${MASTERY_LABELS[level - 1]}`}
              disabled={busy}
              onClick={() => onSave({ mastery: mastery === level ? null : level })}
              className={`tap-target tnum rounded-ui border py-1.5 text-sm transition-colors ${
                mastery === level
                  ? 'border-accent bg-accent font-medium text-on-accent'
                  : 'border-line-strong text-ink-soft hover:border-ink-soft hover:text-ink'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-soft">
          {mastery === null ? 'Chưa đánh giá.' : `Mức ${mastery}: ${MASTERY_LABELS[mastery - 1]}.`}
        </p>
        <details className="mt-2 text-[0.75rem] text-ink-soft">
          <summary className="cursor-pointer rounded-ui py-1 hover:text-ink">Ý nghĩa mức 1–5</summary>
          <ol className="mt-1.5 list-decimal space-y-1 pl-5 leading-relaxed">
            {MASTERY_LABELS.map((label, index) => (
              <li key={label}>
                <span className="tnum">{index + 1}</span> — {label}
              </li>
            ))}
          </ol>
        </details>
      </div>

      <div className="mt-5 space-y-3">
        <label className="block">
          <span className="micro">Ngày học gần nhất</span>
          <input
            type="date"
            value={progress?.last_studied_on ?? ''}
            disabled={busy}
            onChange={(event) => onSave({ last_studied_on: event.target.value || null })}
            className="field mt-1"
          />
        </label>
        <label className="block">
          <span className="micro">Ôn tiếp</span>
          <input
            type="date"
            value={progress?.next_review_on ?? ''}
            disabled={busy}
            onChange={(event) => onSave({ next_review_on: event.target.value || null })}
            className="field mt-1"
          />
        </label>
      </div>

      <p
        className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.75rem] ${
          timing.due
            ? 'bg-highlighter font-medium text-highlighter-ink'
            : 'border border-rule text-ink-soft'
        }`}
      >
        {timing.due ? 'Đến hạn' : 'Lịch ôn'} — {timing.label}
      </p>

      <dl className="mt-4 space-y-1 border-t border-rule pt-3 text-[0.75rem] leading-relaxed text-ink-soft">
        <div className="flex justify-between gap-3">
          <dt>Số lần đã ôn</dt>
          <dd className="tnum text-ink">{progress?.review_count ?? 0}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Ghi nhận gần nhất</dt>
          <dd className="text-right text-ink">
            {progress?.reviewed_at ? formatDateTime(progress.reviewed_at) : '—'}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Ngày học</dt>
          <dd className="text-right text-ink">{formatDay(progress?.last_studied_on ?? null)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Ôn tiếp</dt>
          <dd className="text-right text-ink">{formatDay(progress?.next_review_on ?? null)}</dd>
        </div>
      </dl>

      <p className="mt-3 text-[0.75rem] leading-relaxed text-ink-soft">
        Quy tắc gợi ý: Đang học ôn sau {REVIEW_AFTER_DAYS.learning} ngày, Cần ôn sau{' '}
        {REVIEW_AFTER_DAYS.needs_review} ngày, Đã nắm sau {REVIEW_AFTER_DAYS.mastered} ngày. Đổi trạng
        thái sẽ đặt lại ngày ôn tiếp; bạn vẫn sửa tay được bằng lịch chọn ngày.
      </p>

      {error && <p className="banner mt-3">{error}</p>}
    </section>
  )
}

/** Trạng thái nhãn dùng ở các chỗ chỉ đọc (danh sách, đầu trang chi tiết). */
export function GrammarStatusBadge({ status }: { status: GrammarStatus }) {
  const meta = GRAMMAR_STATUS_META[status]
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[0.8125rem] font-medium ring-1 ring-current/20 ring-inset ${meta.badge}`}
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current opacity-60" />
      {meta.label}
    </span>
  )
}
