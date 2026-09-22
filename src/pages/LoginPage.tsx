import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { BookOpen, SignIn } from '@phosphor-icons/react'
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
    <div className="mx-auto max-w-[23rem] pt-6 sm:pt-16">
      <div className="panel p-7">
        <h1 className="flex items-center gap-2 font-serif text-[1.75rem] leading-tight tracking-[-0.015em] text-ink">
          <BookOpen aria-hidden size={24} className="text-accent" />
          Super Vocab
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Hộp thẻ từ vựng của bạn. Tài khoản do quản trị viên cấp.
        </p>

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-8 space-y-5">
          <div>
            <label className="micro mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="field"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label className="micro mb-1.5" htmlFor="password">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              className="field"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && <p className="banner">{error}</p>}

          <button type="submit" disabled={busy} className="btn btn-primary w-full py-2.5">
            <SignIn aria-hidden size={16} />
            {busy ? 'Đang xử lý…' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}
