import { scopeFilter, type CollectionScope } from './collections'
import { supabase } from './supabase'
import type { CardRow } from './types'

/** Số thẻ tối đa mỗi phiên ôn. */
export const SESSION_LIMIT = 30

export interface PracticeSession {
  cards: CardRow[]
  error: string | null
  /** Chỉ có khi hết thẻ đến hạn: mốc gần nhất và số thẻ sẽ đến hạn. */
  upcoming: { due: string; count: number } | null
}

/** Thẻ đến hạn hôm nay trong phạm vi bộ từ; rỗng thì kèm mốc đến hạn kế tiếp. */
export async function loadPracticeSession(scope: CollectionScope): Promise<PracticeSession> {
  const nowIso = new Date().toISOString()
  const filter = scopeFilter(scope)

  let dueQuery = supabase.from('cards').select('*').lte('due', nowIso)
  if (filter) dueQuery = dueQuery.or(filter)
  const { data, error } = await dueQuery.order('due', { ascending: true }).limit(SESSION_LIMIT)

  if (error) return { cards: [], error: error.message, upcoming: null }

  const cards = data ?? []
  if (cards.length > 0) return { cards, error: null, upcoming: null }

  let upcomingQuery = supabase.from('cards').select('due').gt('due', nowIso)
  if (filter) upcomingQuery = upcomingQuery.or(filter)
  const { data: upcoming } = await upcomingQuery.order('due', { ascending: true }).limit(1)

  let countQuery = supabase.from('cards').select('id', { count: 'exact', head: true }).gte('due', nowIso)
  if (filter) countQuery = countQuery.or(filter)
  const { count } = await countQuery

  return {
    cards,
    error: null,
    upcoming: upcoming?.[0] ? { due: upcoming[0].due, count: count ?? 0 } : null,
  }
}

/** Số thẻ đến hạn hiện tại (không giới hạn bởi SESSION_LIMIT). */
export async function countDue(scope: CollectionScope): Promise<number> {
  const filter = scopeFilter(scope)
  let query = supabase
    .from('cards')
    .select('id', { count: 'exact', head: true })
    .lte('due', new Date().toISOString())
  if (filter) query = query.or(filter)
  const { count, error } = await query
  if (error) return 0
  return count ?? 0
}
