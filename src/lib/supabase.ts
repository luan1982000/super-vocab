import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** false khi build thiếu VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. */
export const isSupabaseConfigured = Boolean(url && anonKey)

// Placeholder khi chưa cấu hình: app vẫn render được màn hình cảnh báo thay vì crash trắng trang.
export const supabase = createClient(url || 'http://localhost:54321', anonKey || 'anon-key-not-configured', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
