import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BookOpen, Cards, List, ListBullets, SidebarSimple, SignOut, X } from '@phosphor-icons/react'
import { useAuth } from '../hooks/useAuth'
import { MascotCorner } from './MascotCorner'

const COLLAPSE_KEY = 'super-vocab.nav-collapsed'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 rounded-ui px-3 py-2 text-sm transition-colors ${
    isActive ? 'bg-accent/10 font-medium text-accent' : 'text-ink-soft hover:bg-hover hover:text-ink'
  }`

function Wordmark() {
  return (
    <Link to="/vocab" className="flex items-center gap-2 font-serif text-[1.0625rem] tracking-[-0.01em] text-ink">
      <BookOpen aria-hidden size={18} className="text-accent" />
      Super Vocab
    </Link>
  )
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <NavLink to="/vocab" onClick={onNavigate} className={navLinkClass}>
        <ListBullets aria-hidden size={18} />
        Từ vựng
      </NavLink>
      <NavLink to="/practice" onClick={onNavigate} className={navLinkClass}>
        <Cards aria-hidden size={18} />
        Ôn tập
      </NavLink>
    </>
  )
}

function Account({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  return (
    <div className="space-y-3">
      <p className="truncate px-3 text-[0.8125rem] text-ink-soft">{email}</p>
      <button type="button" onClick={onSignOut} className="btn btn-quiet w-full justify-start">
        <SignOut aria-hidden size={16} />
        Đăng xuất
      </button>
    </div>
  )
}

/**
 * Khung trang: menu dọc bên trái (thu gọn được, nhớ trạng thái), drawer cho màn hẹp,
 * và linh vật ở góc. Chưa đăng nhập thì chỉ có thanh trên tối giản.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { session, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!drawerOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  if (!session) {
    return (
      <>
        <div className="min-h-screen bg-paper text-ink">
          <header className="border-b border-rule">
            <div className="mx-auto flex max-w-[56rem] items-center px-6 py-3">
              <Wordmark />
            </div>
          </header>
          <main className="mx-auto w-full max-w-[56rem] px-6 py-10 sm:py-12">{children}</main>
        </div>
        <MascotCorner showFrom="min-[680px]:block" />
      </>
    )
  }

  const onSignOut = () => void signOut()

  return (
    <>
      <div className="min-h-screen bg-paper text-ink md:flex">
        {!collapsed && (
          <aside className="sticky top-0 hidden h-screen w-[15rem] shrink-0 flex-col border-r border-rule px-3 py-5 md:flex">
            <div className="px-3">
              <Wordmark />
            </div>
            <nav aria-label="Điều hướng chính" className="mt-6 flex flex-col gap-1">
              <NavItems />
            </nav>
            <div className="mt-auto space-y-3">
              <Account email={session.user.email ?? ''} onSignOut={onSignOut} />
              <button type="button" onClick={toggleCollapsed} className="btn-text w-full justify-start">
                <SidebarSimple aria-hidden size={16} />
                Ẩn menu
              </button>
            </div>
          </aside>
        )}

        {drawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-scrim" onClick={() => setDrawerOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-[16rem] flex-col border-r border-rule bg-paper px-3 py-5">
              <div className="flex items-center justify-between gap-2 pl-3">
                <Wordmark />
                <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Đóng" className="btn-text -mr-2">
                  <X aria-hidden size={18} />
                </button>
              </div>
              <nav aria-label="Điều hướng chính" className="mt-6 flex flex-col gap-1">
                <NavItems onNavigate={() => setDrawerOpen(false)} />
              </nav>
              <div className="mt-auto">
                <Account email={session.user.email ?? ''} onSignOut={onSignOut} />
              </div>
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className={`sticky top-0 z-20 border-b border-rule bg-paper/90 backdrop-blur ${collapsed ? '' : 'md:hidden'}`}
          >
            <div className="flex items-center gap-3 px-6 py-3">
              <div className="md:hidden">
                <Wordmark />
              </div>
              <button type="button" onClick={() => setDrawerOpen(true)} className="btn btn-quiet ml-auto md:hidden">
                <List aria-hidden size={16} />
                Menu
              </button>
              {collapsed && (
                <button type="button" onClick={toggleCollapsed} className="btn btn-quiet hidden md:inline-flex">
                  <SidebarSimple aria-hidden size={16} />
                  Hiện menu
                </button>
              )}
            </div>
          </header>

          <main className="mx-auto w-full max-w-[56rem] px-6 py-10 sm:py-12">{children}</main>
        </div>
      </div>
      <MascotCorner />
    </>
  )
}
