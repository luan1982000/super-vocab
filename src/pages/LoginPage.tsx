import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import type { AuthError } from '@supabase/supabase-js'
import { useAuth } from '../hooks/useAuth'

function authErrorMessage(error: AuthError): string {
  const message = error.message.toLowerCase()
  if (message.includes('invalid login credentials')) return 'Email hoặc mật khẩu không đúng.'
  if (message.includes('email not confirmed')) return 'Email chưa được xác nhận. Liên hệ quản trị viên.'
  if (message.includes('signups not allowed')) return 'Tài khoản này không tồn tại.'
  if (message.includes('rate limit') || message.includes('too many'))
    return 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.'
  return error.message
}

const fieldClass =
  'w-full rounded-sm border border-line-strong bg-card px-3 py-2 text-base text-ink outline-none transition focus:border-pen'
const labelClass = 'mb-1 block text-sm text-ink-soft'

export function LoginPage() {
  const { session, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (session) return <Navigate to="/vocab" replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const { error: signInError } = await signIn(email.trim(), password)
    if (signInError) setError(authErrorMessage(signInError))
    else navigate('/vocab', { replace: true })
    setBusy(false)
  }

  return (
    <div className="mx-auto max-w-[22rem] pt-10">
      {/* Bìa hộp thẻ: nameplate + một câu, không minh hoạ. */}
      <div className="rounded-md border border-rule bg-card p-6 shadow-[var(--stack-shadow)]">
        <h1 className="font-serif text-[1.5rem] font-semibold text-ink">Super Vocab</h1>
        <div className="mt-2 border-b border-rule" />
        <p className="mt-3 text-sm text-ink-soft">
          Hộp thẻ từ vựng của bạn. Tài khoản do quản trị viên cấp.
        </p>

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 space-y-3">
          <div>
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className={fieldClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="password">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              className={fieldClass}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && <p className="border-l-[3px] border-red-pen bg-red-pen/8 px-3 py-2 text-sm text-ink">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-pen px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {busy ? 'Đang xử lý…' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}
