import { useState, type FormEvent } from 'react'
import { Check, PencilSimple, Plus, Trash, X } from '@phosphor-icons/react'
import { Modal } from './Modal'
import {
  collectionTone,
  createCollection,
  deleteCollection,
  renameCollection,
  SCOPE_ALL,
  SCOPE_NONE,
  scopeLabel,
  TONE_BG,
  type CollectionScope,
} from '../lib/collections'
import type { CollectionRow } from '../lib/types'

/** Chip lọc: viền mảnh khi chưa chọn, nền mực xanh rêu khi đang chọn. */
const chipClass = (active: boolean, dashed = false) =>
  `tap-target inline-flex shrink-0 items-center gap-2 rounded-ui border px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors ${
    active
      ? 'border-accent bg-accent font-medium text-on-accent'
      : `border-line-strong text-ink-soft hover:border-ink-soft hover:text-ink ${dashed ? 'border-dashed' : ''}`
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

  const count = (key: string) =>
    counts ? <span className="tnum text-[0.8125rem]">{counts[key] ?? 0}</span> : null

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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="micro mr-1">Bộ từ</span>

        <button
          type="button"
          aria-pressed={scope === SCOPE_ALL}
          onClick={() => onScopeChange(SCOPE_ALL)}
          className={chipClass(scope === SCOPE_ALL)}
        >
          Tất cả
          {count(SCOPE_ALL)}
        </button>

        <button
          type="button"
          aria-pressed={scope === SCOPE_NONE}
          onClick={() => onScopeChange(SCOPE_NONE)}
          className={chipClass(scope === SCOPE_NONE, true)}
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
            className={chipClass(scope === collection.id)}
          >
            <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${TONE_BG[collectionTone(collection.id)]}`} />
            {collection.name}
            {count(collection.id)}
          </button>
        ))}

        {manage && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn btn-quiet tap-target shrink-0 px-2.5 py-1.5"
          >
            <Plus aria-hidden size={16} />
            Thêm bộ từ
          </button>
        )}
      </div>

      {error && <p className="text-sm text-danger">Không tải được bộ từ: {error}</p>}

      <Modal open={open} title="Bộ từ" onClose={closeManage}>
        <form onSubmit={(event) => void handleCreate(event)} className="flex gap-2">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Tên bộ mới, ví dụ: IELTS Reading"
            className="field"
          />
          <button type="submit" disabled={busy || !newName.trim()} className="btn btn-primary shrink-0">
            <Plus aria-hidden size={16} />
            Tạo
          </button>
        </form>

        {formError && <p className="banner mt-3">{formError}</p>}

        <ul className="mt-5 divide-y divide-rule border-t border-rule">
          {collections.map((collection) => (
            <li key={collection.id} className="py-3">
              {editingId === collection.id ? (
                <div className="flex gap-2">
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    className="field"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleRename(collection.id)}
                    className="btn btn-primary shrink-0"
                  >
                    <Check aria-hidden size={16} />
                    Lưu
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="btn btn-quiet shrink-0">
                    <X aria-hidden size={16} />
                    Hủy
                  </button>
                </div>
              ) : confirmingId === collection.id ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex-1 text-sm text-ink">
                    Xóa bộ <strong className="font-medium">{collection.name}</strong>? Các từ bên trong chuyển về “Chưa
                    phân loại”.
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleDelete(collection.id)}
                    className="btn btn-danger shrink-0"
                  >
                    <Trash aria-hidden size={16} />
                    Xóa
                  </button>
                  <button type="button" onClick={() => setConfirmingId(null)} className="btn btn-quiet shrink-0">
                    <X aria-hidden size={16} />
                    Hủy
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${TONE_BG[collectionTone(collection.id)]}`} />
                  <span className="flex-1 truncate text-sm text-ink">{collection.name}</span>
                  {counts && (
                    <span className="tnum text-[0.8125rem] text-ink-soft">{counts[collection.id] ?? 0} từ</span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(collection.id)
                      setDraftName(collection.name)
                      setConfirmingId(null)
                    }}
                    className="btn-text"
                  >
                    <PencilSimple aria-hidden size={16} />
                    Đổi tên
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmingId(collection.id)
                      setEditingId(null)
                    }}
                    className="btn-text hover:text-danger"
                  >
                    <Trash aria-hidden size={16} />
                    Xóa
                  </button>
                </div>
              )}
            </li>
          ))}
          {collections.length === 0 && (
            <li className="py-4 text-sm text-ink-soft">Chưa có bộ từ nào. Tạo bộ đầu tiên ở ô trên.</li>
          )}
        </ul>

        <p className="mt-5 text-[0.8125rem] text-ink-soft">
          Đang xem: <strong className="font-medium text-ink">{scopeLabel(scope, collections)}</strong>
        </p>
      </Modal>
    </div>
  )
}
