import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { CardRow } from '../lib/types'

/**
 * Toàn bộ từ của user, mới nhất trước. Dùng chung cho trang thêm từ (kiểm trùng, đếm theo bộ)
 * và trang danh sách (lọc + phân trang phía client).
 */
export function useCards() {
  const [rows, setRows] = useState<CardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Mốc so sánh "quá hạn": lấy lúc nạp dữ liệu để render không gọi Date.now().
  const [now, setNow] = useState(0)

  const load = useCallback(async () => {
    const stamp = Date.now()
    const { data, error: loadError } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })
    if (loadError) setError(loadError.message)
    else setRows(data ?? [])
    setNow(stamp)
    setLoading(false)
  }, [])

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    void load()
  }, [load])

  useEffect(() => {
    // async IIFE: state chỉ được set sau `await` (react/set-state-in-effect).
    void (async () => {
      await load()
    })()
  }, [load])

  return { rows, setRows, loading, error, now, reload }
}
