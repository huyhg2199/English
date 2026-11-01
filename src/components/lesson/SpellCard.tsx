import { Lock, Sparkles } from 'lucide-react'

import type { Spell } from '@/data/lessons'
import { cn } from '@/lib/utils'

/** Thẻ thần chú: mở khoá khi bài chứa thì đó được đánh dấu xong (chỉ phản ánh tiến độ, không phạt). */
export function SpellCard({ spell, unlocked }: { spell: Spell; unlocked: boolean }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 transition-shadow',
        unlocked ? 'border-primary/60 bg-accent/40 shadow-[0_0_16px_var(--candle-glow)]' : 'border-dashed opacity-80',
      )}
    >
      {unlocked ? (
        <Sparkles className="mt-0.5 size-5 shrink-0 text-primary drop-shadow-[0_0_6px_var(--candle-glow)]" aria-hidden="true" />
      ) : (
        <Lock className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
      <div className="min-w-0 text-sm">
        <p className="font-semibold">
          Thần chú {spell.name}{' '}
          <span className={cn('text-xs font-normal', unlocked ? 'text-primary' : 'text-muted-foreground')}>
            {unlocked ? '· đã mở khoá' : '· chưa mở'}
          </span>
        </p>
        <p className="text-muted-foreground">{spell.description}</p>
        {!unlocked && <p className="mt-1 text-xs text-muted-foreground">Đánh dấu bài này đã học xong để mở khoá.</p>}
      </div>
    </div>
  )
}
