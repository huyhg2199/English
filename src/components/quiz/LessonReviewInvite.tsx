import { RotateCcw } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { getLesson, SECTION_TITLES, sectionHref, type SectionId } from '@/data/roadmap'
import type { LessonReviewInvite as Invite } from '@/lib/quiz'
import { cn } from '@/lib/utils'

/**
 * Dải mời "Ôn lại bài: <tên bài>?" trên Hôm nay (story 41): gần đây có từ 2 câu sai về thì của cùng một bài. Cùng khung với
 * dải mời ôn viên gạch (story 28): chỉ là lời mời nhẹ, không chặn gì. "Ôn lại bài" mở đoạn có nhiều câu sai nhất, "Để sau"
 * ẩn tới khi có câu sai mới.
 */
export function LessonReviewInvite({
  invite,
  onDismiss,
  className,
}: {
  invite: Invite
  onDismiss: (lessonId: string) => void
  className?: string
}) {
  const lesson = getLesson(invite.lessonId)
  if (!lesson) return null
  const section = SECTION_TITLES[invite.sectionId as SectionId] ?? invite.sectionId
  return (
    <div
      role="status"
      className={cn('flex flex-col gap-2 rounded-xl border border-primary/50 bg-accent/40 px-3 py-2 text-sm', className)}
    >
      <div className="flex items-start gap-3">
        <RotateCcw className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="font-semibold break-words">Ôn lại bài: {lesson.title}?</p>
          <p className="break-words text-muted-foreground">
            Gần đây có {invite.questionIds.length} câu sai về thì của bài này. Ôn lại đoạn {section} rồi làm kiểm tra bài nhé.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pl-8">
        <Button asChild size="sm" className="min-h-9">
          <Link to={sectionHref(lesson.id, invite.sectionId)}>Ôn lại bài</Link>
        </Button>
        <Button variant="ghost" size="sm" className="min-h-9" onClick={() => onDismiss(lesson.id)}>
          Để sau
        </Button>
      </div>
    </div>
  )
}
