import { useState, type ReactNode } from 'react'
import { Check, Eye, X } from 'lucide-react'

import { ListenButton } from '@/components/ListenButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MistakeWord } from '@/lib/quiz'
import { cn } from '@/lib/utils'

import { TagBadge } from './QuestionCard'

type Props = {
  word: MistakeWord
  tag: string
  heading: string
  /** Đã chấm (null = chưa). */
  graded: boolean | null
  onGrade: (correct: boolean) => void
  footer?: ReactNode
}

/**
 * Ôn một từ đọc chưa đúng (O.W.L.) bằng tự chấm: hiện IPA, Huy đọc to, xem từ + nghe mẫu rồi bấm
 * "Mình đọc đúng" / "Chưa đúng".
 */
export function WordReviewCard({ word, tag, heading, graded, onGrade, footer }: Props) {
  const [revealed, setRevealed] = useState(false)
  const show = revealed || graded !== null
  return (
    <Card className={cn('gap-4', graded === true && 'lumos border-primary')}>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm text-muted-foreground">{heading}</CardTitle>
          <TagBadge tag={tag} />
        </div>
        <p className="text-center text-3xl break-words" lang="en" aria-label={`IPA ${word.ipa}`}>
          /{word.ipa}/
        </p>
        {show && (
          <p className="flex items-center justify-center gap-2 text-center text-xl font-semibold break-words" lang="en">
            {word.text}
            <ListenButton text={word.text} label={`Nghe mẫu: ${word.text}`} />
          </p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!show && (
          <>
            <p className="text-sm text-muted-foreground">Đọc to theo IPA trước, rồi xem từ và nghe mẫu để tự chấm.</p>
            <Button variant="outline" onClick={() => setRevealed(true)}>
              <Eye aria-hidden="true" />
              Xem từ và nghe mẫu
            </Button>
          </>
        )}
        {show && graded === null && (
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => onGrade(true)}>
              <Check aria-hidden="true" />
              Mình đọc đúng
            </Button>
            <Button variant="outline" onClick={() => onGrade(false)}>
              <X aria-hidden="true" />
              Chưa đúng
            </Button>
          </div>
        )}
        {graded !== null && (
          <p role="status" className={cn('text-sm font-semibold', graded ? 'text-primary' : 'text-destructive')}>
            {graded ? 'Lumos! Lịch ôn từ này giãn ra.' : 'Không sao, từ này sẽ quay lại sớm hơn.'}
          </p>
        )}
        {graded !== null && footer}
      </CardContent>
    </Card>
  )
}
