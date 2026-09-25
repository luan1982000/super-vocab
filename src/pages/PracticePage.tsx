import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Cards, PencilLine } from '@phosphor-icons/react'
import { CollectionBar } from '../components/CollectionBar'
import { useCollectionScope } from '../hooks/useCollectionScope'
import { countDue } from '../lib/practice'

/** Hai chế độ ôn. Cả hai lấy thẻ từ cùng một phạm vi bộ từ. */
const MODES = [
  {
    to: '/practice/flashcard',
    icon: Cards,
    title: 'Flashcard',
    description: 'Lật thẻ và tự chấm mức độ nhớ — lịch ôn cập nhật theo FSRS.',
  },
  {
    to: '/practice/writing',
    icon: PencilLine,
    title: 'Viết câu',
    description: 'Đặt một câu với từ, AI chấm điểm và chỉ ra lỗi sai.',
  },
] as const

export function PracticePage() {
  const { collections, collectionsLoading, reloadCollections, collectionsError, scope, changeScope } =
    useCollectionScope()
  const [due, setDue] = useState<number | null>(null)

  useEffect(() => {
    if (collectionsLoading) return
    let active = true
    // async IIFE: state chỉ được set sau `await`.
    void (async () => {
      const next = await countDue(scope)
      if (active) setDue(next)
    })()
    return () => {
      active = false
    }
  }, [scope, collectionsLoading])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-[1.375rem] tracking-[-0.01em] text-ink">Ôn tập</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Chọn cách ôn. Cả hai dùng chung bộ từ bên dưới.
          {due !== null && due > 0 && (
            <>
              {' '}
              Hôm nay còn <strong className="tnum text-ink">{due}</strong> thẻ đến hạn.
            </>
          )}
        </p>
      </div>

      <CollectionBar
        collections={collections}
        scope={scope}
        onScopeChange={changeScope}
        onChanged={reloadCollections}
        error={collectionsError}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {MODES.map((mode) => (
          <Link
            key={mode.to}
            to={mode.to}
            className="panel flex min-h-[9.5rem] flex-col gap-3 p-5 transition-colors hover:bg-hover"
          >
            <span className="flex items-center gap-2">
              <mode.icon aria-hidden size={18} className="text-accent" />
              <span className="font-serif text-[1.125rem] tracking-[-0.01em] text-ink">{mode.title}</span>
            </span>
            <span className="text-sm leading-relaxed text-ink-soft">{mode.description}</span>
            <span className="mt-auto flex items-center gap-1.5 text-sm font-medium text-accent">
              Bắt đầu
              <ArrowRight aria-hidden size={16} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
