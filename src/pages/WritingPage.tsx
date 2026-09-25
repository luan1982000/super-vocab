import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowClockwise, ArrowRight, ListBullets, PaperPlaneTilt, SpeakerHigh, Sparkle } from '@phosphor-icons/react'
import { Breadcrumb } from '../components/Breadcrumb'
import { CollectionBar } from '../components/CollectionBar'
import { FullPageSpinner } from '../components/FullPageSpinner'
import { useCollectionScope } from '../hooks/useCollectionScope'
import { collectionTone, scopeLabel, TONE_BG, type CollectionScope } from '../lib/collections'
import { formatDateTime } from '../lib/format'
import { loadPracticeSession } from '../lib/practice'
import { playPronunciation } from '../lib/pronounce'
import { gradeWriting, type WritingGrade } from '../lib/writing'
import type { CardRow } from '../lib/types'

/** Ôn bằng cách viết: đặt một câu với từ rồi để AI chấm điểm và chỉ lỗi. */
export function WritingPage() {
  const { collections, collectionsLoading, reloadCollections, collectionsError, scope, changeScope } =
    useCollectionScope()
  const [queue, setQueue] = useState<CardRow[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nextUpcoming, setNextUpcoming] = useState<{ due: string; count: number } | null>(null)
  const [sentence, setSentence] = useState('')
  const [grading, setGrading] = useState(false)
  const [grade, setGrade] = useState<WritingGrade | null>(null)
  const [scores, setScores] = useState<number[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const load = useCallback(async () => {
    if (collectionsLoading) return
    const session = await loadPracticeSession(scope)
    setQueue(session.cards)
    setError(session.error)
    setNextUpcoming(session.upcoming)
    setLoading(false)
  }, [scope, collectionsLoading])

  const resetSession = () => {
    setLoading(true)
    setError(null)
    setIndex(0)
    setSentence('')
    setGrade(null)
    setScores([])
    setNextUpcoming(null)
  }

  const restart = () => {
    resetSession()
    void load()
  }

  const onScopeChange = (next: CollectionScope) => {
    changeScope(next)
    resetSession()
  }

  useEffect(() => {
    // async IIFE: state chỉ được set sau `await`.
    void (async () => {
      await load()
    })()
  }, [load])

  const current = queue[index]
  const finished = queue.length > 0 && index >= queue.length

  const submit = useCallback(async () => {
    const text = sentence.trim()
    if (!current || !text || grading) return

    setGrading(true)
    setError(null)
    const { grade: result, error: gradeError } = await gradeWriting({ card: current, sentence: text })
    setGrading(false)

    if (gradeError || !result) {
      setError(gradeError ?? 'Không chấm được câu này.')
      return
    }
    setGrade(result)
    setScores((prev) => [...prev, result.score])
  }, [current, sentence, grading])

  const nextCard = () => {
    setGrade(null)
    setError(null)
    setSentence('')
    setIndex((prev) => prev + 1)
  }

  const collectionNameOf = (row: CardRow | undefined) =>
    row?.collection_id ? (collections.find((item) => item.id === row.collection_id)?.name ?? null) : null

  const header = (
    <div className="space-y-3">
      <Breadcrumb items={[{ label: 'Ôn tập', to: '/practice' }, { label: 'Viết câu' }]} />
      <CollectionBar
        collections={collections}
        scope={scope}
        onScopeChange={onScopeChange}
        onChanged={reloadCollections}
        error={collectionsError}
      />
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-10">
        {header}
        <FullPageSpinner label="Đang lấy thẻ đến hạn…" />
      </div>
    )
  }

  if (error && !current) {
    return (
      <div className="space-y-10">
        {header}
        <div className="banner">
          <p>Không tải được dữ liệu: {error}</p>
          <button type="button" onClick={restart} className="btn-text mt-2 font-medium text-ink underline">
            <ArrowClockwise aria-hidden size={16} />
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (queue.length === 0) {
    return (
      <div className="space-y-10">
        {header}
        <div className="panel mx-auto max-w-[30rem] px-7 py-9 text-center">
          <h1 className="font-serif text-[1.375rem] tracking-[-0.01em] text-ink">Hôm nay đã xong</h1>
          <p className="mt-2 text-sm text-ink-soft">Bộ: {scopeLabel(scope, collections)}</p>
          <p className="mt-3 text-sm text-ink">
            {nextUpcoming ? (
              <>
                Còn <strong className="tnum">{nextUpcoming.count}</strong> từ đến hạn. Gần nhất{' '}
                <span className="rounded-full bg-highlighter px-1.5 py-0.5 font-medium text-highlighter-ink">
                  {formatDateTime(nextUpcoming.due)}
                </span>
                .
              </>
            ) : (
              'Bộ này chưa có từ nào đến hạn. Thêm từ hoặc chọn bộ khác.'
            )}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link to="/vocab" className="btn btn-primary">
              <ListBullets aria-hidden size={16} />
              Quản lý từ vựng
            </Link>
            <button type="button" onClick={restart} className="btn btn-quiet">
              <ArrowClockwise aria-hidden size={16} />
              Tải lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (finished) {
    const average = scores.length > 0 ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0
    return (
      <div className="space-y-10">
        {header}
        <div className="panel mx-auto max-w-[30rem] px-7 py-9 text-center">
          <h1 className="font-serif text-[1.375rem] tracking-[-0.01em] text-ink">Hết câu trong phiên</h1>
          <p className="mt-3 text-sm text-ink">
            Đã viết <strong className="tnum">{scores.length}</strong> câu · điểm trung bình{' '}
            <strong className="tnum">{average}</strong>/100.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button type="button" onClick={restart} className="btn btn-primary">
              <ArrowClockwise aria-hidden size={16} />
              Viết lại từ đầu
            </button>
            <Link to="/vocab" className="btn btn-quiet">
              <ListBullets aria-hidden size={16} />
              Quản lý từ vựng
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const progress = (index / queue.length) * 100
  const scoreClass = grade ? (grade.score >= 80 ? 'text-accent' : grade.score >= 60 ? 'text-warn' : 'text-danger') : ''

  return (
    <div className="space-y-10">
      {header}

      <div className="mx-auto w-full max-w-[30rem] space-y-6">
        <div className="flex items-center gap-3">
          <span className="tnum text-[0.8125rem] text-ink-soft">
            {index + 1} / {queue.length}
          </span>
          <div className="h-[2px] flex-1 bg-line-strong">
            <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {current && (
          <>
            <div className="panel p-5">
              <div className="mb-3 flex items-center gap-2">
                <span
                  aria-hidden
                  className={
                    current.collection_id
                      ? `size-2.5 shrink-0 rounded-full ${TONE_BG[collectionTone(current.collection_id)]}`
                      : 'size-2.5 shrink-0 rounded-full border border-dashed border-line-strong'
                  }
                />
                <span className="micro">{collectionNameOf(current) ?? 'Chưa phân loại'}</span>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <p className="font-serif text-[clamp(1.75rem,6vw,2.5rem)] leading-[1.15] font-medium tracking-[-0.02em] break-words text-ink">
                  {current.word}
                </p>
                {current.phonetic && <span className="text-[0.9375rem] text-ink-soft">{current.phonetic}</span>}
                <button
                  type="button"
                  onClick={() => void playPronunciation(current.word, current.audio_url)}
                  aria-label={`Nghe ${current.word}`}
                  className="btn-text border border-line-strong px-2 py-0.5 text-[0.75rem]"
                >
                  <SpeakerHigh aria-hidden size={16} />
                  Nghe
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="micro mb-1">Nghĩa</p>
                  <p className="text-[1.0625rem] leading-[1.5] font-medium break-words text-ink">{current.meaning}</p>
                </div>
                {current.note && (
                  <div>
                    <p className="micro mb-1">Khái niệm</p>
                    <p className="max-w-[46ch] text-[0.9375rem] leading-[1.6] text-ink">{current.note}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="micro" htmlFor="writing-sentence">
                Viết một câu tiếng Anh có dùng từ “{current.word}”
              </label>
              <textarea
                id="writing-sentence"
                ref={textareaRef}
                value={sentence}
                onChange={(event) => setSentence(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                    event.preventDefault()
                    void submit()
                  }
                }}
                rows={4}
                maxLength={1000}
                disabled={grading || grade !== null}
                placeholder="Đặt câu của bạn…"
                className="field mt-2 resize-y"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <span className="text-[0.8125rem] text-ink-soft">⌘/Ctrl + Enter để chấm</span>
                <div className="flex items-center gap-2">
                  {grade === null && (
                    <button type="button" onClick={nextCard} disabled={grading} className="btn btn-quiet">
                      <ArrowRight aria-hidden size={16} />
                      Từ tiếp theo
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={grading || !sentence.trim() || grade !== null}
                    className="btn btn-primary"
                  >
                    <PaperPlaneTilt aria-hidden size={16} />
                    {grading ? 'Đang chấm…' : 'Chấm điểm'}
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="banner">{error}</div>}

            {grade && (
              <div className="panel space-y-5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="micro">Kết quả</p>
                    <p className={`font-serif text-[1.25rem] leading-tight ${scoreClass}`}>{grade.level || 'Nhận xét'}</p>
                  </div>
                  <p className="flex shrink-0 items-baseline gap-1">
                    <span className={`tnum font-serif text-[2rem] leading-none ${scoreClass}`}>{grade.score}</span>
                    <span className="tnum text-[0.8125rem] text-ink-soft">/100</span>
                  </p>
                </div>

                {!grade.usedWord && (
                  <div className="banner banner-warn">Câu chưa dùng từ “{current.word}”. Thử lại với từ mục tiêu nhé.</div>
                )}

                {grade.verdict && (
                  <p className="max-w-[46ch] text-[0.9375rem] leading-[1.6] text-ink">{grade.verdict}</p>
                )}

                {grade.errors.length > 0 && (
                  <div className="space-y-3">
                    <p className="micro">Lỗi cần sửa</p>
                    <ul className="space-y-3">
                      {grade.errors.map((item, itemIndex) => (
                        <li key={itemIndex} className="border-l-2 border-danger pl-3">
                          <p className="micro">{item.type}</p>
                          {item.excerpt && (
                            <p className="mt-1 font-serif text-[1rem] leading-[1.5] text-ink">{item.excerpt}</p>
                          )}
                          {item.explain && (
                            <p className="mt-1 text-[0.875rem] leading-[1.6] text-ink-soft">{item.explain}</p>
                          )}
                          {item.fix && (
                            <p className="mt-1 text-[0.875rem] leading-[1.6] text-ink">
                              Sửa: <span className="font-medium text-accent">{item.fix}</span>
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {grade.corrected && (
                  <div>
                    <p className="micro mb-1.5">Câu đúng</p>
                    <p className="max-w-[46ch] font-serif text-[1.0625rem] leading-[1.7] text-ink">{grade.corrected}</p>
                  </div>
                )}

                {grade.alternatives.length > 0 && (
                  <div>
                    <p className="micro mb-1.5">Có thể viết</p>
                    <ul className="max-w-[46ch] space-y-1.5 font-serif text-[1.0625rem] leading-[1.7] text-ink-soft">
                      {grade.alternatives.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {grade.tip && (
                  <p className="border-t border-rule pt-3 text-[0.875rem] leading-[1.6] text-ink-soft">
                    <Sparkle aria-hidden size={16} className="mr-1 inline align-[-3px] text-accent" />
                    {grade.tip}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={nextCard} className="btn btn-primary">
                    <ArrowRight aria-hidden size={16} />
                    Từ tiếp theo
                  </button>
                  <button type="button" onClick={() => setGrade(null)} className="btn btn-quiet">
                    Viết lại
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
