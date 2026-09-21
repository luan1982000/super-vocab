import { useCallback, useEffect, useMemo, useState } from 'react'
import { CollectionBar } from '../components/CollectionBar'
import { Modal } from '../components/Modal'
import { FullPageSpinner } from '../components/FullPageSpinner'
import { VocabForm } from '../components/VocabForm'
import { VocabTable } from '../components/VocabTable'
import { SCOPE_ALL, SCOPE_NONE, type CollectionScope } from '../lib/collections'
import { supabase } from '../lib/supabase'
import type { CardInput, CardRow } from '../lib/types'
import { useCollections } from '../hooks/useCollections'

const PAGE_SIZE = 50
const quietClass =
  'rounded-md border border-line-strong px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-paper disabled:opacity-55'

export function VocabPage() {
  const { collections, error: collectionsError, reload: reloadCollections } = useCollections()
  const [rows, setRows] = useState<CardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [scope, setScope] = useState<CollectionScope>(SCOPE_ALL)
  const [page, setPage] = useState(0)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<CardRow | null>(null)
  const [deleting, setDeleting] = useState<CardRow | null>(null)
  // Mốc so sánh "quá hạn": lấy lúc nạp dữ liệu để render không gọi Date.now().
  const [now, setNow] = useState(0)

  const load = useCallback(async () => {
    const stamp = Date.now()
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setLoadError(error.message)
    else setRows(data ?? [])
    setNow(stamp)
    setLoading(false)
  }, [])

  const reload = () => {
    setLoading(true)
    setLoadError(null)
    void load()
  }

  // Xoá/đổi tên bộ từ cũng đổi dữ liệu cards (FK set null) → nạp lại cả hai.
  const reloadAll = async () => {
    await reloadCollections()
    await load()
  }

  useEffect(() => {
    // async IIFE: state chỉ được set sau `await` (react/set-state-in-effect).
    void (async () => {
      await load()
    })()
  }, [load])

  const changeScope = (next: CollectionScope) => {
    setScope(next)
    setPage(0)
  }

  const counts = useMemo(() => {
    const result: Record<string, number> = { [SCOPE_ALL]: rows.length, [SCOPE_NONE]: 0 }
    for (const collection of collections) result[collection.id] = 0
    for (const row of rows) {
      const key = row.collection_id ?? SCOPE_NONE
      if (key in result) result[key] += 1
    }
    return result
  }, [rows, collections])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((row) => {
      const inScope =
        scope === SCOPE_ALL || (scope === SCOPE_NONE ? row.collection_id === null : row.collection_id === scope)
      if (!inScope) return false
      if (!query) return true
      return row.word.toLowerCase().includes(query) || row.meaning.toLowerCase().includes(query)
    })
  }, [rows, scope, search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  // Từ thêm mới mặc định vào bộ đang xem.
  const defaultCollectionId = scope === SCOPE_ALL || scope === SCOPE_NONE ? null : scope

  const isDuplicate = (word: string, exceptId?: string) =>
    rows.some((row) => row.id !== exceptId && row.word.trim().toLowerCase() === word.trim().toLowerCase())

  const handleCreate = async (values: CardInput) => {
    setCreateError(null)
    if (isDuplicate(values.word)) {
      setCreateError(`Từ "${values.word}" đã có trong danh sách.`)
      return
    }
    setSaving(true)
    const { data, error } = await supabase.from('cards').insert(values).select().single()
    setSaving(false)
    if (error) setCreateError(error.message)
    else setRows((prev) => [data, ...prev])
  }

  const handleUpdate = async (values: CardInput) => {
    if (!editing) return
    setEditError(null)
    if (isDuplicate(values.word, editing.id)) {
      setEditError(`Từ "${values.word}" đã có trong danh sách.`)
      return
    }
    setSaving(true)
    const { data, error } = await supabase.from('cards').update(values).eq('id', editing.id).select().single()
    setSaving(false)
    if (error) setEditError(error.message)
    else {
      setRows((prev) => prev.map((row) => (row.id === data.id ? data : row)))
      setEditing(null)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setSaving(true)
    const { error } = await supabase.from('cards').delete().eq('id', deleting.id)
    setSaving(false)
    if (error) setDeleteError(error.message)
    else {
      setRows((prev) => prev.filter((row) => row.id !== deleting.id))
      setDeleting(null)
    }
  }

  const closeEdit = () => {
    setEditing(null)
    setEditError(null)
  }
  const closeDelete = () => {
    setDeleting(null)
    setDeleteError(null)
  }

  const bannerClass = 'border-l-[3px] border-red-pen bg-red-pen/8 px-3 py-2 text-sm text-ink'

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-rule bg-card p-4 shadow-[var(--stack-shadow)]">
        <h1 className="font-serif text-[1.5rem] font-semibold text-ink">Thêm từ</h1>
        <div className="mt-3">
          <VocabForm
            key={`create-${defaultCollectionId ?? 'none'}`}
            idPrefix="create"
            collections={collections}
            defaultCollectionId={defaultCollectionId}
            submitLabel="Thêm từ"
            busy={saving}
            onSubmit={(values) => void handleCreate(values)}
          />
        </div>
        {createError && <p className={`mt-3 ${bannerClass}`}>{createError}</p>}
      </section>

      <section className="space-y-3">
        <CollectionBar
          collections={collections}
          scope={scope}
          counts={counts}
          onScopeChange={changeScope}
          manage
          onChanged={reloadAll}
          error={collectionsError}
        />

        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-[1.0625rem] font-semibold text-ink">
            Danh sách từ vựng
            <span className="tnum ml-2 text-[0.8125rem] font-normal text-ink-soft">
              {filtered.length}/{rows.length} từ
            </span>
          </h2>
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
            placeholder="Tìm theo từ hoặc nghĩa"
            className="ml-auto w-full rounded-sm border border-line-strong bg-card px-3 py-2 text-base text-ink outline-none transition focus:border-pen sm:w-72"
          />
        </div>

        {loadError && (
          <div className={`flex items-center gap-3 ${bannerClass}`}>
            <span>Không tải được dữ liệu: {loadError}</span>
            <button type="button" onClick={reload} className="font-semibold underline">
              Thử lại
            </button>
          </div>
        )}

        {loading ? (
          <FullPageSpinner label="Đang tải danh sách…" />
        ) : visible.length === 0 ? (
          <p className="rounded-md border border-dashed border-line-strong px-4 py-10 text-center text-sm text-ink-soft">
            {rows.length === 0
              ? 'Hộp còn trống. Ghi từ đầu tiên ở phiếu phía trên.'
              : search.trim()
                ? `Không có từ nào khớp “${search.trim()}”.`
                : 'Bộ này chưa có từ nào.'}
          </p>
        ) : (
          <>
            <VocabTable rows={visible} collections={collections} now={now} onEdit={setEditing} onDelete={setDeleting} />
            {pageCount > 1 && (
              <div className="flex items-center justify-between text-sm text-ink-soft">
                <span className="tnum">
                  Trang {safePage + 1}/{pageCount}
                </span>
                <div className="flex gap-2">
                  <button type="button" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} className={quietClass}>
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={safePage >= pageCount - 1}
                    onClick={() => setPage(safePage + 1)}
                    className={quietClass}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <Modal open={editing !== null} title="Sửa từ" onClose={closeEdit}>
        <VocabForm
          idPrefix="edit"
          collections={collections}
          key={editing?.id ?? 'none'}
          initial={
            editing
              ? {
                  word: editing.word,
                  meaning: editing.meaning,
                  example: editing.example,
                  note: editing.note,
                  collection_id: editing.collection_id,
                  phonetic: editing.phonetic,
                  audio_url: editing.audio_url,
                }
              : null
          }
          submitLabel="Lưu"
          busy={saving}
          onSubmit={(values) => void handleUpdate(values)}
          onCancel={closeEdit}
        />
        {editError && editing && <p className={`mt-3 ${bannerClass}`}>{editError}</p>}
      </Modal>

      <Modal open={deleting !== null} title="Xóa từ" onClose={closeDelete}>
        <p className="text-sm text-ink">
          Xóa <strong>{deleting?.word}</strong>? Hành động này không thể hoàn tác.
        </p>
        {deleteError && deleting && <p className={`mt-3 ${bannerClass}`}>{deleteError}</p>}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={saving}
            className="rounded-md bg-red-pen px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-55"
          >
            {saving ? 'Đang xóa…' : 'Xóa'}
          </button>
          <button type="button" onClick={closeDelete} disabled={saving} className={quietClass}>
            Hủy
          </button>
        </div>
      </Modal>
    </div>
  )
}
