/** Coração de traço fino (favorito). */
export function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5 transition-transform duration-300 ease-elegant motion-safe:active:scale-90"
      fill={filled ? 'currentColor' : 'rgba(252,251,248,0.85)'}
      stroke="currentColor"
      strokeWidth="1.25"
    >
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  )
}
