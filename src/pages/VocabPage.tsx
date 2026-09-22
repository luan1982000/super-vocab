import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  Check,
  MagnifyingGlass,
  Notebook,
  Plus,
} from '@phosphor-icons/react'
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
  // Tăng sau mỗi lần thêm thành công: đổi `key` để phiếu "Thêm từ" remount về trạng thái trống.
  const [formReset, setFormReset] = useState(0)
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
    else {
      setRows((prev) => [data, ...prev])
      setFormReset((prev) => prev + 1)
    }
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
      </section>

      <section className="space-y-5">
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
          <h2 className="font-serif text-[1.25rem] tracking-[-0.01em] text-ink">
            Danh sách từ vựng
            <span className="tnum ml-2 text-[0.8125rem] font-normal text-ink-soft">
              {filtered.length}/{rows.length} từ
            </span>
          </h2>
          <div className="relative ml-auto w-full sm:w-72">
            <MagnifyingGlass
              aria-hidden
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(0)
              }}
              placeholder="Tìm theo từ hoặc nghĩa"
              className="field pl-9"
            />
          </div>
        </div>

        {loadError && (
          <div className="banner flex items-center gap-3">
            <span>Không tải được dữ liệu: {loadError}</span>
            <button type="button" onClick={reload} className="btn-text font-medium text-ink underline">
              <ArrowClockwise aria-hidden size={16} />
              Thử lại
            </button>
          </div>
        )}

        {loading ? (
          <FullPageSpinner label="Đang tải danh sách…" />
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-ui border border-dashed border-line-strong px-6 py-16 text-center">
            <Notebook aria-hidden size={28} className="text-ink-soft" />
            <p className="text-sm leading-relaxed text-ink-soft">
              {rows.length === 0
                ? 'Hộp còn trống. Ghi từ đầu tiên ở phiếu phía trên.'
                : search.trim()
                  ? `Không có từ nào khớp “${search.trim()}”.`
                  : 'Bộ này chưa có từ nào.'}
            </p>
          </div>
        ) : (
          <>
            <VocabTable rows={visible} collections={collections} now={now} onEdit={setEditing} onDelete={setDeleting} />
            {pageCount > 1 && (
              <div className="flex items-center justify-between text-sm text-ink-soft">
                <span className="tnum">
                  Trang {safePage + 1}/{pageCount}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={safePage === 0}
                    onClick={() => setPage(safePage - 1)}
                    className="btn btn-quiet px-3 py-1.5"
                  >
                    <ArrowLeft aria-hidden size={16} />
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={safePage >= pageCount - 1}
                    onClick={() => setPage(safePage + 1)}
                    className="btn btn-quiet px-3 py-1.5"
                  >
                    Sau
                    <ArrowRight aria-hidden size={16} />
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
          submitIcon={<Check aria-hidden size={16} />}
          busy={saving}
          onSubmit={(values) => void handleUpdate(values)}
          onCancel={closeEdit}
        />
        {editError && editing && <p className="banner mt-3">{editError}</p>}
      </Modal>

      <Modal open={deleting !== null} title="Xóa từ" onClose={closeDelete}>
        <p className="text-sm leading-relaxed text-ink">
          Xóa <strong>{deleting?.word}</strong>? Hành động này không thể hoàn tác.
        </p>
        {deleteError && deleting && <p className="banner mt-3">{deleteError}</p>}
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => void handleDelete()} disabled={saving} className="btn btn-danger">
            {saving ? 'Đang xóa…' : 'Xóa'}
          </button>
          <button type="button" onClick={closeDelete} disabled={saving} className="btn btn-quiet">
            Hủy
          </button>
        </div>
      </Modal>
    </div>
  )
}
