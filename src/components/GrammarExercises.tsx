import { useState } from 'react'
import { Check, CheckCircle, X } from '@phosphor-icons/react'
import type { GrammarExercise } from '../lib/types'

const LETTERS = ['A', 'B', 'C', 'D']

/**
 * 3 bài tập trắc nghiệm: chọn đáp án là biết đúng/sai ngay, kèm giải thích.
 * Kết quả chỉ để tự kiểm tra, không ghi vào tiến độ.
 */
export function GrammarExercises({ exercises }: { exercises: GrammarExercise[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const answeredCount = Object.keys(answers).length
  const correctCount = exercises.reduce(
    (total, exercise, index) => total + (answers[index] === exercise.answer ? 1 : 0),
    0,
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] text-ink-soft">
        <span className="tnum">
          Đúng{' '}
          <span
            className={`rounded-full px-1.5 py-0.5 font-medium ${
              answeredCount > 0 && correctCount === answeredCount
                ? 'bg-accent/10 text-accent'
                : 'bg-cool/10 text-cool'
            }`}
          >
            {correctCount}/{answeredCount}
          </span>{' '}
          bài đã làm
        </span>
        {answeredCount > 0 && (
          <button type="button" onClick={() => setAnswers({})} className="btn-text px-2">
            Làm lại
          </button>
        )}
      </div>

      {exercises.map((exercise, exerciseIndex) => {
        const selected = answers[exerciseIndex]
        const answered = selected !== undefined
        const correct = selected === exercise.answer

        return (
          <fieldset key={exerciseIndex} className="panel px-4 py-4">
            <legend className="micro px-1">Bài {exerciseIndex + 1}</legend>
            <p className="font-serif text-[1rem] leading-[1.65] text-ink">{exercise.prompt}</p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {exercise.options.map((option, optionIndex) => {
                const isChosen = selected === optionIndex
                const isCorrect = optionIndex === exercise.answer
                const tone = !answered
                  ? 'border-line-strong text-ink hover:border-ink-soft hover:bg-hover'
                  : isCorrect
                    ? 'border-accent bg-accent/15 text-ink'
                    : isChosen
                      ? 'border-danger bg-danger/10 text-ink'
                      : 'border-rule text-ink-soft'

                return (
                  <button
                    key={optionIndex}
                    type="button"
                    aria-pressed={isChosen}
                    aria-label={`${LETTERS[optionIndex]}: ${option}`}
                    disabled={answered}
                    onClick={() => setAnswers((prev) => ({ ...prev, [exerciseIndex]: optionIndex }))}
                    className={`flex min-h-11 items-center gap-2 rounded-ui border px-2.5 py-2 text-left text-[0.9375rem] leading-snug transition-colors ${tone}`}
                  >
                    <span
                      aria-hidden
                      className="tnum flex size-6 shrink-0 items-center justify-center rounded-[4px] border border-current text-[0.75rem]"
                    >
                      {LETTERS[optionIndex]}
                    </span>
                    <span className="min-w-0">{option}</span>
                    {answered && isCorrect && <Check aria-hidden size={15} className="ml-auto shrink-0 text-accent" />}
                    {answered && isChosen && !isCorrect && (
                      <X aria-hidden size={15} className="ml-auto shrink-0 text-danger" />
                    )}
                  </button>
                )
              })}
            </div>

            {answered && (
              <p
                role="status"
                className={`mt-3 rounded-ui border-l-2 px-2.5 py-2 text-[0.8125rem] leading-relaxed ${
                  correct
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-danger bg-danger/10 text-danger'
                }`}
              >
                <strong className="font-medium">
                  {correct ? 'Đúng.' : `Chưa đúng. Đáp án ${LETTERS[exercise.answer]}.`}
                </strong>{' '}
                <span className="text-ink">{exercise.explanation}</span>
              </p>
            )}
          </fieldset>
        )
      })}

      {answeredCount === exercises.length && exercises.length > 0 && (
        <p className="notice" role="status">
          <CheckCircle aria-hidden size={16} className="mt-0.5 shrink-0 text-accent" />
          Đã làm hết {exercises.length} bài. Ghi kết quả ở bảng Tiến độ để đặt lịch ôn lại.
        </p>
      )}
    </div>
  )
}
