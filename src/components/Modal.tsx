import { useEffect, type ReactNode } from 'react'
import { X } from '@phosphor-icons/react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-scrim p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="panel w-full max-w-[32rem] shadow-[var(--shadow-modal)]"
      >
        <div className="flex items-baseline justify-between gap-4 border-b border-rule px-5 py-4">
          <h2 id="modal-title" className="font-serif text-[1.125rem] font-medium tracking-[-0.01em] text-ink">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="btn-text -mr-2">
            <X aria-hidden size={18} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}
