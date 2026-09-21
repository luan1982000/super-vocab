import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Grade } from 'ts-fsrs'
import { CollectionBar } from '../components/CollectionBar'
import { FlashCard } from '../components/FlashCard'
import { FullPageSpinner } from '../components/FullPageSpinner'
import { useCollections } from '../hooks/useCollections'
import { SCOPE_ALL, SCOPE_NONE, scopeFilter, scopeLabel, type CollectionScope } from '../lib/collections'
import { GRADES, schedule, toCardUpdate } from '../lib/fsrs'
import { formatDateTime, formatInterval } from '../lib/format'
import { supabase } from '../lib/supabase'
import type { CardRow } from '../lib/types'

const SESSION_LIMIT = 30
const SCOPE_KEY = 'super-vocab.scope'

const primaryClass =
  'rounded-md bg-pen px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90'
const quietClass =
  'rounded-md border border-line-strong px-4 py-2 text-sm font-medium text-ink transition hover:bg-paper'

export function PracticePage() {
  const { collections, loading: collectionsLoading, reload: reloadCollections, error: collectionsError } = useCollections()
  const [storedScope, setStoredScope] = useState<CollectionScope>(() => localStorage.getItem(SCOPE_KEY) || SCOPE_ALL)
  const [queue, setQueue] = useState<CardRow[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [saving, setSaving] = useState(false)
  const [grades, setGrades] = useState<Record<number, number>>({})
  const [nextUpcoming, setNextUpcoming] = useState<{ due: string; count: number } | null>(null)

  // Bộ đã lưu có thể đã bị xoá ở phiên trước → coi như "Tất cả" thay vì lọc vào id chết.
  const scopeIsCollection = storedScope !== SCOPE_ALL && storedScope !== SCOPE_NONE
  const scope =
    scopeIsCollection && !collectionsLoading && !collections.some((item) => item.id === storedScope)
      ? SCOPE_ALL
      : storedScope

  // Chỉ ôn các từ nằm trong bộ đang chọn.
  const load = useCallback(async () => {
    if (collectionsLoading) return

    const nowIso = new Date().toISOString()
    const filter = scopeFilter(scope)

    let dueQuery = supabase
      .from('cards')
      .select('*')
      .lte('due', nowIso)
    if (filter) dueQuery = dueQuery.or(filter)
    const { data, error: dueError } = await dueQuery.order('due', { ascending: true }).limit(SESSION_LIMIT)

    if (dueError) {
      setError(dueError.message)
      setQueue([])
      setLoading(false)
      return
    }

    setQueue(data ?? [])
    setLoading(false)

    if ((data ?? []).length === 0) {
      let upcomingQuery = supabase
        .from('cards')
        .select('due')
        .gt('due', nowIso)
      if (filter) upcomingQuery = upcomingQuery.or(filter)
      const { data: upcoming } = await upcomingQuery.order('due', { ascending: true }).limit(1)

      let countQuery = supabase.from('cards').select('id', { count: 'exact', head: true }).gte('due', nowIso)
      if (filter) countQuery = countQuery.or(filter)
      const { count } = await countQuery

      if (upcoming?.[0]) setNextUpcoming({ due: upcoming[0].due, count: count ?? 0 })
    }
  }, [scope, collectionsLoading])

  const resetSession = () => {
    setLoading(true)
    setError(null)
    setFlipped(false)
    setIndex(0)
    setGrades({})
    setNextUpcoming(null)
  }

  const restart = () => {
    resetSession()
    void load()
  }

  const changeScope = (next: CollectionScope) => {
    localStorage.setItem(SCOPE_KEY, next)
    setStoredScope(next)
    resetSession()
  }

  useEffect(() => {
    // async IIFE: state chỉ được set sau `await` (react/set-state-in-effect).
    void (async () => {
      await load()
    })()
  }, [load])

  const current = queue[index]
  const finished = queue.length > 0 && index >= queue.length

  // Tính trước lịch của cả 4 mức chấm cho card hiện tại: dùng chính kết quả này để ghi DB.
  const preview = useMemo(() => {
    if (!current) return null
    const now = new Date()
    return { now, options: schedule(current, now) }
  }, [current])

  const grade = useCallback(
    async (rating: Grade) => {
      const item = preview?.options[rating]
      if (!current || !item || saving) return

      setSaving(true)
      setError(null)
      const { error: updateError } = await supabase
        .from('cards')
        .update(toCardUpdate(item.card))
        .eq('id', current.id)
      setSaving(false)

      if (updateError) {
        // Không chuyển thẻ khi update thất bại — người dùng chấm lại.
        setError('Chưa lưu được. Thẻ vẫn ở đây, chấm lại giúp.')
        return
      }

      setGrades((prev) => ({ ...prev, [rating]: (prev[rating] ?? 0) + 1 }))
      setFlipped(false)
      setIndex((prev) => prev + 1)
    },
    [current, preview, saving],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return

      if (event.code === 'Space') {
        event.preventDefault()
        setFlipped((prev) => !prev)
        return
      }

      if (!flipped || !current || saving) return
      const option = GRADES[Number(event.key) - 1]
      if (option) {
        event.preventDefault()
        void grade(option.rating)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [flipped, current, saving, grade])

  const currentScope = scopeLabel(scope, collections)
  const collectionNameOf = (row: CardRow | undefined) =>
    row?.collection_id ? (collections.find((item) => item.id === row.collection_id)?.name ?? null) : null

  const header = (
    <CollectionBar
      collections={collections}
      scope={scope}
      onScopeChange={changeScope}
      onChanged={reloadCollections}
      error={collectionsError}
    />
  )

  if (loading) {
    return (
      <div className="space-y-4">
        {header}
        <FullPageSpinner label="Đang lấy thẻ đến hạn…" />
      </div>
    )
  }

  if (error && !current) {
    return (
      <div className="space-y-4">
        {header}
        <div className="border-l-[3px] border-red-pen bg-red-pen/8 px-3 py-2 text-sm text-ink">
          <p>Không tải được dữ liệu: {error}</p>
          <button type="button" onClick={restart} className="mt-2 font-semibold underline">
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (queue.length === 0) {
    return (
      <div className="space-y-4">
        {header}
        <div className="mx-auto max-w-[30rem] rounded-md border border-rule bg-card p-6 text-center shadow-[var(--stack-shadow)]">
          <h1 className="font-serif text-[1.5rem] font-semibold text-ink">Hôm nay đã xong</h1>
          <p className="mt-2 text-sm text-ink-soft">Bộ: {currentScope}</p>
          <p className="mt-3 text-sm text-ink">
            {nextUpcoming ? (
              <>
                Còn <strong className="tnum">{nextUpcoming.count}</strong> từ đến hạn. Gần nhất{' '}
                <span className="rounded-sm bg-highlighter px-1.5 py-0.5 font-medium text-highlighter-ink">
                  {formatDateTime(nextUpcoming.due)}
                </span>
                .
              </>
            ) : (
              'Bộ này chưa có từ nào đến hạn. Thêm từ hoặc chọn bộ khác.'
            )}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link to="/vocab" className={primaryClass}>
              Quản lý từ vựng
            </Link>
            <button type="button" onClick={restart} className={quietClass}>
              Tải lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (finished) {
    const total = Object.values(grades).reduce((sum, value) => sum + value, 0)
    return (
      <div className="space-y-4">
        {header}
        <div className="mx-auto max-w-[30rem] rounded-md border border-rule bg-card p-6 text-center shadow-[var(--stack-shadow)]">
          <h1 className="font-serif text-[1.5rem] font-semibold text-ink">Hết thẻ trong bộ</h1>
          <p className="mt-2 text-sm text-ink-soft">Bộ: {currentScope}</p>
          <p className="mt-1 text-sm text-ink">
            Đã chấm <strong className="tnum">{total}</strong> thẻ.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GRADES.map((option) => (
              <div key={option.rating} className="rounded-md border border-rule px-3 py-2">
                <p className="text-[0.8125rem] text-ink-soft">{option.label}</p>
                <p className="tnum text-[1.5rem] leading-tight font-semibold text-ink">
                  {grades[option.rating] ?? 0}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-center gap-2">
            <button type="button" onClick={restart} className={primaryClass}>
              Ôn lại từ đầu
            </button>
            <Link to="/vocab" className={quietClass}>
              Quản lý từ vựng
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const progress = ((index + (flipped ? 0.5 : 0)) / queue.length) * 100

  return (
    <div className="space-y-5">
      {header}

      <div className="mx-auto w-full max-w-[30rem] space-y-5">
        <div className="flex items-center gap-3">
          <span className="tnum text-sm font-medium text-ink-soft">
            {index + 1} / {queue.length}
          </span>
          <div className="h-[3px] flex-1 rounded-full bg-rule">
            <div className="h-full rounded-full bg-pen" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {current && preview && (
          <>
            <FlashCard
              card={current}
              collectionName={collectionNameOf(current)}
              flipped={flipped}
              onFlip={() => setFlipped((prev) => !prev)}
            />

            {error && (
              <div className="border-l-[3px] border-red-pen bg-red-pen/8 px-3 py-2 text-sm text-ink">{error}</div>
            )}

            {flipped ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {GRADES.map((option) => (
                  <button
                    key={option.rating}
                    type="button"
                    disabled={saving}
                    onClick={() => void grade(option.rating)}
                    className={`rounded-md border border-t-[3px] border-line-strong bg-card px-3 py-3 text-left transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-55 ${option.edge}`}
                  >
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-[0.9375rem] font-semibold text-ink">{option.label}</span>
                      <span className="tnum text-[0.75rem] text-ink-soft">{option.hotkey}</span>
                    </span>
                    <span className="mt-2 inline-block rounded-sm bg-highlighter px-1.5 py-0.5 text-[0.9375rem] font-semibold text-highlighter-ink">
                      {formatInterval(preview.now, preview.options[option.rating].card.due)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setFlipped(true)}
                className="w-full rounded-md bg-pen px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Hiện nghĩa
              </button>
            )}

            <p className="text-center text-[0.8125rem] text-ink-soft">
              Space để lật thẻ. Phím 1–4 để chấm.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
