import { SpeakerHigh } from '@phosphor-icons/react'
import { collectionTone, TONE_BG } from '../lib/collections'
import { playPronunciation } from '../lib/pronounce'
import type { CardRow } from '../lib/types'

interface FlashCardProps {
  card: CardRow
  collectionName: string | null
  flipped: boolean
  onFlip: () => void
}

export function FlashCard({ card, collectionName, flipped, onFlip }: FlashCardProps) {
  return (
    <div className="relative mx-auto w-full max-w-[30rem]">
      {/* Tên bộ từ nằm trên thẻ, kèm chấm màu nhận diện; bộ trống thì để nét đứt. */}
      <div className="mb-3 flex items-center gap-2">
        <span
          aria-hidden
          className={
            card.collection_id
              ? `size-2.5 shrink-0 rounded-full ${TONE_BG[collectionTone(card.collection_id)]}`
              : 'size-2.5 shrink-0 rounded-full border border-dashed border-line-strong'
          }
        />
        <span className="micro">{collectionName ?? 'Chưa phân loại'}</span>
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
        className={`flip-inner panel relative block min-h-[16rem] w-full cursor-pointer text-left ${
          flipped ? 'is-flipped' : ''
        }`}
      >
        <div className="flip-face flip-face-front absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-auto p-6">
          <p className="font-serif text-[clamp(2.5rem,9vw,4rem)] leading-[1.1] tracking-[-0.02em] font-medium break-words text-ink">
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
              className="btn-text shrink-0 border border-line-strong px-2 py-0.5 text-[0.75rem]"
            >
              <SpeakerHigh aria-hidden size={16} />
              Nghe
            </button>
          </div>

          <p className="text-[0.8125rem] text-ink-soft">Bấm hoặc nhấn Space để xem nghĩa</p>
        </div>

        <div className="flip-face flip-face-back absolute inset-0 flex flex-col gap-5 overflow-auto p-6">
          <div>
            <p className="micro mb-1.5">Nghĩa</p>
            <p className="text-[1.25rem] leading-[1.45] font-medium break-words text-ink">{card.meaning}</p>
          </div>
          {card.example && (
            <div>
              <p className="micro mb-1.5">Ví dụ</p>
              <p className="max-w-[46ch] font-serif text-[1.0625rem] leading-[1.7] text-ink-soft">{card.example}</p>
            </div>
          )}
          {card.note && (
            <div>
              <p className="micro mb-1.5">Ghi chú</p>
              <p className="max-w-[46ch] text-[0.9375rem] leading-[1.6] text-ink">{card.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
