import { Fragment, useState } from 'react'
import { BookX, Check, ClipboardCheck, CloudMoon } from 'lucide-react'
import { Link } from 'react-router'

import { useLessonParts, useSpells } from '@/app/store-context'
import { Button } from '@/components/ui/button'
import {
  allTenses,
  type GrammarContent,
  type GrammarDay,
  type GrammarView,
  type LessonContent,
  type LessonPart,
  type PronunciationContent,
  type PronunciationView,
  type SoundGroup,
  type TenseChoice,
} from '@/data/lessons'
import { MISTAKES_HREF, quizHref } from '@/data/questions'
import { nextLessonPartId } from '@/lib/roadmap-progress'
import { hasPractice, type PracticeSubject } from '@/lib/tense-practice'

import { IrregularVerbTable } from './IrregularVerbTable'
import { PronunciationBlockView } from './PronunciationBlocks'
import { SoundTable } from './SoundTable'
import { SpeakPractice } from './SpeakPractice'
import { TenseCard, TenseHead } from './TenseCard'
import { MinimalPairList, TenseChoiceCard } from './TenseChoiceCard'
import { TensePractice } from './TensePractice'
import { GlossaryText } from './TermChip'

/**
 * Tuần Tết: không có nội dung mới, chỉ nhắc chạy chế độ ngày lười 10'. Story 40: dưới đó có mục tuỳ chọn "Ôn nhẹ thì"
 * (5 câu ôn trộn `mix-tet` + ôn Sổ lỗi đến hạn); chế độ ngày lười giữ nguyên.
 */
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
      <section className="flex flex-col gap-2 border-t pt-3" aria-labelledby="tet-tense-review">
        <h3 id="tet-tense-review" className="font-semibold">
          Ôn nhẹ thì (tối đa 10')
        </h3>
        <p className="text-muted-foreground">
          Nếu còn hứng: 5 câu trộn các thì đã học (khoảng 5') rồi ôn các câu Sổ lỗi đến hạn (khoảng 5').
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline">
            <Link to={quizHref('mix-tet')}>
              <ClipboardCheck aria-hidden="true" />
              5 câu ôn trộn
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to={MISTAKES_HREF}>
              <BookX aria-hidden="true" />
              Ôn Sổ lỗi đến hạn
            </Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Không làm cũng không sao, chuỗi ngày vẫn giữ.</p>
      </section>
    </div>
  )
}

export type { GrammarView, PronunciationView } from '@/data/lessons'

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

const ALL_GRAMMAR: GrammarView = { kind: 'all' }

/** Tên ngắn của thì để so ("Ôn lại: viên gạch F13–F14 · to be (am / is / are)" → "to be (am / is / are)"). */
function shortTenseName(tenseId: string): string {
  const name = allTenses().find((t) => t.id === tenseId)?.name ?? tenseId
  return name.split(' · ').at(-1) ?? name
}

/** Nhãn "Đã xem" / "Ngày tiếp theo" của một ngày (giọng như nhãn phần của story 28). */
function DayBadge({ seen, isNext }: { seen: boolean; isNext: boolean }) {
  if (seen) {
    return (
      <span className={`${BADGE} bg-secondary text-secondary-foreground`}>
        <Check className="size-3" aria-hidden="true" />
        Đã xem
      </span>
    )
  }
  return isNext ? <span className={`${BADGE} bg-primary text-primary-foreground`}>Ngày tiếp theo</span> : null
}

/**
 * "5 ngày của tuần" ở đầu đoạn Ngữ pháp của trang bài (story 47): mỗi ngày một dòng (nhãn "Đã xem" / "Ngày tiếp theo", nút
 * "Xong ngày này" ở ngày chưa xem) và dòng "Đã xem n/5 ngày". Không khoá ngày nào; nội dung đầy đủ vẫn hiện bên dưới.
 */
