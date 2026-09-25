import { useCallback, useState } from 'react'
import { SCOPE_ALL, SCOPE_NONE, type CollectionScope } from '../lib/collections'
import { useCollections } from './useCollections'

/** Khóa localStorage dùng chung giữa các chế độ ôn tập. */
export const SCOPE_KEY = 'super-vocab.scope'

/**
 * Phạm vi bộ từ đang chọn cho phiên ôn. Flashcard và writing dùng chung một phạm vi
 * (đồng bộ qua localStorage), nên chọn bộ ở màn chế độ là áp cho cả hai.
 */
export function useCollectionScope() {
  const { collections, loading, error, reload } = useCollections()
  const [storedScope, setStoredScope] = useState<CollectionScope>(() => localStorage.getItem(SCOPE_KEY) || SCOPE_ALL)

  // Bộ đã lưu có thể đã bị xoá ở phiên trước → coi như "Tất cả" thay vì lọc vào id chết.
  const scopeIsCollection = storedScope !== SCOPE_ALL && storedScope !== SCOPE_NONE
  const scope =
    scopeIsCollection && !loading && !collections.some((item) => item.id === storedScope) ? SCOPE_ALL : storedScope

  const changeScope = useCallback((next: CollectionScope) => {
    localStorage.setItem(SCOPE_KEY, next)
    setStoredScope(next)
  }, [])

  return {
    collections,
    collectionsLoading: loading,
    collectionsError: error,
    reloadCollections: reload,
    scope,
    changeScope,
  }
}
