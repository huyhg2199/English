import { ClipboardCheck, GraduationCap } from 'lucide-react'
import { Link } from 'react-router'

import { useSpells } from '@/app/store-context'
import { Button } from '@/components/ui/button'
import type { GrammarContent, LessonContent } from '@/data/lessons'
import { quizHref } from '@/data/questions'

import { SoundTable } from './SoundTable'
import { SpeakPractice } from './SpeakPractice'
import { TenseCard } from './TenseCard'

/** Nội dung đoạn Phát âm: (tuần 1) nút làm bài đầu vào, bảng âm và luyện nói câu mẫu. */
export function PronunciationSection({ content }: { content: LessonContent }) {
  if (!content.pronunciation) return null
  return (
    <div className="flex flex-col gap-5">
      {content.placementLink && (
        <Button asChild variant="outline" className="self-start">
          <Link to="/sorting-hat">
            <GraduationCap aria-hidden="true" />
            Làm bài đầu vào (Mũ Phân Loại)
          </Link>
        </Button>
      )}
      <SoundTable content={content.pronunciation} />
      <SpeakPractice sentences={content.pronunciation.sentences} />
    </div>
  )
}

function Review({ review }: { review: NonNullable<GrammarContent['review']> }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">Tóm tắt các thì đã học</h3>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {review.summary.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p className="flex items-center gap-1.5 rounded-lg border border-dashed p-2 text-sm text-muted-foreground">
        <ClipboardCheck className="size-4 shrink-0" aria-hidden="true" />
        {review.note}
      </p>
      {review.quizId && (
        <Button asChild className="self-start">
          <Link to={quizHref(review.quizId)}>
            <ClipboardCheck aria-hidden="true" />
            Làm mini test
          </Link>
        </Button>
      )}
    </div>
  )
}

/** Nội dung đoạn Ngữ pháp: từng thì (dòng thời gian, quy tắc, câu thoại, thần chú) hoặc phần ôn tập. */
export function GrammarSection({ content }: { content: LessonContent }) {
  const unlocked = useSpells()
  if (!content.grammar) return null
  const ids = new Set(unlocked.map((s) => s.id))
  return (
    <div className="flex flex-col gap-6">
      {content.grammar.tenses.map((t) => (
        <TenseCard key={t.id} tense={t} unlockedSpellIds={ids} />
      ))}
      {content.grammar.review && <Review review={content.grammar.review} />}
    </div>
  )
}
