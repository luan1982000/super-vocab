import { PencilSimple, SpeakerHigh, Trash } from '@phosphor-icons/react'
import { collectionTone, TONE_BG } from '../lib/collections'
import { formatDateTime, formatDueRelative, STATE_LABELS, STATE_TONES } from '../lib/format'
import { playPronunciation } from '../lib/pronounce'
import type { CardRow, CollectionRow } from '../lib/types'

interface VocabTableProps {
  rows: CardRow[]
  collections: CollectionRow[]
  /** Mốc thời gian lấy lúc nạp dữ liệu (không gọi Date.now() trong render). */
  now: number
  onEdit: (row: CardRow) => void
  onDelete: (row: CardRow) => void
}

const headClass = 'py-3 pr-4 micro md:table-cell'
const cellClass = 'mt-1.5 block md:mt-0 md:table-cell md:py-4 md:pr-4'

export function VocabTable({ rows, collections, now, onEdit, onDelete }: VocabTableProps) {
  const names = new Map(collections.map((collection) => [collection.id, collection.name]))

  return (
    <table className="block w-full border-collapse text-left md:table">
      <thead className="hidden md:table-header-group">
        <tr className="border-b border-rule">
          <th className={headClass}>Từ</th>
          <th className={headClass}>Nghĩa</th>
          {collections.length > 0 && <th className={headClass}>Bộ từ</th>}
          <th className={headClass}>Ôn tiếp theo</th>
          <th className={headClass}>Trạng thái</th>
          <th className={`${headClass} pr-0 text-right`}>Thao tác</th>
        </tr>
      </thead>

      <tbody className="block md:table-row-group">
        {rows.map((row) => {
          const overdue = now > 0 && new Date(row.due).getTime() <= now
          return (
            <tr key={row.id} className="block border-b border-rule py-3 align-top md:table-row md:py-0">
              <td className={`${cellClass} pr-0 md:pr-4`}>
                <span className="flex items-baseline gap-2">
                  <span className="font-serif text-[1.0625rem] leading-[1.4] text-ink">
                    {row.word}
                  </span>
                  <button
                    type="button"
                    onClick={() => void playPronunciation(row.word, row.audio_url)}
                    aria-label={`Nghe ${row.word}`}
                    className="btn-text shrink-0 border border-line-strong px-2 py-0.5 text-[0.75rem]"
                  >
                    <SpeakerHigh aria-hidden size={16} />
                    Nghe
                  </button>
                </span>
                {row.phonetic && (
                  <span className="mt-1 block text-[0.8125rem] text-ink-soft">{row.phonetic}</span>
                )}
              </td>

              <td className={`${cellClass} max-w-[46ch] text-[0.9375rem] leading-relaxed text-ink`}>
                {row.meaning}
                {row.example && (
                  <span className="mt-1 block font-serif text-[0.9375rem] leading-[1.7] text-ink-soft">
                    {row.example}
                  </span>
                )}
              </td>

              {collections.length > 0 && (
                <td className={`${cellClass} text-[0.9375rem] text-ink`}>
                  {row.collection_id ? (
                    <span>
                      <span
                        aria-hidden
                        className={`mr-2 inline-block size-2.5 rounded-full align-middle ${TONE_BG[collectionTone(row.collection_id)]}`}
                      />
                      {names.get(row.collection_id) ?? '—'}
                    </span>
                  ) : (
                    <span className="text-ink-soft">Chưa phân loại</span>
                  )}
                </td>
              )}

              <td className={`${cellClass} whitespace-nowrap`}>
                <span
                  className={`text-[0.9375rem] ${overdue ? 'rounded-full bg-highlighter px-1.5 py-0.5 text-highlighter-ink' : 'text-ink'}`}
                >
                  {overdue ? formatDueRelative(row.due) : formatDateTime(row.due)}
                </span>
                {overdue && <span className="mt-0.5 block text-[0.8125rem] text-ink-soft">{formatDateTime(row.due)}</span>}
              </td>

              <td className={`${cellClass} whitespace-nowrap`}>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[0.8125rem] font-medium ${
                    STATE_TONES[row.state] ?? ''
                  }`}
                >
                  {STATE_LABELS[row.state] ?? `#${row.state}`}
                </span>
              </td>

              <td className={`${cellClass} pr-0 whitespace-nowrap md:text-right`}>
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  className="btn-text"
                >
                  <PencilSimple aria-hidden size={16} />
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(row)}
                  className="btn-text hover:text-danger"
                >
                  <Trash aria-hidden size={16} />
                  Xóa
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
