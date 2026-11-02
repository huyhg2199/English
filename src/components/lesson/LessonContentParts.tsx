import { ClipboardCheck, CloudMoon, GraduationCap } from 'lucide-react'
import { Link } from 'react-router'

import { useSpells } from '@/app/store-context'
import { Button } from '@/components/ui/button'
import type { GrammarContent, LessonContent } from '@/data/lessons'
import { quizHref } from '@/data/questions'

import { IrregularVerbTable } from './IrregularVerbTable'
import { PronunciationBlockView } from './PronunciationBlocks'
import { SoundTable } from './SoundTable'
import { SpeakPractice } from './SpeakPractice'
import { TenseCard } from './TenseCard'

/** Tuần Tết: không có nội dung mới, chỉ nhắc chạy chế độ ngày lười 10'. */
function LazyWeekNotice() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed p-3 text-sm">
      <p className="flex items-start gap-2">
        <CloudMoon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <span>
          Tuần Tết không có bài mới. Mỗi ngày chỉ cần chạy <strong>chế độ ngày lười 10'</strong> (ôn thẻ đến hạn, đọc 1
          tin ngắn, lưu 3 từ mới) là vẫn giữ chuỗi. Ăn Tết vui vẻ!
        </span>
      </p>
      <Button asChild className="self-start">
        <Link to="/session/lazy">
          <CloudMoon aria-hidden="true" />
          Sang ngày lười
        </Link>
      </Button>
    </div>
  )
}

/** Nội dung đoạn Phát âm: (tuần 1) nút làm bài đầu vào, bảng âm, các khối phát âm mới và luyện nói câu mẫu; tuần Tết chỉ có lời nhắc ngày lười. */
export function PronunciationSection({ content }: { content: LessonContent }) {
  if (content.lazyWeek) return <LazyWeekNotice />
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
      {content.pronunciation.blocks?.map((block, i) => (
        <PronunciationBlockView key={`${block.kind}-${i}`} block={block} />
      ))}
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
      {content.grammar.irregularVerbs && <IrregularVerbTable verbs={content.grammar.irregularVerbs} />}
      {content.grammar.review && <Review review={content.grammar.review} />}
    </div>
  )
}
