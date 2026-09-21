import { useState, type FormEvent } from 'react'
import { lookupPronunciation, playPronunciation } from '../lib/pronounce'
import type { CardInput, CollectionRow } from '../lib/types'

const fieldClass =
  'w-full rounded-sm border border-line-strong bg-card px-3 py-2 text-base text-ink outline-none transition focus:border-pen'
const labelClass = 'mb-1 block text-sm text-ink-soft'
const quietClass =
  'shrink-0 rounded-md border border-line-strong px-3 py-2 text-sm font-medium text-ink transition hover:bg-paper disabled:opacity-55'
const primaryClass =
  'rounded-md bg-pen px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55'

interface VocabFormProps {
  /** Tiền tố id để form thêm mới và form trong modal không trùng id DOM. */
  idPrefix: string
  collections: CollectionRow[]
  initial?: CardInput | null
  /** Bộ từ mặc định khi thêm mới (theo bộ đang xem). */
  defaultCollectionId?: string | null
  submitLabel: string
  busy: boolean
  onSubmit: (values: CardInput) => void
  onCancel?: () => void
}

const EMPTY: CardInput = {
  word: '',
  meaning: '',
  example: '',
  note: '',
  collection_id: null,
  phonetic: '',
  audio_url: null,
}

export function VocabForm({
  idPrefix,
  collections,
  initial,
  defaultCollectionId = null,
  submitLabel,
  busy,
  onSubmit,
  onCancel,
}: VocabFormProps) {
  // `initial`/`defaultCollectionId` chỉ đổi khi cha remount form qua prop `key`.
  const [values, setValues] = useState<CardInput>(
    initial ?? { ...EMPTY, collection_id: defaultCollectionId },
  )
  const [error, setError] = useState<string | null>(null)
  const [looking, setLooking] = useState(false)

  const update = (key: keyof CardInput) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }))

  const handleLookup = async () => {
    const word = values.word.trim()
    if (!word) return
    setLooking(true)
    setError(null)
    const { phonetic, audioUrl, failed } = await lookupPronunciation(word)
    setLooking(false)
    if (failed && !phonetic) {
      setError('Không tra được phát âm (mạng hoặc Wiktionary đang giới hạn). Thử lại sau hoặc nhập tay.')
      return
    }
    if (!phonetic && !audioUrl) {
      setError('Từ này chưa có dữ liệu phát âm. Nhập tay giúp.')
      return
    }
    setValues((prev) => ({
      ...prev,
      phonetic: phonetic ?? prev.phonetic,
      audio_url: audioUrl ?? prev.audio_url,
    }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const word = values.word.trim()
    const meaning = values.meaning.trim()
    if (!word || !meaning) {
      setError('Từ và nghĩa không được để trống.')
      return
    }
    setError(null)
    onSubmit({
      word,
      meaning,
      example: values.example?.trim() || null,
      note: values.note?.trim() || null,
      collection_id: values.collection_id || null,
      phonetic: values.phonetic?.trim() || null,
      audio_url: values.audio_url || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-word`}>
            Từ
          </label>
          <input
            id={`${idPrefix}-word`}
            className={fieldClass}
            value={values.word}
            onChange={update('word')}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-meaning`}>
            Nghĩa
          </label>
          <input
            id={`${idPrefix}-meaning`}
            className={fieldClass}
            value={values.meaning}
            onChange={update('meaning')}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className={labelClass} htmlFor={`${idPrefix}-phonetic`}>
            Phát âm
          </label>
          <input
            id={`${idPrefix}-phonetic`}
            className={fieldClass}
            placeholder="/əˈfɛ.mə.ɹəl/"
            value={values.phonetic ?? ''}
            onChange={update('phonetic')}
            autoComplete="off"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleLookup()}
          disabled={looking || !values.word.trim()}
          className={quietClass}
        >
          {looking ? 'Đang tra…' : 'Lấy phát âm'}
        </button>
        <button
          type="button"
          onClick={() => void playPronunciation(values.word, values.audio_url)}
          disabled={!values.word.trim()}
          aria-label={`Nghe ${values.word || 'từ'}`}
          className={quietClass}
        >
          Nghe
        </button>
      </div>

      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-collection`}>
          Bộ từ
        </label>
        <select
          id={`${idPrefix}-collection`}
          className={fieldClass}
          value={values.collection_id ?? ''}
          onChange={(event) => setValues((prev) => ({ ...prev, collection_id: event.target.value || null }))}
        >
          <option value="">Chưa phân loại</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-example`}>
          Ví dụ
        </label>
        <textarea
          id={`${idPrefix}-example`}
          rows={2}
          className={fieldClass}
          value={values.example ?? ''}
          onChange={update('example')}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-note`}>
          Ghi chú
        </label>
        <textarea
          id={`${idPrefix}-note`}
          rows={2}
          className={fieldClass}
          value={values.note ?? ''}
          onChange={update('note')}
        />
      </div>

      {error && <p className="border-l-[3px] border-red-pen bg-red-pen/8 px-3 py-2 text-sm text-ink">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={primaryClass}>
          {busy ? 'Đang lưu…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={busy} className={quietClass}>
            Hủy
          </button>
        )}
      </div>
    </form>
  )
}
