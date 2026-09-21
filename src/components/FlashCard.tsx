import { collectionTone, TONE_BG } from '../lib/collections'
import { playPronunciation } from '../lib/pronounce'
import type { CardRow } from '../lib/types'

interface FlashCardProps {
  card: CardRow
  collectionName: string | null
  flipped: boolean
  onFlip: () => void
}

const labelClass = 'text-[0.8125rem] font-medium text-ink-soft'

export function FlashCard({ card, collectionName, flipped, onFlip }: FlashCardProps) {
  // Tai hộp mang màu của bộ từ; bộ trống thì để nét đứt.
  const tabClass = card.collection_id
    ? `${TONE_BG[collectionTone(card.collection_id)]} border-rule text-tab-ink`
    : 'border-dashed border-line-strong text-ink-soft'

  return (
    <div className="mt-8">
      <div className="relative mx-auto w-full max-w-[30rem]">
        <div aria-hidden className="absolute inset-x-4 -bottom-2 h-6 rounded-b-md border border-rule bg-paper" />
        <div aria-hidden className="absolute inset-x-2 -bottom-1 h-6 rounded-b-md border border-rule bg-card" />

        <div
          className={`absolute -top-[22px] left-6 flex h-[22px] w-[132px] items-center justify-center rounded-t-md border border-b-0 px-2 ${tabClass}`}
        >
          <span className="truncate text-[0.75rem] font-medium">{collectionName ?? 'Chưa phân loại'}</span>
        </div>

        {/* role=button (không phải <button>) để đặt được nút "Nghe" bên trong. Space do listener toàn cục xử lý. */}
        <div
          role="button"
          tabIndex={0}
          aria-label={flipped ? 'Xem mặt trước' : 'Xem nghĩa'}
          onClick={onFlip}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return
            if (event.key === 'Enter') onFlip()
          }}
          className={`flip-inner relative block min-h-[15rem] w-full cursor-pointer rounded-md border border-rule bg-card text-left shadow-[var(--stack-shadow)] ${
            flipped ? 'is-flipped' : ''
          }`}
        >
          <div className="flip-face flip-face-front absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-auto p-6">
            <p className="font-serif text-[clamp(2.25rem,8vw,3.5rem)] leading-[1.15] font-semibold break-words text-ink">
              {card.word}
            </p>

            <div className="flex items-center gap-2">
              {card.phonetic && <span className="text-[0.9375rem] text-ink-soft">{card.phonetic}</span>}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  void playPronunciation(card.word, card.audio_url)
                }}
                aria-label={`Nghe ${card.word}`}
                className="rounded-sm border border-line-strong px-2 py-0.5 text-[0.75rem] text-ink-soft transition hover:bg-paper hover:text-ink"
              >
                Nghe
              </button>
            </div>

            <p className="mt-1 text-[0.8125rem] text-ink-soft">Bấm hoặc nhấn Space để xem nghĩa</p>
          </div>

          <div className="flip-face flip-face-back absolute inset-0 flex flex-col gap-5 overflow-auto p-6">
            <div>
              <p className={labelClass}>Nghĩa</p>
              <p className="text-[1.25rem] leading-[1.45] font-medium break-words text-ink">{card.meaning}</p>
            </div>
            {card.example && (
              <div>
                <p className={labelClass}>Ví dụ</p>
                <p className="font-serif text-[0.9375rem] leading-[1.6] text-ink-soft">{card.example}</p>
              </div>
            )}
            {card.note && (
              <div>
                <p className={labelClass}>Ghi chú</p>
                <p className="text-[0.9375rem] leading-[1.5] text-ink">{card.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
