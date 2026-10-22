import type { ReactNode } from 'react'

/**
 * Chip lọc: chấm màu nhận diện trạng thái (luôn kèm nhãn chữ),
 * khi chọn thì nền đặc theo đúng màu đó.
 */
export function FilterChip({
  active,
  onClick,
  children,
  count,
  dotClass,
  activeClass = 'border-accent bg-accent font-medium text-on-accent',
  idleClass = 'border-line-strong bg-card text-ink-soft hover:border-ink-soft hover:text-ink',
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  count?: number
  dotClass?: string
  /** Lớp khi đang chọn; mặc định nền accent. */
  activeClass?: string
  /** Lớp khi chưa chọn; truyền màu nhạt theo trạng thái để chip vẫn có màu. */
  idleClass?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`tap-target inline-flex shrink-0 items-center gap-2 rounded-ui border px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors ${
        active ? activeClass : idleClass
      }`}
    >
      {dotClass && (
        <span
          aria-hidden
          className={`size-1.5 shrink-0 rounded-full ${active ? 'bg-current opacity-70' : dotClass}`}
        />
      )}
      {children}
      {count !== undefined && (
        <span className="tnum text-[0.8125rem] opacity-80">{count}</span>
      )}
    </button>
  )
}
