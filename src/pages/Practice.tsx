import { useMemo } from 'react'
import {
  BookX,
  ChevronRight,
  ClipboardCheck,
  Compass,
  GraduationCap,
  HardDriveDownload,
  Layers,
  Mail,
  Sparkles,
  WandSparkles,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import {
  useLoadedStore,
  useMistakes,
  useNewWordList,
  useNewWordOptions,
  useOwl,
  useQuizzes,
  useSavedWords,
  useSpells,
  useSrs,
} from '@/app/store-context'
import { useNow } from '@/app/use-now'
import { useWords } from '@/app/use-words'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SPELLS } from '@/data/lessons'
import { MISTAKES_HREF, quizHref } from '@/data/questions'
import { sectionHref } from '@/data/roadmap'
import { buildStudySession, flashcardSummary } from '@/lib/flashcard-session'
import { OWL_HREF, partPercent } from '@/lib/owl'
import { listMistakes, reviewableDue } from '@/lib/quiz'
import { canSpeak } from '@/lib/speech'
import { tenseMapBlurb, tenseMapRows } from '@/lib/tense-map'

function FlashcardSummary() {
  const wordsState = useWords()
  const { srs } = useSrs()
  const { items: savedItems } = useSavedWords()
  const firstList = useNewWordList()
  const [now] = useNow()
  // Cùng quota / id ưu tiên với phiên ôn (`FlashcardSession`) để số từ mới khớp.
  const { newPerDay, preferIds, lockedIds, rules } = useNewWordOptions(now)
  const session = useMemo(
    () =>
      wordsState.status === 'ready'
        ? buildStudySession(srs, wordsState.words, savedItems, now, firstList, { newPerDay, preferIds, lockedIds, rules })
        : null,
    [srs, wordsState, savedItems, now, firstList, newPerDay, preferIds, lockedIds, rules],
  )

  if (!session) return wordsState.status === 'error' ? 'Chưa mở được bộ từ' : 'Đang đếm thẻ…'
  return flashcardSummary(session)
}

