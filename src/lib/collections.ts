import { supabase } from './supabase'
import type { CollectionRow } from './types'

/** Phạm vi đang xem: tất cả, chưa phân loại, hoặc id của một collection. */
export const SCOPE_ALL = 'all'
export const SCOPE_NONE = 'none'
export type CollectionScope = string

export function scopeLabel(scope: CollectionScope, collections: CollectionRow[]): string {
  if (scope === SCOPE_ALL) return 'Tất cả'
  if (scope === SCOPE_NONE) return 'Chưa phân loại'
  return collections.find((collection) => collection.id === scope)?.name ?? 'Không rõ'
}

/** 6 tông thuốc nhuộm nhận diện bộ từ; gán theo id nên đổi tên bộ không đổi màu. */
const TONES = ['rose', 'ochre', 'sage', 'slate', 'mauve', 'clay'] as const
export type CollectionTone = (typeof TONES)[number]

/** Lớp Tailwind cho chấm màu nhận diện (cần literal tĩnh để Tailwind sinh utility). */
export const TONE_BG: Record<CollectionTone, string> = {
  rose: 'bg-tab-rose',
  ochre: 'bg-tab-ochre',
  sage: 'bg-tab-sage',
  slate: 'bg-tab-slate',
  mauve: 'bg-tab-mauve',
  clay: 'bg-tab-clay',
}

export function collectionTone(id: string): CollectionTone {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) hash = (hash * 31 + id.charCodeAt(index)) % 1_000_003
  return TONES[hash % TONES.length]
}

/** Bộ lọc PostgREST cho scope, hoặc null khi xem tất cả. */
export function scopeFilter(scope: CollectionScope): string | null {
  if (scope === SCOPE_ALL) return null
  if (scope === SCOPE_NONE) return 'collection_id.is.null'
  return `collection_id.eq.${scope}`
}

/** Lỗi trùng tên (unique index trên lower(name)). */
function messageFor(error: { code?: string; message: string }): string {
  if (error.code === '23505') return 'Bộ từ này đã tồn tại.'
  return error.message
}

export async function loadCollections(): Promise<{ collections: CollectionRow[]; error: string | null }> {
  const { data, error } = await supabase.from('collections').select('*').order('name', { ascending: true })
  if (error) return { collections: [], error: error.message }
  return { collections: data ?? [], error: null }
}

export async function createCollection(name: string): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase.from('collections').insert({ name: name.trim() }).select('id').single()
  if (error) return { id: null, error: messageFor(error) }
  return { id: data.id, error: null }
}

export async function renameCollection(id: string, name: string): Promise<string | null> {
  const { error } = await supabase.from('collections').update({ name: name.trim() }).eq('id', id)
  return error ? messageFor(error) : null
}

/** Xóa collection: các từ bên trong chuyển về "Chưa phân loại" (FK on delete set null). */
export async function deleteCollection(id: string): Promise<string | null> {
  const { error } = await supabase.from('collections').delete().eq('id', id)
  return error ? error.message : null
}
