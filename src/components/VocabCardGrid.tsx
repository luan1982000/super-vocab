import { Clock, PencilSimple, SpeakerHigh, Trash } from '@phosphor-icons/react'
import { collectionTone, TONE_BG } from '../lib/collections'
import { formatDateTime, formatDueRelative, STATE_LABELS, STATE_TONES } from '../lib/format'
import { playPronunciation } from '../lib/pronounce'
import type { CardRow, CollectionRow } from '../lib/types'

interface VocabCardGridProps {
  rows: CardRow[]
  collections: CollectionRow[]
  /** Mốc thời gian lấy lúc nạp dữ liệu (không gọi Date.now() trong render). */
  now: number
  onEdit: (row: CardRow) => void
  onDelete: (row: CardRow) => void
}

export function VocabCardGrid({ rows, collections, now, onEdit, onDelete }: VocabCardGridProps) {
  const names = Object.fromEntries(collections.map((collection) => [collection.id, collection.name])) as Record<
    string,
    string
  >

  return (
    <ul className="grid list-none grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
      {rows.map((row) => (
        <li key={row.id} className="min-w-0">
          <VocabCard
            row={row}
            collectionName={row.collection_id ? (names[row.collection_id] ?? '—') : null}
            now={now}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  )
}

interface VocabCardProps {
  row: CardRow
  collectionName: string | null
  now: number
  onEdit: (row: CardRow) => void
  onDelete: (row: CardRow) => void
}

function VocabCard({ row, collectionName, now, onEdit, onDelete }: VocabCardProps) {
  const overdue = now > 0 && new Date(row.due).getTime() <= now
  const dueLabel = now > 0 ? formatDueRelative(row.due, new Date(now)) : formatDateTime(row.due)
  const dueTitle = `Ôn tiếp theo: ${formatDateTime(row.due)}`

  return (
    <article
      aria-labelledby={`vocab-word-${row.id}`}
      className="panel group flex h-full flex-col transition-colors duration-150 hover:border-line-strong focus-within:border-line-strong"
    >
      <div className="flex items-center gap-2 px-4 pt-3">
        <span
          aria-hidden
          className={
            row.collection_id
              ? `size-2 shrink-0 rounded-full ${TONE_BG[collectionTone(row.collection_id)]}`
              : 'size-2 shrink-0 rounded-full border border-dashed border-line-strong'
          }
        />
        <span className="min-w-0 truncate text-[0.75rem] font-medium text-ink-soft">
          {collectionName ?? 'Chưa phân loại'}
        </span>
        <span
          className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[0.75rem] font-medium ${
            STATE_TONES[row.state] ?? ''
          }`}
        >
          {STATE_LABELS[row.state] ?? `#${row.state}`}
        </span>
      </div>

      <div className="flex items-start justify-between gap-3 px-4 pt-2.5">
        <div className="min-w-0">
          <h2
            id={`vocab-word-${row.id}`}
            className="font-serif text-[1.25rem] leading-[1.3] font-medium tracking-[-0.01em] break-words text-ink"
          >
            {row.word}
          </h2>
          {row.phonetic && (
            <p className="mt-0.5 font-serif text-[0.875rem] leading-snug text-ink-soft">{row.phonetic}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void playPronunciation(row.word, row.audio_url)}
          aria-label={`Nghe ${row.word}`}
          title="Nghe phát âm"
          className="btn-text -mr-1.5 shrink-0 border border-line-strong px-2 py-1 text-[0.75rem] hover:border-ink-soft"
        >
          <SpeakerHigh aria-hidden size={15} />
          Nghe
        </button>
      </div>

      <div className="flex-1 px-4 pt-2.5 pb-4">
        <p className="text-[0.9375rem] leading-[1.55] break-words text-ink">{row.meaning}</p>
        {row.example && (
          <p className="mt-1.5 border-l-2 border-rule pl-2.5 font-serif text-[0.875rem] leading-[1.65] break-words text-ink-soft">
            {row.example}
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-rule px-4 py-2">
        <span
          title={dueTitle}
          className={`inline-flex items-center gap-1.5 text-[0.75rem] ${
            overdue ? 'rounded-full bg-highlighter px-2 py-0.5 font-medium text-highlighter-ink' : 'text-ink-soft'
          }`}
        >
          <Clock aria-hidden size={14} />
          {dueLabel}
        </span>

        <div className="-mr-2 ml-auto flex items-center gap-0.5">
          <button type="button" onClick={() => onEdit(row)} className="btn-text px-2">
            <PencilSimple aria-hidden size={15} />
            Sửa
          </button>
          <button type="button" onClick={() => onDelete(row)} className="btn-text px-2 hover:text-danger">
            <Trash aria-hidden size={15} />
            Xóa
          </button>
        </div>
      </div>
    </article>
  )
}
