import { NavLink } from 'react-router-dom'
import { BookOpen, Cards, ListBullets, SignOut } from '@phosphor-icons/react'
import { useAuth } from '../hooks/useAuth'

/* Điều hướng bằng chữ + icon: mục đang xem được đánh dấu bằng một gạch chân màu nhấn. */
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 border-b-2 pb-0.5 text-sm transition-colors ${
    isActive ? 'border-accent text-ink' : 'border-transparent text-ink-soft hover:text-ink'
  }`

export function Navbar() {
  const { session, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex max-w-[56rem] flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
        <NavLink to="/vocab" className="flex items-center gap-2 font-serif text-[1.0625rem] tracking-[-0.01em] text-ink">
          <BookOpen aria-hidden size={18} className="text-accent" />
          Super Vocab
        </NavLink>

        {session && (
          <div className="flex items-center gap-6">
            <NavLink to="/vocab" className={linkClass}>
              <ListBullets aria-hidden size={16} />
              Từ vựng
            </NavLink>
            <NavLink to="/practice" className={linkClass}>
              <Cards aria-hidden size={16} />
              Ôn tập
            </NavLink>
          </div>
        )}

        {session && (
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden max-w-[16rem] truncate text-[0.8125rem] text-ink-soft sm:inline">
              {session.user.email}
            </span>
            <button type="button" onClick={() => void signOut()} className="btn btn-quiet px-3 py-1.5">
              <SignOut aria-hidden size={16} />
              Đăng xuất
            </button>
          </div>
        )}
      </nav>
    </header>
  )
}
