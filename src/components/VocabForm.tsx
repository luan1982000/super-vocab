import { useState, type FormEvent, type ReactNode } from 'react'
import { MagnifyingGlass, SpeakerHigh, X } from '@phosphor-icons/react'
import { lookupPronunciation, playPronunciation } from '../lib/pronounce'
import type { CardInput, CollectionRow } from '../lib/types'

interface VocabFormProps {
  /** Tiền tố id để form thêm mới và form trong modal không trùng id DOM. */
  idPrefix: string
  collections: CollectionRow[]
  initial?: CardInput | null
  /** Bộ từ mặc định khi thêm mới (theo bộ đang xem). */
  defaultCollectionId?: string | null
  submitLabel: string
  /** Icon đặt trước nhãn nút gửi; do nơi gọi quyết định. */
  submitIcon?: ReactNode
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
  submitIcon,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="micro mb-1.5" htmlFor={`${idPrefix}-word`}>
            Từ
          </label>
          <input
            id={`${idPrefix}-word`}
            className="field"
            value={values.word}
            onChange={update('word')}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="micro mb-1.5" htmlFor={`${idPrefix}-meaning`}>
            Nghĩa
          </label>
          <input
            id={`${idPrefix}-meaning`}
            className="field"
            value={values.meaning}
            onChange={update('meaning')}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[12rem] flex-1">
          <label className="micro mb-1.5" htmlFor={`${idPrefix}-phonetic`}>
            Phát âm
          </label>
          <input
            id={`${idPrefix}-phonetic`}
            className="field"
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
          className="btn btn-quiet shrink-0"
        >
          <MagnifyingGlass aria-hidden size={16} />
          {looking ? 'Đang tra…' : 'Lấy phát âm'}
        </button>
        <button
          type="button"
          onClick={() => void playPronunciation(values.word, values.audio_url)}
          disabled={!values.word.trim()}
          aria-label={`Nghe ${values.word || 'từ'}`}
          className="btn btn-quiet shrink-0"
        >
          <SpeakerHigh aria-hidden size={16} />
          Nghe
        </button>
      </div>

      <div>
        <label className="micro mb-1.5" htmlFor={`${idPrefix}-collection`}>
          Bộ từ
        </label>
        <select
          id={`${idPrefix}-collection`}
          className="field"
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
        <label className="micro mb-1.5" htmlFor={`${idPrefix}-example`}>
          Ví dụ
        </label>
        <textarea
          id={`${idPrefix}-example`}
          rows={2}
          className="field"
          value={values.example ?? ''}
          onChange={update('example')}
        />
      </div>

      <div>
        <label className="micro mb-1.5" htmlFor={`${idPrefix}-note`}>
          Ghi chú
        </label>
        <textarea
          id={`${idPrefix}-note`}
          rows={2}
          className="field"
          value={values.note ?? ''}
          onChange={update('note')}
        />
      </div>

      {error && <p className="banner">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="btn btn-primary">
          {submitIcon}
          {busy ? 'Đang lưu…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={busy} className="btn btn-quiet">
            <X aria-hidden size={16} />
            Hủy
          </button>
        )}
      </div>
    </form>
  )
}
