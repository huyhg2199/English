import { Check, ClipboardCheck, CloudMoon } from 'lucide-react'
import { Link } from 'react-router'

import { useLessonParts, useSpells } from '@/app/store-context'
import { Button } from '@/components/ui/button'
import type { GrammarContent, LessonContent, LessonPart, PronunciationContent, SoundGroup } from '@/data/lessons'
import { quizHref } from '@/data/questions'
import { nextLessonPartId } from '@/lib/roadmap-progress'

import { IrregularVerbTable } from './IrregularVerbTable'
import { PronunciationBlockView } from './PronunciationBlocks'
import { SoundTable } from './SoundTable'
import { SpeakPractice } from './SpeakPractice'
import { TenseCard } from './TenseCard'
import { GlossaryText } from './TermChip'

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

/** Cách hiện đoạn Phát âm của bài chia phần (story 28): mọi phần (trang bài, buổi ôn cả tuần) hoặc một phần (buổi bài). */
export type PronunciationView = { kind: 'all' } | { kind: 'part'; partId: string }

const ALL: PronunciationView = { kind: 'all' }

/** Nhóm âm của một phần: giữ nhóm của bài (tiêu đề, ghi chú), chỉ lấy âm của phần, theo thứ tự `soundIds`. */
function partGroups(pronunciation: PronunciationContent, part: LessonPart): SoundGroup[] {
  return pronunciation.groups.flatMap((group) => {
    const sounds = part.soundIds.flatMap((id) => group.sounds.filter((sound) => sound.id === id))
    if (sounds.length === 0) return []
    return [{ ...group, title: `${sounds.length} trong ${group.title}`, sounds }]
  })
}

const BADGE = 'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold'

/** Một phần: tiêu đề + nhãn, ghi chú, bảng âm của phần, luyện nói câu của phần, nút "Xong phần này" (ẩn khi đã xem). */
function PartBlock({
  part,
  pronunciation,
  seen,
  isNext,
  onSeen,
}: {
  part: LessonPart
  pronunciation: PronunciationContent
  seen: boolean
  isNext: boolean
  onSeen: () => void
}) {
  return (
    <section id={`part-${part.id}`} className="flex scroll-mt-20 flex-col gap-4 rounded-lg border p-3" aria-labelledby={`part-title-${part.id}`}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 id={`part-title-${part.id}`} className="min-w-0 font-semibold break-words">
          {part.title}
        </h3>
        {seen ? (
          <span className={`${BADGE} bg-secondary text-secondary-foreground`}>
            <Check className="size-3" aria-hidden="true" />
            Đã xem
          </span>
        ) : (
          isNext && <span className={`${BADGE} bg-primary text-primary-foreground`}>Phần tiếp theo</span>
        )}
      </div>
      <SoundTable
        content={{ intro: part.note, groups: partGroups(pronunciation, part), sentences: [] }}
        groupHeading="h4"
      />
      <SpeakPractice sentences={part.sentences} title="Luyện nói phần này" titleAs="h4" />
      {!seen && (
        <Button type="button" variant="outline" className="self-start" onClick={onSeen}>
          <Check aria-hidden="true" />
          Xong phần này
        </Button>
      )}
    </section>
  )
}

/**
 * Đoạn Phát âm của bài chia phần (W1–W3, story 28). Không khoá phần nào: trang bài hiện mọi phần theo thứ tự, phần nào cũng
 * đủ nội dung, cuối là "Luyện cả tuần" (câu mẫu cũ). Buổi bài chỉ hiện phần của buổi, kèm nhãn "Phần n/N".
 */
function PartedPronunciation({
  content,
  pronunciation,
  parts,
  view,
}: {
  content: LessonContent
  pronunciation: PronunciationContent
  parts: readonly LessonPart[]
  view: PronunciationView
}) {
  const { seenPartIds, markSeen } = useLessonParts()
  const seen = seenPartIds(content.lessonId)
  const next = nextLessonPartId(
    parts.map((p) => p.id),
    seen,
  )
  const block = (part: LessonPart) => (
    <PartBlock
      key={part.id}
      part={part}
      pronunciation={pronunciation}
      seen={seen.has(part.id)}
      isNext={part.id === next}
      onSeen={() => markSeen(content.lessonId, part.id)}
    />
  )

  const index = view.kind === 'part' ? parts.findIndex((p) => p.id === view.partId) : -1
  if (index >= 0) {
    return (
      <div className="flex flex-col gap-3">
        {/* Lời giới thiệu của tuần (định nghĩa, cách luyện, dấu ★) vẫn hiện ở buổi chỉ học một phần. */}
        <p className="text-sm text-muted-foreground">
          <GlossaryText text={pronunciation.intro} />
        </p>
        <p className="text-sm font-semibold text-primary">
          Phần {index + 1}/{parts.length}
        </p>
        {block(parts[index])}
      </div>
    )
  }

  const seenCount = parts.filter((p) => seen.has(p.id)).length
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          <GlossaryText text={pronunciation.intro} />
        </p>
        <p className="text-sm font-medium">
          Đã xem {seenCount}/{parts.length} phần
        </p>
      </div>
      {parts.map(block)}
      {pronunciation.blocks?.map((b, i) => (
        <PronunciationBlockView key={`${b.kind}-${i}`} block={b} />
      ))}
      <SpeakPractice sentences={pronunciation.sentences} title="Luyện cả tuần" />
    </div>
  )
}

/**
 * Nội dung đoạn Phát âm: bảng âm, các khối phát âm mới và luyện nói câu mẫu; tuần Tết chỉ có lời nhắc ngày lười.
 * Bài chia phần (story 28) hiện theo `view` (mặc định mọi phần); bài không chia giữ nguyên như cũ.
 */
export function PronunciationSection({ content, view = ALL }: { content: LessonContent; view?: PronunciationView }) {
  if (content.lazyWeek) return <LazyWeekNotice />
  if (!content.pronunciation) return null
  if (content.parts && content.parts.length > 0) {
    return <PartedPronunciation content={content} pronunciation={content.pronunciation} parts={content.parts} view={view} />
  }
  return (
    <div className="flex flex-col gap-5">
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
