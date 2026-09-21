import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-pen text-white' : 'text-ink-soft hover:bg-card hover:text-ink'
  }`

export function Navbar() {
  const { session, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-paper/95 backdrop-blur">
      <nav className="mx-auto flex max-w-[52rem] flex-wrap items-center gap-2 px-5 py-3">
        <NavLink to="/vocab" className="mr-3 font-serif text-[1.0625rem] font-semibold text-ink">
          Super Vocab
        </NavLink>

        {session && (
          <>
            <NavLink to="/vocab" className={linkClass}>
              Từ vựng
            </NavLink>
            <NavLink to="/practice" className={linkClass}>
              Ôn tập
            </NavLink>
          </>
        )}

        <div className="ml-auto flex items-center gap-3">
          {session && (
            <>
              <span className="hidden max-w-[16rem] truncate text-[0.8125rem] text-ink-soft sm:inline">
                {session.user.email}
              </span>
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-md border border-line-strong px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-card"
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
