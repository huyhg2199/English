import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'

import { useMistakes, useNewWordOptions } from '@/app/store-context'
import { MistakeReviewSession } from '@/components/quiz/MistakeReviewSession'
import { Button } from '@/components/ui/button'
import { MISTAKES_HREF } from '@/data/questions'
import { sessionMistakeIds } from '@/lib/quiz'
import { canSpeak } from '@/lib/speech'

type Phase = 'review' | 'done' | 'skipped'

/**
 * Sổ lỗi ở đầu bước Ôn của buổi 30' (story 41): tối đa 5 câu Sổ lỗi đến hạn (ngày tồn ôn 3), hạn sớm trước, chốt lúc vào
 * bước. Ôn đúng như trang Sổ lỗi (mỗi câu chấm ngay: đúng = Nhớ, sai = Quên). Có nút bỏ qua. Đang ôn Sổ lỗi thì chưa hiện
 * `children` (phiên flashcard) vì trùng phím 1–4; xong hoặc bỏ qua thì hiện một dòng trạng thái rồi `children`. Không có
 * câu đến hạn thì chỉ `children`, bước Ôn y như cũ.
 */
export function SessionMistakes({ children }: { children: ReactNode }) {
  const { items } = useMistakes()
  const [now] = useState(() => new Date())
  const { heavyReview } = useNewWordOptions(now)
  const [ids] = useState(() => sessionMistakeIds(items, now, { canSpeak: canSpeak(), heavyReview }))
  const [phase, setPhase] = useState<Phase>('review')

  if (ids.length === 0) return <>{children}</>

  if (phase === 'review') {
    return (
      <>
        <div className="flex flex-col gap-2 rounded-lg border border-primary/40 bg-accent/40 p-3 text-sm">
          <p>
            Sổ lỗi đến hạn: {ids.length} câu. Làm lại trước khi ôn thẻ: đúng thì lịch giãn ra, sai thì gặp lại sớm.
          </p>
          <Button variant="ghost" className="h-auto min-h-9 self-start whitespace-normal" onClick={() => setPhase('skipped')}>
            Bỏ qua, sang ôn thẻ
          </Button>
        </div>
        <MistakeReviewSession ids={ids} headingPrefix="Sổ lỗi" onDone={() => setPhase('done')} />
      </>
    )
  }

  return (
    <>
      {phase === 'done' ? (
        <p className="text-sm text-muted-foreground">Đã ôn {ids.length} câu Sổ lỗi đến hạn.</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Sổ lỗi để sau: các câu còn lại vẫn ở trang{' '}
          <Link to={MISTAKES_HREF} className="text-primary underline-offset-4 hover:underline">
            Sổ lỗi sai
          </Link>
          .
        </p>
      )}
      {children}
    </>
  )
}