function GrammarDaysList({ lessonId, days }: { lessonId: string; days: readonly GrammarDay[] }) {
  const { seenPartIds, markSeen } = useLessonParts()
  const seen = seenPartIds(lessonId)
  const next = nextLessonPartId(
    days.map((d) => d.id),
    seen,
  )
  const seenCount = days.filter((d) => seen.has(d.id)).length
  return (
    <section className="flex flex-col gap-3 rounded-lg border p-3" aria-labelledby={`grammar-days-${lessonId}`}>
      <div className="flex flex-col gap-1">
        <h3 id={`grammar-days-${lessonId}`} className="font-semibold">
          {days.length} ngày của tuần
        </h3>
        <p className="text-sm font-medium">
          Đã xem {seenCount}/{days.length} ngày
        </p>
        <p className="text-xs text-muted-foreground">
          Buổi 30' mỗi ngày học một phần của đoạn Ngữ pháp. Ngày nào cũng mở được, nội dung đầy đủ ở ngay dưới.
        </p>
      </div>
      <ol className="flex flex-col gap-2 text-sm">
        {days.map((d, i) => (
          <li key={d.id} className="flex flex-wrap items-center gap-2">
            <span className="min-w-0 font-semibold break-words">
              Ngày {i + 1} · {d.title}
            </span>
            <DayBadge seen={seen.has(d.id)} isNext={d.id === next} />
            {!seen.has(d.id) && (
              <Button type="button" variant="outline" size="sm" onClick={() => markSeen(lessonId, d.id)}>
                <Check aria-hidden="true" />
                Xong ngày này
              </Button>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

/**
 * Câu luyện nói và cặp câu của các ngày N1–N4 (story 47) trong cả đoạn (trang bài, ngày 5, buổi ôn cả tuần): mỗi ngày một khối
 * đóng sẵn, để nội dung mới của ngày cũng xem / ôn lại được ngoài buổi của ngày đó.
 */
function GrammarDaysSentences({ days }: { days: readonly GrammarDay[] }) {
  const withContent = days.filter((d) => (d.sentences?.length ?? 0) > 0 || d.compare)
  if (withContent.length === 0) return null
  return (
    <section className="flex flex-col gap-3 rounded-lg border p-3" aria-label="Câu luyện theo ngày">
      <h3 className="font-semibold">Câu luyện theo ngày</h3>
      {withContent.map((d) => (
        <details key={d.id} className="rounded-lg border p-3">
          <summary className="text-sm font-semibold text-primary">
            Ngày {days.indexOf(d) + 1} · {d.title}
          </summary>
          <div className="flex flex-col gap-3 pt-3">
            {d.sentences && d.sentences.length > 0 && <SpeakPractice sentences={d.sentences} title="Luyện nói" titleAs="h4" />}
            {d.compare && (
              <MinimalPairList pairs={d.compare.pairs} title={`So với: ${d.compare.withTenseIds.map(shortTenseName).join(' · ')}`} />
            )}
          </div>
        </details>
      ))}
    </section>
  )
}

type PracticeState = { openId: string | null; open: (id: string) => void; close: (id: string) => void }

/** Khối luyện của một thì hay một khối "Chọn thì" (mỗi lúc chỉ mở một khối, story 35). */
function Practice({ tense, state }: { tense: PracticeSubject; state: PracticeState }) {
  return (
    <TensePractice
      tense={tense}
      open={state.openId === tense.id}
      onOpen={() => state.open(tense.id)}
      onClose={() => state.close(tense.id)}
    />
  )
}

/** Khối "Chọn thì" kèm khối luyện của nó. */
function ChoiceBlock({ choice, state }: { choice: TenseChoice; state: PracticeState }) {
  return (
    <>
      <TenseChoiceCard choice={choice} />
      <Practice tense={choice} state={state} />
    </>
  )
}

/**
 * Một ngày N1–N4 của đoạn Ngữ pháp trong buổi 30' (story 47): tiêu đề "Ngày k/5 · …", ghi chú, phần đầu thẻ thì với các dòng
 * công thức của ngày (thẻ đầy đủ mở bằng "Xem cả thẻ", đóng sẵn), 3 câu luyện nói hôm nay, khối luyện của thì (N3), khối
 * "Chọn thì" gán cho ngày (kèm khối luyện) và cặp câu so với thì trước (N4). Nút "Xong ngày này" như "Xong phần này".
 */
function GrammarDayBlock({
  content,
  grammar,
  day,
  index,
  total,
  unlockedSpellIds,
  practice,
}: {
  content: LessonContent
  grammar: GrammarContent
  day: GrammarDay
  index: number
  total: number
  unlockedSpellIds: ReadonlySet<string>
  practice: PracticeState
}) {
  const { seenPartIds, markSeen } = useLessonParts()
  const seen = seenPartIds(content.lessonId).has(day.id)
  const choices = (day.choiceIds ?? []).flatMap((id) => grammar.choices?.filter((c) => c.id === id) ?? [])
  return (
    <section
      id={`day-${day.id}`}
      className="flex scroll-mt-20 flex-col gap-4 rounded-lg border p-3"
      aria-labelledby={`day-title-${day.id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 id={`day-title-${day.id}`} className="min-w-0 font-semibold break-words">
          Ngày {index + 1}/{total} · {day.title}
        </h3>
        <DayBadge seen={seen} isNext={false} />
      </div>
      <p className="text-sm text-muted-foreground">
        <GlossaryText text={day.note} />
      </p>
      {grammar.tenses.map((tense) => {
        const focus = day.focus?.find((f) => f.tenseId === tense.id)
        return (
          <Fragment key={tense.id}>
            {focus && <TenseHead tense={tense} formulaLabels={focus.labels} />}
            {/* Ngày nào (kể cả ngày 4 không có dòng công thức) cũng mở được thẻ đầy đủ của từng thì trong bài. */}
            <details className="rounded-lg border p-3">
              <summary className="text-sm font-semibold text-primary">Xem cả thẻ: {tense.name}</summary>
              <div className="flex flex-col gap-3 pt-3">
                <TenseCard tense={tense} unlockedSpellIds={unlockedSpellIds} />
              </div>
            </details>
          </Fragment>
        )
      })}
      {day.sentences && day.sentences.length > 0 && (
        <SpeakPractice sentences={day.sentences} title="Luyện nói hôm nay" titleAs="h4" />
      )}
      {day.kind === 'question' &&
        grammar.tenses.filter(hasPractice).map((t) => <Practice key={t.id} tense={t} state={practice} />)}
      {choices.map((c) => (
        <ChoiceBlock key={c.id} choice={c} state={practice} />
      ))}
      {day.compare && (
        <MinimalPairList
          pairs={day.compare.pairs}
          title={`So với: ${day.compare.withTenseIds.map(shortTenseName).join(' · ')}`}
        />
      )}
      {!seen && (
        <Button type="button" variant="outline" className="self-start" onClick={() => markSeen(content.lessonId, day.id)}>
          <Check aria-hidden="true" />
          Xong ngày này
        </Button>
      )}
    </section>
  )
}

/**
 * Nội dung đoạn Ngữ pháp: từng thì (dòng thời gian, quy tắc, câu thoại, thần chú) hoặc phần ôn tập. Thì có `practice`
 * (story 35) có khối luyện ngay dưới TenseCard (cả trang bài lẫn bước Bài chính của buổi 30'). Bài có
 * `irregularVerbsReview` (s1-t3-w3, story 38) mở đầu bằng bảng ôn cột V3 che sẵn, trước các thì. Khối "Chọn thì"
 * (`choices`, story 39) đứng sau các thì, trước bảng động từ và phần ôn tập, mỗi khối có khối luyện riêng; khối luyện
 * của thì và của khối dùng chung `openPracticeId` (mỗi lúc chỉ mở một).
 *
 * Bài chia theo ngày (`grammarDays`, story 47): `view` một ngày N1–N4 chỉ hiện ngày đó (`GrammarDayBlock`); ngày 5 hiện cả
 * đoạn như cũ kèm dòng "Ngày 5/5 · Ôn trộn cả tuần"; `all` (trang bài) có danh sách 5 ngày ở đầu rồi cả đoạn; `week` (buổi
 * ôn cả tuần) là cả đoạn không có danh sách ngày. Cả đoạn có thêm khối "Câu luyện theo ngày" (câu nói, cặp câu của N1–N4,
 * đóng sẵn). Bảng ôn V3 và bảng động từ hiện ở mọi view; phần ôn tập chỉ ở ngày 5 / `all` / `week`.
 */
export function GrammarSection({ content, view = ALL_GRAMMAR }: { content: LessonContent; view?: GrammarView }) {
  const unlocked = useSpells()
  // Khối luyện đang mở (story 35): mỗi lúc chỉ một khối, để phím tắt không chạy hai nơi.
  const [openPracticeId, setOpenPracticeId] = useState<string | null>(null)
  if (!content.grammar) return null
  const grammar = content.grammar
  const ids = new Set(unlocked.map((s) => s.id))
  const practice: PracticeState = {
    openId: openPracticeId,
    open: (id) => setOpenPracticeId(id),
    close: (id) => setOpenPracticeId((current) => (current === id ? null : current)),
  }
  const days = content.grammarDays ?? []
  const dayIndex = view.kind === 'day' ? days.findIndex((d) => d.id === view.dayId) : -1
  const day = dayIndex >= 0 ? days[dayIndex] : undefined

  if (day && day.kind !== 'mixed') {
    return (
      <div className="flex flex-col gap-6">
        {grammar.irregularVerbsReview && <IrregularVerbTable verbs={grammar.irregularVerbsReview} mode="review-v3" />}
        <GrammarDayBlock
          content={content}
          grammar={grammar}
          day={day}
          index={dayIndex}
          total={days.length}
          unlockedSpellIds={ids}
          practice={practice}
        />
        {grammar.irregularVerbs && <IrregularVerbTable verbs={grammar.irregularVerbs} />}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {day && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-primary">
            Ngày {dayIndex + 1}/{days.length} · {day.title}
          </p>
          <p className="text-sm text-muted-foreground">
            <GlossaryText text={day.note} />
          </p>
        </div>
      )}
      {view.kind === 'all' && days.length > 0 && <GrammarDaysList lessonId={content.lessonId} days={days} />}
      {grammar.irregularVerbsReview && <IrregularVerbTable verbs={grammar.irregularVerbsReview} mode="review-v3" />}
      {grammar.tenses.map((t) => (
        <Fragment key={t.id}>
          <TenseCard tense={t} unlockedSpellIds={ids} />
          {hasPractice(t) && <Practice tense={t} state={practice} />}
        </Fragment>
      ))}
      {grammar.choices?.map((c) => (
        <ChoiceBlock key={c.id} choice={c} state={practice} />
      ))}
      {days.length > 0 && <GrammarDaysSentences days={days} />}
      {grammar.irregularVerbs && <IrregularVerbTable verbs={grammar.irregularVerbs} />}
      {grammar.review && <Review review={grammar.review} />}
    </div>
  )
}
