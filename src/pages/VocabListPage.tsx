import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowClockwise, Check, MagnifyingGlass, Notebook, Plus } from '@phosphor-icons/react'
import { Breadcrumb } from '../components/Breadcrumb'
import { CollectionBar } from '../components/CollectionBar'
import { FullPageSpinner } from '../components/FullPageSpinner'
import { Modal } from '../components/Modal'
import { Pagination } from '../components/Pagination'
import { VocabForm } from '../components/VocabForm'
import { VocabTable } from '../components/VocabTable'
import { useCards } from '../hooks/useCards'
import { useCollections } from '../hooks/useCollections'
import { SCOPE_ALL, SCOPE_NONE, type CollectionScope } from '../lib/collections'
import { supabase } from '../lib/supabase'
import type { CardInput, CardRow } from '../lib/types'

const PAGE_SIZE = 50

/** Danh sách từ vựng: lọc theo bộ + tìm kiếm (client-side), phân trang, sửa/xoá. */
export function VocabListPage() {
  const { collections, error: collectionsError, reload: reloadCollections } = useCollections()
  const { rows, setRows, loading, error: loadError, now, reload } = useCards()
  const [scope, setScope] = useState<CollectionScope>(SCOPE_ALL)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [editing, setEditing] = useState<CardRow | null>(null)
  const [deleting, setDeleting] = useState<CardRow | null>(null)

  // Xoá/đổi tên bộ từ cũng đổi dữ liệu cards (FK set null) → nạp lại cả hai.
  const reloadAll = async () => {
    await reloadCollections()
    reload()
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

  const changeScope = (next: CollectionScope) => {
    setScope(next)
    setPage(0)
  }

  const goToPage = (next: number) => {
    setPage(next)
    window.scrollTo({ top: 0 })
  }

  const handleUpdate = async (values: CardInput) => {
    if (!editing) return
    setEditError(null)

    const duplicate = rows.some(
      (row) => row.id !== editing.id && row.word.trim().toLowerCase() === values.word.trim().toLowerCase(),
    )
    if (duplicate) {
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
    <div className="space-y-8">
      <Breadcrumb items={[{ label: 'Từ vựng', to: '/vocab' }, { label: 'Danh sách từ vựng' }]} />

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-[1.375rem] tracking-[-0.01em] text-ink">
          Danh sách từ vựng
          <span className="tnum ml-2 text-[0.8125rem] font-normal text-ink-soft">
            {filtered.length}/{rows.length} từ
          </span>
        </h1>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <Link to="/vocab" className="btn btn-quiet">
            <Plus aria-hidden size={16} />
            Thêm từ
          </Link>
          <div className="relative w-full sm:w-72">
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
      </div>

      <div className="space-y-5">
        <CollectionBar
          collections={collections}
          scope={scope}
          counts={counts}
          onScopeChange={changeScope}
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

        {loading ? (
          <FullPageSpinner label="Đang tải danh sách…" />
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-ui border border-dashed border-line-strong px-6 py-16 text-center">
            <Notebook aria-hidden size={28} className="text-ink-soft" />
            <p className="text-sm leading-relaxed text-ink-soft">
              {rows.length === 0
                ? 'Hộp còn trống.'
                : search.trim()
                  ? `Không có từ nào khớp “${search.trim()}”.`
                  : 'Bộ này chưa có từ nào.'}
            </p>
            {rows.length === 0 && (
              <Link to="/vocab" className="btn btn-primary">
                <Plus aria-hidden size={16} />
                Thêm từ đầu tiên
              </Link>
            )}
          </div>
        ) : (
          <>
            <VocabTable rows={visible} collections={collections} now={now} onEdit={setEditing} onDelete={setDeleting} />
            <Pagination
              page={safePage}
              pageCount={pageCount}
              total={filtered.length}
              pageSize={PAGE_SIZE}
              onChange={goToPage}
            />
          </>
        )}
      </div>

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
