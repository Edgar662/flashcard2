export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <p className="text-lg font-medium">Page not found</p>
      <a href="/" className="text-primary underline">
        Back to your decks
      </a>
    </div>
  )
}