/** Thẻ link một mục của Luyện tập. */
function PracticeLink({ to, icon: Icon, title, children }: { to: string; icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <Link to={to} className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      <Card className="transition-shadow hover:shadow-[0_0_20px_var(--candle-glow)]">
        <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-x-3">
          <Icon className="row-span-2 size-8 text-primary" aria-hidden="true" />
          <CardTitle className="text-lg">{title}</CardTitle>
          <ChevronRight className="row-span-2 size-5 text-muted-foreground" aria-hidden="true" />
          <CardDescription>{children}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}

function MistakesSummary() {
  const { items } = useMistakes()
  const [now] = useNow()
  const total = useMemo(() => listMistakes(items).length, [items])
  const due = useMemo(() => reviewableDue(items, now, { canSpeak: canSpeak() }).due.length, [items, now])
  if (total === 0) return 'Sổ còn trống. Câu sai ở bài test sẽ tự vào đây.'
  return `${total} câu trong sổ · ${due} câu đến hạn ôn`
}

/** Tóm tắt lần làm của một mini test / bài ôn trộn; chưa làm lần nào thì hiện `blurb`. */
function MiniTestSummary({ quizId, blurb }: { quizId: string; blurb: string }) {
  const { attempts } = useQuizzes()
  const mine = attempts.filter((a) => a.quizId === quizId)
  if (mine.length === 0) return blurb
  const best = Math.max(...mine.map((a) => a.score))
  return `Đã làm ${mine.length} lần · cao nhất ${best}/${mine[0].total} · lần gần nhất ${mine[0].score}/${mine[0].total}`
}

function OwlSummary() {
  const [now] = useNow()
  const { attempts } = useOwl(now)
  if (attempts.length === 0) return 'Kỳ thi qua cửa chặng 1: 30 từ đọc theo IPA + 20 câu thì. Chưa thi lần nào.'
  const last = attempts[0]
  const passes = attempts.filter((a) => a.passed).length
  return `Đã thi ${attempts.length} lần${passes > 0 ? ` · qua ${passes} lần` : ''} · gần nhất ${last.passed ? 'qua' : 'chưa qua'} (phát âm ${partPercent(last.details.pronunciation)}%, thì ${partPercent(last.details.tenses)}%${last.details.selfGraded ? ', có phần tự chấm' : ''})`
}

/** Tóm tắt Bản đồ thì (story 42): số thì chắc / đang học / chưa học. */
function TenseMapSummary() {
  const { store } = useLoadedStore()
  const [now] = useNow()
  return useMemo(() => tenseMapBlurb(tenseMapRows(store, now)), [store, now])
}

/** Danh sách thần chú đã mở (mỗi thì đã học là một thần chú), link về đoạn ngữ pháp của bài. */
function SpellList() {
  const unlocked = useSpells()
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="size-5 text-primary" aria-hidden="true" />
          <h2>Thần chú đã mở</h2>
        </CardTitle>
        <CardDescription>
          {unlocked.length}/{SPELLS.length} thần chú · mỗi thì học xong là một thần chú.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {unlocked.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa mở thần chú nào. Học xong bài tuần 1 (động từ to be) để mở Lumos.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {unlocked.map((spell) => (
              <li key={spell.id}>
                <Link
                  to={sectionHref(spell.lessonId, 'grammar')}
                  className="flex flex-col rounded-lg border border-primary/50 bg-accent/30 p-3 text-sm hover:shadow-[0_0_16px_var(--candle-glow)]"
                >
                  <span className="font-semibold text-primary">{spell.name}</span>
                  <span className="text-muted-foreground">{spell.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function Practice() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <WandSparkles className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">Luyện tập</h1>
      </header>

      <Link
        to="/practice/flashcards"
        className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Card className="transition-shadow hover:shadow-[0_0_20px_var(--candle-glow)]">
          <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-x-3">
            <Layers className="row-span-2 size-8 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg">Ôn flashcard</CardTitle>
            <ChevronRight className="row-span-2 size-5 text-muted-foreground" aria-hidden="true" />
            <CardDescription>
              <FlashcardSummary />
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>

      <PracticeLink to={MISTAKES_HREF} icon={BookX} title="Sổ lỗi sai của Snape">
        <MistakesSummary />
      </PracticeLink>

      <PracticeLink to={quizHref('mini-t1')} icon={ClipboardCheck} title="Mini test tháng T1">
        <MiniTestSummary quizId="mini-t1" blurb="10 câu ôn cả 4 tuần T1. Chưa làm lần nào." />
      </PracticeLink>

      <PracticeLink to={quizHref('mini-t2')} icon={ClipboardCheck} title="Mini test tháng T2">
        <MiniTestSummary quizId="mini-t2" blurb="10 câu ôn cả 4 tuần T2. Chưa làm lần nào." />
      </PracticeLink>

      <PracticeLink to={quizHref('mini-t3')} icon={ClipboardCheck} title="Mini test tháng T3">
        <MiniTestSummary quizId="mini-t3" blurb="10 câu: 8 câu ôn 4 tuần T3 và 2 câu ôn thì T1–T2. Chưa làm lần nào." />
      </PracticeLink>

      <PracticeLink to={quizHref('mix-s1')} icon={ClipboardCheck} title="Ôn trộn mọi thì">
        <MiniTestSummary
          quizId="mix-s1"
          blurb="20 câu Ngữ pháp trộn mọi thì của chặng 1, khởi động trước O.W.L. 1. Chưa làm lần nào."
        />
      </PracticeLink>

      <PracticeLink to={OWL_HREF} icon={GraduationCap} title="O.W.L. 1">
        <OwlSummary />
      </PracticeLink>

      <PracticeLink to="/practice/tense-map" icon={Compass} title="Bản đồ thì">
        <TenseMapSummary />
      </PracticeLink>

      <SpellList />

      <Card>
        <CardHeader>
          <CardTitle>Sắp có</CardTitle>
          <CardDescription>
            7 Part TOEIC. Luyện phát âm có trong đoạn Phát âm của từng bài tháng T1–T4; nút "Luyện nói với AI" nằm cuối
            mỗi bài.
          </CardDescription>
        </CardHeader>
      </Card>

      <Link
        to="/backup"
        className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Card className="transition-shadow hover:shadow-[0_0_20px_var(--candle-glow)]">
          <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-x-3">
            <HardDriveDownload className="row-span-2 size-8 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg">Sao lưu dữ liệu</CardTitle>
            <ChevronRight className="row-span-2 size-5 text-muted-foreground" aria-hidden="true" />
            <CardDescription>Xuất file JSON để tự giữ, hoặc khôi phục từ file.</CardDescription>
          </CardHeader>
        </Card>
      </Link>

      <Link
        to="/owl-post"
        className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Card className="transition-shadow hover:shadow-[0_0_20px_var(--candle-glow)]">
          <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-x-3">
            <Mail className="row-span-2 size-8 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg">Owl Post &amp; sao lưu</CardTitle>
            <ChevronRight className="row-span-2 size-5 text-muted-foreground" aria-hidden="true" />
            <CardDescription>Bản sao Gist tự động, giờ nhắc, lịch .ics và nhắc qua Telegram.</CardDescription>
          </CardHeader>
        </Card>
      </Link>
    </section>
  )
}
