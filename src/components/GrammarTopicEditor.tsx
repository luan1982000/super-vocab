import { useState, type FormEvent } from 'react'
import { Check, Plus, Trash, X } from '@phosphor-icons/react'
import type {
  GrammarExample,
  GrammarExercise,
  GrammarTopic,
  GrammarTopicContentInput,
} from '../lib/types'

const EXERCISE_COUNT = 3

/** Bài tập luôn đủ 3 mục để khớp yêu cầu "3 bài tập" và tránh mảng rỗng khi sửa. */
function filledExercises(source: GrammarExercise[]): GrammarExercise[] {
  return Array.from({ length: EXERCISE_COUNT }, (_, index) => {
    const item = source[index]
    return {
      prompt: item?.prompt ?? '',
      options: [
        item?.options[0] ?? '',
        item?.options[1] ?? '',
        item?.options[2] ?? '',
        item?.options[3] ?? '',
      ],
      answer: item?.answer ?? 0,
      explanation: item?.explanation ?? '',
    }
  })
}

interface GrammarTopicEditorProps {
  topic: GrammarTopic
  busy: boolean
  error: string | null
  onSubmit: (input: GrammarTopicContentInput) => void
  onCancel: () => void
}

/** Sửa nội dung dùng chung: tiêu đề, tóm tắt, bài giảng Markdown-lite, ví dụ, 3 bài tập. */
export function GrammarTopicEditor({ topic, busy, error, onSubmit, onCancel }: GrammarTopicEditorProps) {
  const [title, setTitle] = useState(topic.title)
  const [titleEn, setTitleEn] = useState(topic.title_en ?? '')
  const [summary, setSummary] = useState(topic.summary)
  const [content, setContent] = useState(topic.content)
  const [examples, setExamples] = useState<GrammarExample[]>(topic.examples)
  const [exercises, setExercises] = useState<GrammarExercise[]>(() => filledExercises(topic.exercises))
  const [formError, setFormError] = useState<string | null>(null)

  const updateExample = (index: number, patch: Partial<GrammarExample>) => {
    setExamples((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }

  const updateExercise = (index: number, patch: Partial<GrammarExercise>) => {
    setExercises((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }

  const updateOption = (exerciseIndex: number, optionIndex: number, value: string) => {
    setExercises((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === exerciseIndex
          ? { ...item, options: item.options.map((option, oi) => (oi === optionIndex ? value : option)) }
          : item,
      ),
    )
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || !summary.trim() || !content.trim()) {
      setFormError('Tên, tóm tắt và nội dung không được để trống.')
      return
    }
    if (examples.length === 0) {
      setFormError('Cần ít nhất một ví dụ.')
      return
    }
    const blankExample = examples.findIndex((item) => !item.en.trim() || !item.vi.trim())
    if (blankExample >= 0) {
      setFormError(`Điền đủ câu tiếng Anh và nghĩa cho ví dụ ${blankExample + 1}.`)
      return
    }
    const blankExercise = exercises.findIndex(
      (item) =>
        !item.prompt.trim() ||
        !item.explanation.trim() ||
        item.options.some((option) => !option.trim()),
    )
    if (blankExercise >= 0) {
      setFormError(`Bài tập ${blankExercise + 1} cần đủ câu hỏi, 4 lựa chọn và giải thích.`)
      return
    }
    if (exercises.some((item) => item.answer < 0 || item.answer >= item.options.length)) {
      setFormError('Đáp án đúng của bài tập phải nằm trong 4 lựa chọn.')
      return
    }

    setFormError(null)
    onSubmit({
      title: title.trim(),
      title_en: titleEn.trim() || null,
      summary: summary.trim(),
      content: content.trim(),
      examples: examples.map((item) => ({ en: item.en.trim(), vi: item.vi.trim() })),
      exercises: exercises.map((item) => ({
        ...item,
        prompt: item.prompt.trim(),
        options: item.options.map((option) => option.trim()),
        explanation: item.explanation.trim(),
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="micro">Tên chủ đề</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="field mt-1" />
        </label>
        <label className="block">
          <span className="micro">Tên tiếng Anh</span>
          <input value={titleEn} onChange={(event) => setTitleEn(event.target.value)} className="field mt-1" />
        </label>
      </div>

      <label className="block">
        <span className="micro">Tóm tắt</span>
        <textarea
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          rows={2}
          className="field mt-1"
        />
      </label>

      <label className="block">
        <span className="micro">Nội dung</span>
        <span className="mb-1 block text-[0.75rem] leading-relaxed text-ink-soft">
          Dùng <code className="rounded border border-rule bg-paper px-1">### </code> cho tiêu đề mục,{' '}
          <code className="rounded border border-rule bg-paper px-1">- </code> cho gạch đầu dòng,{' '}
          <code className="rounded border border-rule bg-paper px-1">**đậm**</code> cho dạng cấu trúc.
        </span>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={12}
          className="field mt-1"
        />
      </label>

      <fieldset>
        <div className="flex items-center justify-between gap-3">
          <legend className="micro">Ví dụ</legend>
          <button
            type="button"
            onClick={() => setExamples((prev) => [...prev, { en: '', vi: '' }])}
            className="btn-text"
          >
            <Plus aria-hidden size={15} />
            Thêm ví dụ
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {examples.map((example, index) => (
            <div key={index} className="well space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.75rem] font-medium text-ink-soft">Ví dụ {index + 1}</span>
                <button
                  type="button"
                  onClick={() => setExamples((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                  disabled={examples.length <= 1}
                  aria-label={`Xóa ví dụ ${index + 1}`}
                  className="btn-text hover:text-danger"
                >
                  <Trash aria-hidden size={15} />
                  Xóa
                </button>
              </div>
              <input
                value={example.en}
                onChange={(event) => updateExample(index, { en: event.target.value })}
                placeholder="Câu tiếng Anh"
                aria-label={`Câu tiếng Anh ví dụ ${index + 1}`}
                className="field"
              />
              <input
                value={example.vi}
                onChange={(event) => updateExample(index, { vi: event.target.value })}
                placeholder="Nghĩa tiếng Việt"
                aria-label={`Nghĩa tiếng Việt ví dụ ${index + 1}`}
                className="field"
              />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="micro">3 bài tập</legend>
        <div className="mt-2 space-y-3">
          {exercises.map((exercise, index) => (
            <div key={index} className="well space-y-2">
              <span className="text-[0.75rem] font-medium text-ink-soft">Bài {index + 1}</span>
              <textarea
                value={exercise.prompt}
                onChange={(event) => updateExercise(index, { prompt: event.target.value })}
                placeholder="Câu hỏi, dùng ___ cho chỗ trống"
                aria-label={`Câu hỏi bài ${index + 1}`}
                rows={2}
                className="field"
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {exercise.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="block">
                    <span className="mb-0.5 block text-[0.75rem] text-ink-soft">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <input
                      value={option}
                      onChange={(event) => updateOption(index, optionIndex, event.target.value)}
                      aria-label={`Lựa chọn ${String.fromCharCode(65 + optionIndex)} bài ${index + 1}`}
                      className="field"
                    />
                  </label>
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="block">
                  <span className="micro">Đáp án đúng</span>
                  <select
                    value={exercise.answer}
                    onChange={(event) => updateExercise(index, { answer: Number(event.target.value) })}
                    className="field mt-1"
                  >
                    {exercise.options.map((option, optionIndex) => (
                      <option key={optionIndex} value={optionIndex}>
                        {String.fromCharCode(65 + optionIndex)} — {option.trim() || 'chưa nhập'}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="micro">Giải thích</span>
                  <input
                    value={exercise.explanation}
                    onChange={(event) => updateExercise(index, { explanation: event.target.value })}
                    className="field mt-1"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      {(formError || error) && <p className="banner">{formError ?? error}</p>}

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className="btn btn-primary">
          <Check aria-hidden size={16} />
          {busy ? 'Đang lưu…' : 'Lưu nội dung'}
        </button>
        <button type="button" onClick={onCancel} disabled={busy} className="btn btn-quiet">
          <X aria-hidden size={16} />
          Hủy
        </button>
      </div>
    </form>
  )
}
