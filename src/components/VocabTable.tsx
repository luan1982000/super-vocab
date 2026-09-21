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

const headClass = 'py-2 pr-4 text-[0.8125rem] font-medium text-ink-soft'
const cellClass = 'mt-1 block sm:mt-0 sm:table-cell sm:py-3 sm:pr-4'

export function VocabTable({ rows, collections, now, onEdit, onDelete }: VocabTableProps) {
  const names = new Map(collections.map((collection) => [collection.id, collection.name]))

  return (
    <table className="block w-full border-collapse text-left sm:table">
      <thead className="hidden sm:table-header-group">
        <tr className="border-b border-rule">
          <th className={headClass}>Từ</th>
          <th className={headClass}>Nghĩa</th>
          {collections.length > 0 && <th className={headClass}>Bộ từ</th>}
          <th className={headClass}>Ôn tiếp theo</th>
          <th className={headClass}>Trạng thái</th>
          <th className={`${headClass} pr-0 text-right`}>Thao tác</th>
        </tr>
      </thead>

      <tbody className="block sm:table-row-group">
        {rows.map((row) => {
          const overdue = now > 0 && new Date(row.due).getTime() <= now
          return (
            <tr key={row.id} className="block border-b border-rule py-3 align-top sm:table-row sm:py-0">
              <td className={`${cellClass} pr-0 sm:pr-4`}>
                <span className="flex items-baseline gap-2">
                  <span className="font-serif text-[1.0625rem] leading-[1.4] font-semibold text-ink">
                    {row.word}
                  </span>
                  <button
                    type="button"
                    onClick={() => void playPronunciation(row.word, row.audio_url)}
                    aria-label={`Nghe ${row.word}`}
                    className="shrink-0 rounded-sm border border-line-strong px-2 py-1 text-[0.75rem] text-ink-soft transition hover:bg-paper hover:text-ink"
                  >
                    Nghe
                  </button>
                </span>
                {row.phonetic && (
                  <span className="mt-0.5 block text-[0.8125rem] text-ink-soft">{row.phonetic}</span>
                )}
              </td>

              <td className={`${cellClass} max-w-[62ch] text-[0.9375rem] text-ink`}>
                {row.meaning}
                {row.example && (
                  <span className="mt-0.5 block font-serif text-[0.8125rem] leading-[1.6] text-ink-soft">
                    {row.example}
                  </span>
                )}
              </td>

              {collections.length > 0 && (
                <td className={`${cellClass} text-[0.9375rem] text-ink`}>
                  {row.collection_id ? (
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden
                        className={`inline-block h-[18px] w-[10px] rounded-sm ${TONE_BG[collectionTone(row.collection_id)]}`}
                      />
                      {names.get(row.collection_id) ?? '—'}
                    </span>
                  ) : (
                    <span className="text-ink-soft">Chưa phân loại</span>
                  )}
                </td>
              )}

              <td className={cellClass}>
                <span
                  className={`text-[0.9375rem] ${overdue ? 'rounded-sm bg-highlighter px-1.5 py-0.5 text-highlighter-ink' : 'text-ink'}`}
                >
                  {overdue ? formatDueRelative(row.due) : formatDateTime(row.due)}
                </span>
                {overdue && <span className="mt-0.5 block text-[0.8125rem] text-ink-soft">{formatDateTime(row.due)}</span>}
              </td>

              <td className={cellClass}>
                <span
                  className={`inline-block rounded-sm px-2 py-0.5 text-[0.8125rem] font-medium ${
                    STATE_TONES[row.state] ?? ''
                  }`}
                >
                  {STATE_LABELS[row.state] ?? `#${row.state}`}
                </span>
              </td>

              <td className={`${cellClass} pr-0 sm:text-right`}>
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  className="rounded-md px-2 py-1 text-sm font-medium text-pen transition hover:bg-paper"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(row)}
                  className="rounded-md px-2 py-1 text-sm font-medium text-red-pen transition hover:bg-paper"
                >
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
