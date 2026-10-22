import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowClockwise,
  CheckCircle,
  Clock,
  MagnifyingGlass,
  Notebook,
} from '@phosphor-icons/react'
import { FilterChip } from '../components/FilterChip'
import { FullPageSpinner } from '../components/FullPageSpinner'
import { GrammarStatusBadge } from '../components/GrammarProgressPanel'
import { MasteryDots } from '../components/MasteryDots'
import { useGrammar } from '../hooks/useGrammar'
import {
  GRAMMAR_STAGES,
  GRAMMAR_STAGE_TITLES,
  GRAMMAR_STAGE_TONES,
  GRAMMAR_STATUSES,
  GRAMMAR_STATUS_META,
  formatDay,
  isDue,
  reviewedPatch,
  reviewTiming,
} from '../lib/grammar'
import type { GrammarStatus, GrammarTopic } from '../lib/types'

type StatusFilter = 'all' | 'due' | GrammarStatus

/** Danh sách 49 chủ đề, nhóm theo giai đoạn; trạng thái và lịch ôn lưu theo user. */
export function GrammarListPage() {
  const { topics, loading, error, today, reload, saveProgress } = useGrammar()
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      all: topics.length,
      due: 0,
      not_started: 0,
      learning: 0,
      needs_review: 0,
      mastered: 0,
    }
    for (const topic of topics) {
      result[topic.progress?.status ?? 'not_started'] += 1
      if (isDue(topic, today)) result.due += 1
    }
    return result
  }, [topics, today])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return topics.filter((topic) => {
      if (filter === 'due') {
        if (!isDue(topic, today)) return false
      } else if (filter !== 'all' && (topic.progress?.status ?? 'not_started') !== filter) {
        return false
      }
      if (!query) return true
      return [topic.title, topic.title_en ?? '', topic.summary].some((value) =>
        value.toLowerCase().includes(query),
      )
    })
  }, [topics, filter, search, today])

  const groups = GRAMMAR_STAGES.map((stage) => ({
    stage,
    title: GRAMMAR_STAGE_TITLES[stage],
    rows: filtered.filter((topic) => topic.stage === stage),
    total: topics.filter((topic) => topic.stage === stage).length,
    mastered: topics.filter((topic) => topic.stage === stage && topic.progress?.status === 'mastered').length,
  })).filter((group) => group.rows.length > 0)

  const masteredCount = counts.mastered
  const progressPercent = topics.length === 0 ? 0 : Math.round((masteredCount / topics.length) * 100)

  const handleReview = async (topic: GrammarTopic) => {
    setSavingId(topic.id)
    setActionError(null)
    setNotice(null)
    const patch = reviewedPatch(topic.progress, today)
    const saveError = await saveProgress(topic.id, patch)
    setSavingId(null)
    if (saveError) {
      setActionError(`Không lưu được tiến độ: ${saveError}`)
      return
    }
    setNotice(`Đã ghi nhận ôn “${topic.title}”. Ôn tiếp ${formatDay(patch.next_review_on ?? null)}.`)
  }

  const filterOptions: {
    value: StatusFilter
    label: string
    dotClass?: string
    activeClass?: string
    idleClass?: string
  }[] = [
    { value: 'all', label: 'Tất cả' },
    {
      value: 'due',
      label: 'Đến hạn',
      dotClass: 'bg-warn',
      activeClass: 'border-highlighter bg-highlighter font-medium text-highlighter-ink',
      idleClass: 'border-warn/70 bg-warn/25 text-warn hover:border-warn hover:bg-warn/30',
    },
    ...GRAMMAR_STATUSES.map((status) => ({
      value: status,
      label: GRAMMAR_STATUS_META[status].label,
      dotClass: GRAMMAR_STATUS_META[status].dot,
      activeClass: `${GRAMMAR_STATUS_META[status].solid} font-medium`,
      idleClass: GRAMMAR_STATUS_META[status].chipIdle,
    })),
  ]

  const segments = [
    { key: 'mastered', label: 'Đã nắm', count: counts.mastered, className: 'bg-accent' },
    { key: 'needs_review', label: 'Cần ôn', count: counts.needs_review, className: 'bg-warn' },
    { key: 'learning', label: 'Đang học', count: counts.learning, className: 'bg-cool' },
  ]
  const totalForBar = topics.length || 1

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <h1 className="font-serif text-[1.375rem] tracking-[-0.01em] text-ink">
            Ngữ pháp
            <span className="tnum ml-2 text-[0.8125rem] font-normal text-ink-soft">
              {topics.length} chủ đề
            </span>
          </h1>
          <p className="mt-1 max-w-[46ch] text-sm leading-relaxed text-ink-soft">
            Học theo từng chủ đề, tự đánh giá mức nắm và để lịch ôn nhắc lại sau 3 ngày hoặc 1 tuần.
          </p>
        </div>
        <div className="relative ml-auto w-full sm:w-72">
          <MagnifyingGlass
            aria-hidden
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm chủ đề ngữ pháp"
            className="field pl-9"
          />
        </div>
      </div>

      {loading ? (
        <FullPageSpinner label="Đang tải ngữ pháp…" />
      ) : error ? (
        <div className="banner flex flex-wrap items-center gap-3">
          <span>Không tải được dữ liệu: {error}</span>
          <button type="button" onClick={() => void reload()} className="btn-text font-medium text-ink underline">
            <ArrowClockwise aria-hidden size={16} />
            Thử lại
          </button>
        </div>
      ) : (
        <>
          <section
            className="panel relative flex flex-wrap items-center gap-x-4 gap-y-4 overflow-hidden px-4 py-4 sm:px-5"
            aria-labelledby="grammar-today-title"
          >
            <span aria-hidden className="absolute inset-x-0 top-0 flex h-1">
              <span className="flex-1 bg-tab-slate" />
              <span className="flex-1 bg-cool" />
              <span className="flex-1 bg-warn" />
              <span className="flex-1 bg-accent" />
            </span>
            <span
              aria-hidden
              className={`flex size-11 shrink-0 items-center justify-center rounded-ui ${
                counts.due > 0 ? 'bg-warn text-on-accent' : 'bg-accent text-on-accent'
              }`}
            >
              <Clock size={22} />
            </span>

            <div className="min-w-0 flex-1">
              <span className="micro" id="grammar-today-title">
                Hôm nay
              </span>
              <p className="mt-1 font-serif text-[1.125rem] tracking-[-0.01em] text-ink">
                {counts.due > 0 ? `${counts.due} chủ đề đến hạn` : 'Không có chủ đề đến hạn'}
              </p>
              <p className="mt-0.5 text-[0.8125rem] text-ink-soft">
                Đã nắm <span className="font-medium text-accent">{masteredCount}</span>/{topics.length} chủ
                đề
                {counts.needs_review > 0 && (
                  <>
                    , <span className="font-medium text-warn">{counts.needs_review}</span> cần ôn
                  </>
                )}
                .
              </p>
            </div>

            <div className="w-full sm:w-72">
              <div className="flex items-baseline justify-between gap-3 text-[0.75rem] text-ink-soft">
                <span>Tiến độ nắm</span>
                <span className="tnum">{progressPercent}%</span>
              </div>
              <div
                role="img"
                aria-label={`Tiến độ: ${counts.mastered} đã nắm, ${counts.needs_review} cần ôn, ${counts.learning} đang học, ${counts.not_started} chưa học`}
                className="mt-1 flex h-2 overflow-hidden rounded-full bg-rule"
              >
                {segments.map((segment) =>
                  segment.count > 0 ? (
                    <span
                      key={segment.key}
                      title={`${segment.label}: ${segment.count}`}
                      className={`h-full ${segment.className}`}
                      style={{ width: `${(segment.count / totalForBar) * 100}%` }}
                    />
                  ) : null,
                )}
              </div>
              {counts.due > 0 && (
                <button
                  type="button"
                  onClick={() => setFilter('due')}
                  className="btn-text mt-2 px-0 text-accent"
                >
                  Xem {counts.due} chủ đề đến hạn
                </button>
              )}
            </div>
          </section>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="micro mr-1">Trạng thái</span>
              {filterOptions.map((option) => (
                <FilterChip
                  key={option.value}
                  active={filter === option.value}
                  onClick={() => setFilter(option.value)}
                  count={counts[option.value]}
                  dotClass={option.dotClass}
                  activeClass={option.activeClass}
                  idleClass={option.idleClass}
                >
                  {option.label}
                </FilterChip>
              ))}
            </div>

            {notice && (
              <p className="notice" role="status">
                <CheckCircle aria-hidden size={16} className="mt-0.5 shrink-0 text-accent" />
                {notice}
              </p>
            )}
            {actionError && <p className="banner">{actionError}</p>}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-ui border border-dashed border-line-strong px-6 py-16 text-center">
              <Notebook aria-hidden size={28} className="text-ink-soft" />
              <p className="text-sm leading-relaxed text-ink-soft">
                {search.trim()
                  ? `Không có chủ đề nào khớp “${search.trim()}”.`
                  : filter === 'due'
                    ? 'Hôm nay không có chủ đề đến hạn.'
                    : 'Không có chủ đề trong nhóm này.'}
              </p>
              {(filter !== 'all' || search.trim()) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilter('all')
                    setSearch('')
                  }}
                  className="btn btn-quiet"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {groups.map((group) => (
                <section key={group.stage} aria-labelledby={`grammar-stage-${group.stage}`}>
                  <div
                    className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-ui border-l-4 px-3 py-2 ${GRAMMAR_STAGE_TONES[group.stage].header} ${GRAMMAR_STAGE_TONES[group.stage].bar}`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        aria-hidden
                        className={`tnum flex size-8 shrink-0 items-center justify-center rounded-ui text-[0.875rem] font-semibold ${GRAMMAR_STAGE_TONES[group.stage].tile}`}
                      >
                        {group.stage}
                      </span>
                      <h2
                        id={`grammar-stage-${group.stage}`}
                        className="font-serif text-[1rem] font-medium tracking-[-0.01em] text-ink"
                      >
                        Giai đoạn {group.stage} — {group.title}
                      </h2>
                    </div>
                    <span className="tnum ml-auto text-[0.8125rem] text-ink-soft">
                      <span className="font-medium text-accent">{group.mastered}</span>/{group.total} đã nắm
                    </span>
                  </div>

                  <ul className="list-none">
                    {group.rows.map((topic) => (
                      <GrammarListRow
                        key={topic.id}
                        topic={topic}
                        today={today}
                        saving={savingId === topic.id}
                        onReview={() => void handleReview(topic)}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function GrammarListRow({
  topic,
  today,
  saving,
  onReview,
}: {
  topic: GrammarTopic
  today: string
  saving: boolean
  onReview: () => void
}) {
  const status = topic.progress?.status ?? 'not_started'
  const timing = reviewTiming(topic.progress?.next_review_on ?? null, today)
  const mastery = topic.progress?.mastery ?? null

  return (
    <li className="flex flex-col gap-3 border-b border-rule py-4 sm:flex-row sm:items-start sm:gap-5">
      <Link
        to={`/grammar/${topic.slug}`}
        className="group block min-w-0 flex-1"
        aria-label={`Mở chủ đề ${topic.title}`}
      >
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <GrammarStatusBadge status={status} />
          {topic.is_new && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-tab-rose px-2.5 py-1 text-[0.8125rem] font-medium text-highlighter-ink">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-highlighter-ink/60" />
              Mới
            </span>
          )}
          <span className="font-serif text-[1.0625rem] leading-snug font-medium tracking-[-0.01em] text-ink decoration-rule underline-offset-4 group-hover:underline">
            {topic.title}
          </span>
          {topic.title_en && topic.title_en.trim().toLowerCase() !== topic.title.trim().toLowerCase() && (
            <span className="text-[0.75rem] text-ink-soft">{topic.title_en}</span>
          )}
        </span>

        <span className="mt-1 line-clamp-2 max-w-[65ch] text-sm leading-relaxed text-ink-soft">
          {topic.summary}
        </span>

        <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.75rem] text-ink-soft">
          <span>
            Đã ôn{' '}
            <span className="tnum font-medium text-ink">
              {formatDay(topic.progress?.last_studied_on ?? null)}
            </span>
          </span>

          <span
            className={
              timing.due
                ? 'inline-flex items-center gap-1.5 rounded-full bg-highlighter px-2 py-0.5 font-medium text-highlighter-ink'
                : 'inline-flex items-center gap-1.5'
            }
          >
            Ôn tiếp{' '}
            <span className="tnum font-medium">
              {formatDay(topic.progress?.next_review_on ?? null)}
            </span>
            <span>{timing.label}</span>
          </span>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-1.5 py-0.5 ${
              mastery !== null ? 'bg-accent/10 text-accent' : 'text-ink-soft'
            }`}
          >
            Mức nắm <MasteryDots value={mastery} />
            <span className="tnum font-medium">{mastery ?? '—'}/5</span>
          </span>
        </span>
      </Link>

      <div className="shrink-0 sm:pt-5">
        <button
          type="button"
          onClick={onReview}
          disabled={saving}
          title="Ghi ngày học hôm nay và tính ngày ôn tiếp"
          className="btn w-full border border-accent/40 bg-accent/15 text-accent hover:border-accent hover:bg-accent hover:text-on-accent sm:w-auto"
        >
          <CheckCircle aria-hidden size={16} />
          {saving ? 'Đang lưu…' : 'Đã ôn'}
        </button>
      </div>
    </li>
  )
}
