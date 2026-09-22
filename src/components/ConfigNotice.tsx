import { WarningCircle } from '@phosphor-icons/react'
import { isSupabaseConfigured } from '../lib/supabase'

export function ConfigNotice() {
  if (isSupabaseConfigured) return null

  return (
    <div className="mx-auto max-w-[40rem] p-6">
      <div className="banner banner-warn p-6">
        <h1 className="flex items-center gap-2 font-serif text-[1.25rem] font-medium tracking-[-0.01em] text-ink">
          <WarningCircle aria-hidden size={20} className="shrink-0 text-warn" />
          Chưa cấu hình Supabase
        </h1>
        <p className="mt-2">
          Build này thiếu biến môi trường <code className="font-mono">VITE_SUPABASE_URL</code> và{' '}
          <code className="font-mono">VITE_SUPABASE_ANON_KEY</code>.
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>
            Tạo project Supabase, chạy <code className="font-mono">supabase/schema.sql</code> trong SQL Editor.
          </li>
          <li>
            Copy <code className="font-mono">.env.example</code> thành <code className="font-mono">.env.local</code> và
            điền URL + anon key.
          </li>
          <li>
            Khi deploy: thêm 2 secrets cùng tên trong GitHub repo (Settings → Secrets and variables → Actions) rồi
            chạy lại workflow.
          </li>
        </ol>
      </div>
    </div>
  )
}
