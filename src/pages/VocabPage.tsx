import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowClockwise, ListBullets, Plus } from '@phosphor-icons/react'
import { CollectionBar } from '../components/CollectionBar'
import { VocabForm } from '../components/VocabForm'
import { useCards } from '../hooks/useCards'
import { useCollections } from '../hooks/useCollections'
import { SCOPE_ALL, SCOPE_NONE, type CollectionScope } from '../lib/collections'
import { supabase } from '../lib/supabase'
import type { CardInput } from '../lib/types'

/** Ghi một từ mới. Danh sách từ nằm ở trang riêng (`/vocab/list`). */
export function VocabPage() {
  const { collections, error: collectionsError, reload: reloadCollections } = useCollections()
  const { rows, setRows, error: loadError, reload } = useCards()
  const [scope, setScope] = useState<CollectionScope>(SCOPE_ALL)
  const [createError, setCreateError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  // Tăng sau mỗi lần thêm thành công: đổi `key` để phiếu "Thêm từ" remount về trạng thái trống.
  const [formReset, setFormReset] = useState(0)
  const [addedWord, setAddedWord] = useState<string | null>(null)

  const counts = useMemo(() => {
    const result: Record<string, number> = { [SCOPE_ALL]: rows.length, [SCOPE_NONE]: 0 }
    for (const collection of collections) result[collection.id] = 0
    for (const row of rows) {
      const key = row.collection_id ?? SCOPE_NONE
      if (key in result) result[key] += 1
    }
    return result
  }, [rows, collections])

  // Từ thêm mới mặc định vào bộ đang chọn ở dải chip.
  const defaultCollectionId = scope === SCOPE_ALL || scope === SCOPE_NONE ? null : scope

  // Xoá/đổi tên bộ từ cũng đổi dữ liệu cards (FK set null) → nạp lại cả hai.
  const reloadAll = async () => {
    await reloadCollections()
    reload()
  }

  const handleCreate = async (values: CardInput) => {
    setCreateError(null)
    setAddedWord(null)

    if (rows.some((row) => row.word.trim().toLowerCase() === values.word.trim().toLowerCase())) {
      setCreateError(`Từ "${values.word}" đã có trong danh sách.`)
      return
    }

    setSaving(true)
    const { data, error } = await supabase.from('cards').insert(values).select().single()
    setSaving(false)
    if (error) setCreateError(error.message)
    else {
      setRows((prev) => [data, ...prev])
      setFormReset((prev) => prev + 1)
      setAddedWord(data.word)
    }
  }

  return (
    <div className="space-y-10">
      <section className="panel p-6">
        <h1 className="font-serif text-[1.375rem] tracking-[-0.01em] text-ink">Thêm từ</h1>
        <div className="mt-3">
          <VocabForm
            key={`create-${defaultCollectionId ?? 'none'}-${formReset}`}
            idPrefix="create"
            collections={collections}
            defaultCollectionId={defaultCollectionId}
            submitLabel="Thêm từ"
            submitIcon={<Plus aria-hidden size={16} />}
            busy={saving}
            onSubmit={(values) => void handleCreate(values)}
          />
        </div>
        {createError && <p className="banner mt-3">{createError}</p>}
        {addedWord && !createError && (
          <p className="mt-3 text-sm text-ink-soft">
            Đã thêm <strong className="font-medium text-ink">{addedWord}</strong>.{' '}
            <Link to="/vocab/list" className="font-medium text-accent underline">
              Xem trong danh sách
            </Link>
          </p>
        )}
      </section>

      <section className="space-y-5">
        <CollectionBar
          collections={collections}
          scope={scope}
          counts={counts}
          onScopeChange={setScope}
          manage
          onChanged={reloadAll}
          error={collectionsError}
        />

        {loadError && (
          <div className="banner flex items-center gap-3">
            <span>Không tải được dữ liệu: {loadError}</span>
            <button type="button" onClick={reload} className="btn-text font-medium text-ink underline">
              <ArrowClockwise aria-hidden size={16} />
              Thử lại
            </button>
          </div>
        )}

        <Link to="/vocab/list" className="btn btn-quiet">
          <ListBullets aria-hidden size={16} />
          Danh sách từ vựng
          <span className="tnum text-ink-soft">{rows.length}</span>
        </Link>
      </section>
    </div>
  )
}
