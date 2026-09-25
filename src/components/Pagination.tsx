import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'

/** Trang đầu, trang cuối, và cửa sổ quanh trang hiện tại; chỗ bị nhảy thì chèn dấu ngắt. */
function pageItems(page: number, pageCount: number): (number | 'gap')[] {
  const wanted = [0, page - 1, page, page + 1, pageCount - 1].filter((item) => item >= 0 && item < pageCount)
  wanted.sort((a, b) => a - b)

  const items: (number | 'gap')[] = []
  let previous = -1
  for (const item of wanted) {
    if (item === previous) continue
    if (previous >= 0 && item - previous > 1) items.push('gap')
    items.push(item)
    previous = item
  }
  return items
}

interface PaginationProps {
  /** 0-based. */
  page: number
  pageCount: number
  /** Tổng số mục của tập đã lọc (không phải số đang hiện). */
  total: number
  pageSize: number
  onChange: (page: number) => void
}

export function Pagination({ page, pageCount, total, pageSize, onChange }: PaginationProps) {
  if (pageCount <= 1) return null

  const first = page * pageSize + 1
  const last = Math.min(total, (page + 1) * pageSize)

  return (
    <nav aria-label="Phân trang" className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <span className="tnum text-[0.8125rem] text-ink-soft">
        {first}–{last} trong {total} từ
      </span>

      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
          className="btn btn-quiet tap-target px-2.5 py-1.5"
        >
          <ArrowLeft aria-hidden size={16} />
          Trước
        </button>

        {pageItems(page, pageCount).map((item, index) =>
          item === 'gap' ? (
            <span key={`gap-${index}`} aria-hidden className="px-1 text-[0.8125rem] text-ink-soft">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onChange(item)}
              className={`tap-target tnum rounded-ui border px-2.5 py-1.5 text-sm transition-colors ${
                item === page
                  ? 'border-accent bg-accent font-medium text-on-accent'
                  : 'border-line-strong text-ink-soft hover:border-ink-soft hover:text-ink'
              }`}
            >
              {item + 1}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={page >= pageCount - 1}
          onClick={() => onChange(page + 1)}
          className="btn btn-quiet tap-target px-2.5 py-1.5"
        >
          Sau
          <ArrowRight aria-hidden size={16} />
        </button>
      </div>
    </nav>
  )
}
