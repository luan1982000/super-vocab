import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowClockwise, PencilSimple } from '@phosphor-icons/react'
import { Breadcrumb } from '../components/Breadcrumb'
import { FullPageSpinner } from '../components/FullPageSpinner'
import { GrammarContent } from '../components/GrammarContent'
import { GrammarExercises } from '../components/GrammarExercises'
import { GrammarProgressPanel, GrammarStatusBadge } from '../components/GrammarProgressPanel'
import { GrammarTopicEditor } from '../components/GrammarTopicEditor'
import { Modal } from '../components/Modal'
import { useGrammar } from '../hooks/useGrammar'
import { GRAMMAR_STAGE_TITLES, GRAMMAR_STAGE_TONES, reviewedPatch } from '../lib/grammar'
import type { GrammarProgressInput, GrammarTopicContentInput } from '../lib/types'

/** Chi tiết chủ đề: bài học, ví dụ, 3 bài tập; bảng tiến độ theo user ở cột phải. */
export function GrammarDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  // Đổi chủ đề thì remount để mọi trạng thái cục bộ (đã lưu, modal, lỗi) trở về mặc định.
  return <GrammarDetailView key={slug} slug={slug ?? ''} />
}

function GrammarDetailView({ slug }: { slug: string }) {
  const { topics, loading, error, today, reload, saveProgress, saveContent } = useGrammar()
  const [progressBusy, setProgressBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [progressError, setProgressError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [contentBusy, setContentBusy] = useState(false)
  const [contentError, setContentError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const topic = topics.find((item) => item.slug === slug)

  const applyProgress = async (patch: GrammarProgressInput): Promise<boolean> => {
    if (!topic) return false
    setProgressBusy(true)
    setSaved(false)
    setProgressError(null)
    const saveError = await saveProgress(topic.id, patch)
    setProgressBusy(false)
    if (saveError) {
      setProgressError(saveError)
      return false
    }
    setSaved(true)
    return true
  }

  const handleReview = async () => {
    if (!topic) return
    const patch = reviewedPatch(topic.progress, today)
    if (await applyProgress(patch)) {
      setNotice('Đã ghi nhận buổi ôn hôm nay và cập nhật ngày ôn tiếp.')
    }
  }

  const handleContentSave = async (input: GrammarTopicContentInput) => {
    if (!topic) return
    setContentBusy(true)
    setContentError(null)
    const saveError = await saveContent(topic.id, input)
    setContentBusy(false)
    if (saveError) {
      setContentError(saveError)
      return
    }
    setEditing(false)
    setNotice('Đã lưu nội dung chủ đề. Nội dung dùng chung cho mọi tài khoản.')
  }

  if (loading) return <FullPageSpinner label="Đang tải chủ đề…" />

  if (error) {
    return (
      <div className="space-y-5">
        <Breadcrumb items={[{ label: 'Ngữ pháp', to: '/grammar' }, { label: 'Chủ đề' }]} />
        <div className="banner flex flex-wrap items-center gap-3">
          <span>Không tải được dữ liệu: {error}</span>
          <button type="button" onClick={() => void reload()} className="btn-text font-medium text-ink underline">
            <ArrowClockwise aria-hidden size={16} />
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="space-y-5">
        <Breadcrumb items={[{ label: 'Ngữ pháp', to: '/grammar' }, { label: 'Không tìm thấy' }]} />
        <div className="flex flex-col items-start gap-3 rounded-ui border border-dashed border-line-strong px-6 py-12">
          <p className="text-sm leading-relaxed text-ink-soft">
            Không có chủ đề với đường dẫn “{slug}”. Có thể nội dung đã đổi tên.
          </p>
          <Link to="/grammar" className="btn btn-quiet">
            Về danh sách ngữ pháp
          </Link>
        </div>
      </div>
    )
  }

  const status = topic.progress?.status ?? 'not_started'
  const stageTone = GRAMMAR_STAGE_TONES[topic.stage]

  return (
    <div className="space-y-7">
      <Breadcrumb items={[{ label: 'Ngữ pháp', to: '/grammar' }, { label: topic.title }]} />

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.75rem] font-medium ${stageTone.tile}`}
          >
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current opacity-60" />
            Giai đoạn {topic.stage} — {GRAMMAR_STAGE_TITLES[topic.stage]}
          </span>
          <GrammarStatusBadge status={status} />
          {topic.is_new && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-tab-rose px-2.5 py-1 text-[0.8125rem] font-medium text-highlighter-ink">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-highlighter-ink/60" />
              Mới
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-start gap-3">
          <div className="w-full min-w-0 sm:flex-1">
            <h1 className="max-w-[28ch] font-serif text-[1.75rem] leading-[1.2] font-medium tracking-[-0.015em] text-ink [text-wrap:balance]">
              {topic.title}
            </h1>
            {topic.title_en && topic.title_en.trim().toLowerCase() !== topic.title.trim().toLowerCase() && (
              <p className="mt-1 text-[0.9375rem] text-ink-soft">{topic.title_en}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setContentError(null)
              setEditing(true)
            }}
            className="btn btn-quiet w-full shrink-0 sm:w-auto"
          >
            <PencilSimple aria-hidden size={16} />
            Sửa nội dung
          </button>
        </div>

        <p className="mt-3 max-w-[65ch] text-[1rem] leading-[1.7] text-ink">{topic.summary}</p>
      </header>

      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="order-1 space-y-10">
          <section aria-labelledby="grammar-knowledge">
            <h2
              id="grammar-knowledge"
              className="border-b border-rule pb-2 font-serif text-[1.125rem] font-medium tracking-[-0.01em] text-ink"
            >
              Kiến thức
            </h2>
            <div className="mt-3">
              <GrammarContent content={topic.content} />
            </div>
          </section>

          <section aria-labelledby="grammar-examples">
            <h2
              id="grammar-examples"
              className="border-b border-rule pb-2 font-serif text-[1.125rem] font-medium tracking-[-0.01em] text-ink"
            >
              Ví dụ
            </h2>
            <ul className="mt-1 list-none">
              {topic.examples.map((example, index) => (
                <li
                  key={index}
                  className="border-b border-rule py-3 last:border-b-0"
                >
                  <p className="font-serif text-[1.0625rem] leading-[1.7] text-ink">{example.en}</p>
                  <p className="mt-0.5 text-[0.9375rem] leading-relaxed text-ink-soft">{example.vi}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="grammar-exercises">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule pb-2">
              <h2
                id="grammar-exercises"
                className="font-serif text-[1.125rem] font-medium tracking-[-0.01em] text-ink"
              >
                Bài tập
              </h2>
              <span className="text-[0.8125rem] text-ink-soft">Tự kiểm tra trước khi ghi tiến độ</span>
            </div>
            <div className="mt-3">
              <GrammarExercises key={topic.id} exercises={topic.exercises} />
            </div>
          </section>
        </div>

        <aside className="order-2 lg:sticky lg:top-6">
          <GrammarProgressPanel
            topic={topic}
            today={today}
            busy={progressBusy}
            saved={saved}
            error={progressError}
            onSave={(patch) => void applyProgress(patch)}
            onReview={() => void handleReview()}
          />
        </aside>
      </div>

      <Modal open={editing} title="Sửa nội dung chủ đề" onClose={() => setEditing(false)}>
        <GrammarTopicEditor
          topic={topic}
          busy={contentBusy}
          error={contentError}
          onSubmit={(input) => void handleContentSave(input)}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  )
}
