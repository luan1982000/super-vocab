import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'

export interface Crumb {
  label: string
  /** Có `to` thì mục đó là link; mục cuối (không `to`) là trang hiện tại. */
  to?: string
}

/**
 * Đường dẫn trang cho các trang con: mục đầu là nút quay lại (kèm mũi tên),
 * mục cuối là trang đang xem. Ngăn cách bằng dấu `/`, không dùng `·`.
 */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Đường dẫn trang" className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {items.map((item, index) =>
        item.to ? (
          <Fragment key={item.to}>
            <Link to={item.to} className="btn-text -ml-2">
              {index === 0 && <ArrowLeft aria-hidden size={16} />}
              {item.label}
            </Link>
            <span aria-hidden className="text-[0.8125rem] text-ink-soft">
              /
            </span>
          </Fragment>
        ) : (
          <span
            key={item.label}
            aria-current="page"
            className="text-[0.875rem] font-medium text-ink"
          >
            {item.label}
          </span>
        ),
      )}
    </nav>
  )
}
