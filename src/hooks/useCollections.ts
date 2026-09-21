import { useCallback, useEffect, useState } from 'react'
import { loadCollections } from '../lib/collections'
import type { CollectionRow } from '../lib/types'

export function useCollections() {
  const [collections, setCollections] = useState<CollectionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    const { collections: next, error: loadError } = await loadCollections()
    if (loadError) setError(loadError)
    else {
      setCollections(next)
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // async IIFE: state chỉ được set sau `await` (react/set-state-in-effect).
    void (async () => {
      await reload()
    })()
  }, [reload])

  return { collections, loading, error, reload }
}
