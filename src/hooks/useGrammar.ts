import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { mergeGrammarTopics, todayISO } from '../lib/grammar'
import { supabase } from '../lib/supabase'
import type {
  GrammarProgressInput,
  GrammarProgressRow,
  GrammarTopic,
  GrammarTopicContentInput,
  GrammarTopicRow,
} from '../lib/types'

/**
 * Toàn bộ chủ đề ngữ pháp (nội dung dùng chung) + tiến độ của user hiện tại.
 * 49 chủ đề nên nạp hết một lần, lọc/tìm ở client.
 */
export function useGrammar() {
  const { session } = useAuth()
  const userId = session?.user.id
  const [topics, setTopics] = useState<GrammarTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Mốc "hôm nay" lấy lúc nạp; đổi ngày thì tải lại trang.
  const [today, setToday] = useState(() => todayISO())

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    const [topicsResult, progressResult] = await Promise.all([
      supabase.from('grammar_topics').select('*').order('stage').order('position'),
      supabase.from('grammar_progress').select('*').eq('user_id', userId),
    ])

    if (topicsResult.error || progressResult.error) {
      setError(topicsResult.error?.message ?? progressResult.error?.message ?? 'Không tải được dữ liệu ngữ pháp.')
      setLoading(false)
      return
    }

    setTopics(mergeGrammarTopics(topicsResult.data ?? [], progressResult.data ?? []))
    setToday(todayISO())
    setLoading(false)
  }, [userId])

  useEffect(() => {
    // async IIFE: state chỉ được set sau `await` (react/set-state-in-effect).
    void (async () => {
      await load()
    })()
  }, [load])

  const saveProgress = useCallback(
    async (topicId: string, patch: GrammarProgressInput): Promise<string | null> => {
      if (!userId) return 'Chưa đăng nhập.'
      const { data, error: saveError } = await supabase
        .from('grammar_progress')
        .upsert(
          {
            user_id: userId,
            topic_id: topicId,
            ...patch,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,topic_id' },
        )
        .select()
        .single()

      if (saveError) return saveError.message
      const saved = data as GrammarProgressRow
      setTopics((prev) =>
        prev.map((topic) => (topic.id === topicId ? { ...topic, progress: saved } : topic)),
      )
      return null
    },
    [userId],
  )

  const saveContent = useCallback(
    async (topicId: string, input: GrammarTopicContentInput): Promise<string | null> => {
      const { data, error: saveError } = await supabase
        .from('grammar_topics')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', topicId)
        .select()
        .single()

      if (saveError) return saveError.message
      const saved = data as GrammarTopicRow
      setTopics((prev) =>
        prev.map((topic) => (topic.id === topicId ? { ...topic, ...saved } : topic)),
      )
      return null
    },
    [],
  )

  return { topics, loading, error, today, reload: load, saveProgress, saveContent }
}
