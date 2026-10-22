/** Mức độ nắm 1–5: chấm đặc cho mức đã đạt, chấm rỗng cho mức còn lại. */
export function MasteryDots({ value }: { value: number | null }) {
  return (
    <span
      className="inline-flex items-center gap-[3px] align-middle"
      role="img"
      aria-label={value === null ? 'Chưa đánh giá mức độ nắm' : `Mức độ nắm ${value} trên 5`}
    >
      {[1, 2, 3, 4, 5].map((level) => (
        <span
          key={level}
          aria-hidden
          className={`size-[7px] rounded-full ${
            value !== null && level <= value ? 'bg-accent' : 'border border-line-strong'
          }`}
        />
      ))}
    </span>
  )
}
