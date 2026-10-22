import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  BookOpen,
  BookOpenText,
  Cards,
  List,
  ListBullets,
  SidebarSimple,
  SignOut,
  SquaresFour,
  X,
} from "@phosphor-icons/react";
import { useAuth } from "../hooks/useAuth";
import { MascotCorner } from "./MascotCorner";

const COLLAPSE_KEY = "super-vocab.nav-collapsed";

/** Mục đang chọn: nền nhấn nhạt + một vạch xanh rêu bên trái để nhìn ra ngay khi lướt. */
const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative flex min-h-11 items-center gap-3 rounded-ui px-3 py-2 text-[0.9375rem] transition-colors before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:transition-colors ${
    isActive
      ? "bg-accent-wash font-medium text-accent before:bg-accent"
      : "text-ink-soft before:bg-transparent hover:bg-hover hover:text-ink"
  }`;

function Wordmark() {
  return (
    <Link
      to="/vocab"
      className="flex items-center gap-2.5 rounded-ui font-serif text-[1.1875rem] font-medium tracking-[-0.015em] text-ink"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-ui bg-accent text-on-accent">
        <BookOpen aria-hidden size={18} weight="fill" />
      </span>
      Super Vocab
    </Link>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <NavLink to="/vocab" end onClick={onNavigate} className={navLinkClass}>
        <ListBullets aria-hidden size={20} />
        Từ vựng
      </NavLink>
      <NavLink to="/vocab/list" onClick={onNavigate} className={navLinkClass}>
        <SquaresFour aria-hidden size={20} />
        Danh sách từ
      </NavLink>
      <NavLink to="/grammar" onClick={onNavigate} className={navLinkClass}>
        <BookOpenText aria-hidden size={20} />
        Ngữ pháp
      </NavLink>
      <NavLink to="/practice" onClick={onNavigate} className={navLinkClass}>
        <Cards aria-hidden size={20} />
        Ôn tập
      </NavLink>
    </>
  );
}

function Account({
  email,
  onSignOut,
}: {
  email: string;
  onSignOut: () => void;
}) {
  return (
    <div className="space-y-3 border-t border-rule pt-4">
      <div className="flex items-center gap-3 px-1">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-wash font-serif text-[1rem] font-medium uppercase text-accent"
        >
          {email.trim().charAt(0) || "?"}
        </span>
        <p
          className="min-w-0 truncate text-[0.8125rem] leading-snug text-ink-soft"
          title={email}
        >
          {email}
        </p>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="btn btn-quiet w-full justify-start"
      >
        <SignOut aria-hidden size={16} />
        Đăng xuất
      </button>
    </div>
  );
}

/**
 * Khung trang: menu dọc bên trái (thu gọn được, nhớ trạng thái), drawer cho màn hẹp,
 * và linh vật ở góc. Chưa đăng nhập thì chỉ có thanh trên tối giản.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { session, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === "1",
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  };

  if (!session) {
    return (
      <>
        <div className="min-h-screen bg-paper text-ink">
          <header className="border-b border-rule">
            <div className="mx-auto flex max-w-[56rem] items-center px-5 py-3.5 sm:px-6">
              <Wordmark />
            </div>
          </header>
          <main className="mx-auto w-full max-w-[56rem] px-5 py-8 sm:px-6 sm:py-12">
            {children}
          </main>
        </div>
        <MascotCorner showFrom="min-[680px]:block" />
      </>
    );
  }

  const onSignOut = () => void signOut();

  return (
    <>
      <div className="min-h-screen bg-paper text-ink md:flex">
        {!collapsed && (
          <aside className="sticky top-0 hidden h-screen w-[15rem] shrink-0 flex-col border-r border-rule bg-paper px-3 py-5 md:flex">
            <div className="flex items-center justify-between gap-2 pl-2">
              <Wordmark />
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label="Ẩn menu"
                title="Ẩn menu"
                className="btn-text -mr-1"
              >
                <SidebarSimple aria-hidden size={18} />
              </button>
            </div>
            <nav
              aria-label="Điều hướng chính"
              className="mt-8 flex flex-col gap-1"
            >
              <NavItems />
            </nav>
            <div className="mt-auto">
              <Account email={session.user.email ?? ""} onSignOut={onSignOut} />
            </div>
          </aside>
        )}

        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div
              className="scrim-in absolute inset-0 bg-scrim"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="drawer-in absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col border-r border-rule bg-paper px-3 py-5 shadow-[var(--shadow-modal)]">
              <div className="flex items-center justify-between gap-2 pl-2">
                <Wordmark />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Đóng"
                  className="btn-text -mr-1"
                >
                  <X aria-hidden size={18} />
                </button>
              </div>
              <nav
                aria-label="Điều hướng chính"
                className="mt-8 flex flex-col gap-1"
              >
                <NavItems onNavigate={() => setDrawerOpen(false)} />
              </nav>
              <div className="mt-auto">
                <Account
                  email={session.user.email ?? ""}
                  onSignOut={onSignOut}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className={`sticky top-0 z-20 border-b border-rule bg-paper/85 backdrop-blur-md ${collapsed ? "" : "md:hidden"}`}
          >
            <div className="flex items-center gap-3 px-5 py-2.5 sm:px-6">
              <div className="md:hidden">
                <Wordmark />
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="btn btn-quiet ml-auto md:hidden"
              >
                <List aria-hidden size={16} />
                Menu
              </button>
              {collapsed && (
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  className="btn btn-quiet hidden md:inline-flex"
                >
                  <SidebarSimple aria-hidden size={16} />
                  Hiện menu
                </button>
              )}
            </div>
          </header>

          <main className="mx-auto w-full max-w-[56rem] px-5 py-8 sm:px-6 sm:py-12">
            {children}
          </main>
        </div>
      </div>
      <MascotCorner />
    </>
  );
}
