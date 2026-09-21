import { useState, type FormEvent } from 'react'
import { Modal } from './Modal'
import {
  collectionTone,
  createCollection,
  deleteCollection,
  renameCollection,
  SCOPE_ALL,
  SCOPE_NONE,
  scopeLabel,
  TONE_EDGE,
  type CollectionScope,
} from '../lib/collections'
import type { CollectionRow } from '../lib/types'

const fieldClass =
  'w-full rounded-sm border border-line-strong bg-card px-3 py-2 text-base text-ink outline-none transition focus:border-pen'
const primaryClass =
  'rounded-md bg-pen px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55'
const quietClass =
  'rounded-md border border-line-strong px-3 py-2 text-sm font-medium text-ink transition hover:bg-paper disabled:opacity-55'

/** Tai ngăn hộp: thân giấy, dải màu 3px ở cạnh trên, đứng trên một đường kẻ nền. */
const tabClass = (active: boolean, toneEdge?: string) =>
  `relative top-px shrink-0 rounded-t-md border border-b-0 border-t-[3px] px-3 pt-1.5 pb-1.5 text-sm font-medium whitespace-nowrap transition ${
    active ? 'border-pen bg-pen text-white' : `border-line-strong bg-card text-ink hover:bg-paper ${toneEdge ?? ''}`
  }`

interface CollectionBarProps {
  collections: CollectionRow[]
  scope: CollectionScope
  /** Số từ theo scope ('all', 'none', hoặc id collection). Bỏ trống thì không hiện số. */
  counts?: Record<string, number>
  onScopeChange: (scope: CollectionScope) => void
  /** Bật nút quản lý (tạo / đổi tên / xóa). */
  manage?: boolean
  /** Gọi sau khi tạo/đổi tên/xóa để nạp lại danh sách. */
  onChanged?: () => void | Promise<void>
  error?: string | null
}

export function CollectionBar({ collections, scope, counts, onScopeChange, manage, onChanged, error }: CollectionBarProps) {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const count = (key: string) => (counts ? <span className="tnum ml-1.5 opacity-70">{counts[key] ?? 0}</span> : null)

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    const name = newName.trim()
    if (!name) return
    setBusy(true)
    setFormError(null)
    const { id, error: createError } = await createCollection(name)
    setBusy(false)
    if (createError) {
      setFormError(createError)
      return
    }
    setNewName('')
    await onChanged?.()
    if (id) onScopeChange(id)
  }

  const handleRename = async (id: string) => {
    const name = draftName.trim()
    if (!name) return
    setBusy(true)
    setFormError(null)
    const renameError = await renameCollection(id, name)
    setBusy(false)
    if (renameError) {
      setFormError(renameError)
      return
    }
    setEditingId(null)
    await onChanged?.()
  }

  const handleDelete = async (id: string) => {
    setBusy(true)
    setFormError(null)
    const deleteError = await deleteCollection(id)
    setBusy(false)
    if (deleteError) {
      setFormError(deleteError)
      return
    }
    setConfirmingId(null)
    if (scope === id) onScopeChange(SCOPE_ALL)
    await onChanged?.()
  }

  const closeManage = () => {
    setOpen(false)
    setEditingId(null)
    setConfirmingId(null)
    setFormError(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-nowrap items-end gap-1.5 overflow-x-auto border-b border-rule sm:flex-wrap sm:overflow-visible">
        <span className="shrink-0 pr-1 pb-2 text-sm text-ink-soft">Bộ từ</span>

        <button
          type="button"
          aria-pressed={scope === SCOPE_ALL}
          onClick={() => onScopeChange(SCOPE_ALL)}
          className={tabClass(scope === SCOPE_ALL)}
        >
          Tất cả
          {count(SCOPE_ALL)}
        </button>

        <button
          type="button"
          aria-pressed={scope === SCOPE_NONE}
          onClick={() => onScopeChange(SCOPE_NONE)}
          className={`${tabClass(scope === SCOPE_NONE)} ${scope === SCOPE_NONE ? '' : 'border-dashed border-line-strong'}`}
        >
          Chưa phân loại
          {count(SCOPE_NONE)}
        </button>

        {collections.map((collection) => (
          <button
            key={collection.id}
            type="button"
            aria-pressed={scope === collection.id}
            onClick={() => onScopeChange(collection.id)}
            className={tabClass(scope === collection.id, TONE_EDGE[collectionTone(collection.id)])}
          >
            {collection.name}
            {count(collection.id)}
          </button>
        ))}

        {manage && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mb-1 ml-1 rounded-md border border-dashed border-line-strong px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:bg-card"
          >
            Thêm bộ từ
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-pen">Không tải được bộ từ: {error}</p>}

      <Modal open={open} title="Bộ từ" onClose={closeManage}>
        <form onSubmit={(event) => void handleCreate(event)} className="flex gap-2">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Tên bộ mới, ví dụ: IELTS Reading"
            className={fieldClass}
          />
          <button type="submit" disabled={busy || !newName.trim()} className={primaryClass}>
            Tạo
          </button>
        </form>

        {formError && <p className="mt-3 border-l-[3px] border-red-pen bg-red-pen/8 px-3 py-2 text-sm text-ink">{formError}</p>}

        <ul className="mt-4 divide-y divide-rule">
          {collections.map((collection) => (
            <li key={collection.id} className="py-3">
              {editingId === collection.id ? (
                <div className="flex gap-2">
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    className={fieldClass}
                  />
                  <button type="button" disabled={busy} onClick={() => void handleRename(collection.id)} className={primaryClass}>
                    Lưu
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className={quietClass}>
                    Hủy
                  </button>
                </div>
              ) : confirmingId === collection.id ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-ink">
                    Xóa bộ <strong>{collection.name}</strong>? Các từ bên trong chuyển về “Chưa phân loại”.
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleDelete(collection.id)}
                    className="rounded-md bg-red-pen px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-55"
                  >
                    Xóa
                  </button>
                  <button type="button" onClick={() => setConfirmingId(null)} className={quietClass}>
                    Hủy
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm font-medium text-ink">{collection.name}</span>
                  {counts && <span className="tnum text-[0.8125rem] text-ink-soft">{counts[collection.id] ?? 0} từ</span>}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(collection.id)
                      setDraftName(collection.name)
                      setConfirmingId(null)
                    }}
                    className="rounded-md px-2 py-1 text-sm font-medium text-pen transition hover:bg-paper"
                  >
                    Đổi tên
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmingId(collection.id)
                      setEditingId(null)
                    }}
                    className="rounded-md px-2 py-1 text-sm font-medium text-red-pen transition hover:bg-paper"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </li>
          ))}
          {collections.length === 0 && <li className="py-3 text-sm text-ink-soft">Hộp chưa có ngăn nào. Tạo ngăn đầu tiên ở ô trên.</li>}
        </ul>

        <p className="mt-4 text-[0.8125rem] text-ink-soft">
          Đang xem: <strong className="text-ink">{scopeLabel(scope, collections)}</strong>
        </p>
      </Modal>
    </div>
  )
}
