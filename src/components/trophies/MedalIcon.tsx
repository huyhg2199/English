import type { MedalLevel } from '@/lib/trophies'
import { cn } from '@/lib/utils'

/** Màu huy chương theo cấp (tự vẽ, không dùng asset gốc). Khoá = xám đá. */
const FILL: Record<MedalLevel | 'locked', { face: string; rim: string }> = {
  locked: { face: '#3a332b', rim: '#5a5045' },
  bronze: { face: '#c27c45', rim: '#8a5228' },
  silver: { face: '#cfd3d8', rim: '#8e959e' },
  gold: { face: '#f0c44c', rim: '#b38419' },
}

/** Huy chương tròn có dải ruy băng, hình ngôi sao ở giữa. SVG tự vẽ. */
export function MedalIcon({ level, className }: { level: MedalLevel | null; className?: string }) {
  const c = FILL[level ?? 'locked']
  return (
    <svg viewBox="0 0 48 56" className={cn('size-12 shrink-0', className)} aria-hidden="true">
      <path d="M14 2h8l4 16h-8z" fill={level ? 'var(--primary)' : '#4a4138'} opacity="0.85" />
      <path d="M34 2h-8l-4 16h8z" fill={level ? 'var(--accent-foreground)' : '#5a5045'} opacity="0.85" />
      <circle cx="24" cy="36" r="17" fill={c.rim} />
      <circle cx="24" cy="36" r="13.5" fill={c.face} />
      <path
        d="M24 27.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"
        fill={c.rim}
        opacity={level ? 0.9 : 0.6}
      />
    </svg>
  )
}
