import { SCOPE_ALL, SCOPE_NONE, type CollectionScope } from './collections'
import { supabase } from './supabase'
import type { CardRow } from './types'

/** Thêm filter AND cho scope vào query builder. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyScope<Q extends { eq: any; is: any }>(query: Q, scope: CollectionScope): Q {
  if (scope === SCOPE_ALL) return query
  if (scope === SCOPE_NONE) return query.is('collection_id', null)
  return query.eq('collection_id', scope)
}

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

  const dueQuery = applyScope(
    supabase.from('cards').select('*').lte('due', nowIso),
    scope,
  )
  const { data, error } = await dueQuery.order('due', { ascending: true }).limit(SESSION_LIMIT)

  if (error) return { cards: [], error: error.message, upcoming: null }

  const cards = data ?? []
  if (cards.length > 0) return { cards, error: null, upcoming: null }

  const upcomingQuery = applyScope(
    supabase.from('cards').select('due').gt('due', nowIso),
    scope,
  )
  const { data: upcoming } = await upcomingQuery.order('due', { ascending: true }).limit(1)

  const countQuery = applyScope(
    supabase.from('cards').select('id', { count: 'exact', head: true }).gte('due', nowIso),
    scope,
  )
  const { count } = await countQuery

  return {
    cards,
    error: null,
    upcoming: upcoming?.[0] ? { due: upcoming[0].due, count: count ?? 0 } : null,
  }
}

/** Số thẻ đến hạn hiện tại (không giới hạn bởi SESSION_LIMIT). */
export async function countDue(scope: CollectionScope): Promise<number> {
  const query = applyScope(
    supabase.from('cards').select('id', { count: 'exact', head: true }).lte('due', new Date().toISOString()),
    scope,
  )
  const { count, error } = await query
  if (error) return 0
  return count ?? 0
}
