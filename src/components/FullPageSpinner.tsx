export function FullPageSpinner({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink-soft">
      <span className="size-7 animate-spin rounded-full border-2 border-rule border-t-pen" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
