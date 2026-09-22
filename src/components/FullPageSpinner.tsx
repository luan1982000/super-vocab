export function FullPageSpinner({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <span aria-hidden className="size-6 animate-spin rounded-full border border-rule border-t-accent" />
      <p className="micro">{label}</p>
    </div>
  )
}
