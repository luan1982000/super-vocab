import { isSupabaseConfigured } from '../lib/supabase'

export function ConfigNotice() {
  if (isSupabaseConfigured) return null

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-500/40 dark:bg-amber-500/10">
        <h1 className="text-lg font-bold text-amber-900 dark:text-amber-200">Chưa cấu hình Supabase</h1>
        <p className="mt-2 text-sm text-amber-900/90 dark:text-amber-200/90">
          Build này thiếu biến môi trường <code className="font-mono">VITE_SUPABASE_URL</code> và{' '}
          <code className="font-mono">VITE_SUPABASE_ANON_KEY</code>.
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-amber-900/90 dark:text-amber-200/90">
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
