import { useEffect, useState } from 'react'
import { ArrowLeft, BookOpenCheck, Check, ClipboardCheck, MapPinOff, NotebookPen } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router'

import { useLoadedStore, useNotes, useProgress, useSkillBoard } from '@/app/store-context'
import { LessonNoteInline, LessonToc } from '@/components/lesson/LessonRail'
import { LessonSectionContent } from '@/components/lesson/LessonSectionContent'
import { RoleplayButton } from '@/components/lesson/RoleplayButton'
import { NoteForm } from '@/components/notebook/NoteForm'
import { ReadingSourceContext } from '@/components/reading-source'
import { LessonSectionCard } from '@/components/roadmap/LessonSectionCard'
import { SplitLayout, SplitMain, SplitRail } from '@/components/SplitLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { getLessonContent } from '@/data/lessons'
import { getQuiz, lessonQuizId, QUESTION_BANK, quizHref } from '@/data/questions'
import { resolveLessonRoute, sectionHref } from '@/data/roadmap'
import { isBrickTaught } from '@/lib/foundation'
import { lessonTocGroups } from '@/lib/lesson-toc'
import { prioritizeSections } from '@/lib/placement'
import { quizButtonCount } from '@/lib/quiz'
import { canSpeak } from '@/lib/speech'

function BackLink() {
  return (
    <Link
      to="/roadmap"
      className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Lộ trình
    </Link>
  )
}

/**
 * Ghi chú gắn với bài (story 8): mở Sheet có form 3 ô; lưu xong ghi chú có link về bài trong Sổ tay.
 * Từ 1024px nút ẩn, thay bằng ô ghi chú mở sẵn ở cột phụ (`LessonNoteInline`, story 30).
 */
function LessonNoteButton({ lessonId }: { lessonId: string }) {
  const { create } = useNotes()
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  return (
    <div className="flex flex-col gap-1 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" onClick={() => setSaved(false)}>
            <NotebookPen aria-hidden="true" />
            Ghi chú cho bài này
          </Button>
        </SheetTrigger>
        <SheetContent className="max-h-[90dvh] overflow-y-auto">
          <SheetTitle>Ghi chú cho bài này</SheetTitle>
          <SheetDescription>Quy tắc, lỗi sai, câu ví dụ: điền ô nào cũng được, ít nhất một ô.</SheetDescription>
          <NoteForm
            lessonId={lessonId}
            onSubmit={(input) => {
              const reason = create(input)
              if (!reason) {
                setOpen(false)
                setSaved(true)
              }
              return reason
            }}
          />
        </SheetContent>
      </Sheet>
      {saved && (
        <p role="status" className="text-xs text-muted-foreground">
          Đã lưu ghi chú vào Sổ tay.
        </p>
      )}
    </div>
  )
}

/** Trang chi tiết bài: liệt kê việc cần làm và nguồn của từng đoạn. */
export function Lesson() {
  const { lessonId, sectionId } = useParams()
  const { entry, targetSectionId: target } = resolveLessonRoute(lessonId, sectionId)
  const { completedLessonIds, setCompleted } = useProgress()
  const { weakest } = useSkillBoard()
  const { store } = useLoadedStore()
  const { key: locationKey } = useLocation()

  // Có đoạn hợp lệ thì cuộn tới đó, không thì về đầu trang (kể cả khi reload).
  // Phụ thuộc location.key để mỗi lần điều hướng (kể cả tới đúng đoạn đang mở) đều cuộn.
  // Chạy trong rAF nên thắng <ScrollRestoration /> (layout effect) ở AppShell.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const el = target ? document.getElementById(target) : null
      if (el) el.scrollIntoView({ block: 'start' })
      else window.scrollTo(0, 0)
    })
    return () => cancelAnimationFrame(frame)
  }, [lessonId, target, locationKey])

  if (!entry) {
    return (
      <section className="flex flex-col gap-6 lg:mx-auto lg:w-full lg:max-w-3xl">
        <header className="flex items-center gap-3">
          <MapPinOff className="size-7 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-semibold tracking-wide">Không tìm thấy bài</h1>
        </header>
        <Card>
          <CardHeader>
            <CardDescription>Bài này không có trong lộ trình. Có thể link đã cũ hoặc bị gõ sai.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/roadmap">Về Lộ trình</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    )
  }

  const { lesson, month, stage } = entry
  const done = completedLessonIds.includes(lesson.id)
  // Bài đã soạn nội dung (T1–T4) thì gắn vào đoạn Phát âm / Ngữ pháp; bài khác giữ như cũ.
  const content = getLessonContent(lesson.id)
  // Câu hỏi kiểm tra bài (story 10): mọi bài có đủ câu trong ngân hàng.
  const quiz = getQuiz(lessonQuizId(lesson.id))
  // Số câu đủ nền (story 27): bỏ câu cần viên gạch chưa học, tính cả việc thay câu nghe khi không có TTS; còn < 4 câu thì nhãn không có số.
  const quizCount = quiz ? quizButtonCount(QUESTION_BANK, quiz, { canSpeak: canSpeak() }, (id) => isBrickTaught(store, id)) : null
  const ordered = prioritizeSections(lesson.sections, weakest)

  return (
    <section className="flex flex-col gap-6">
      <BackLink />
      {/* Từ 1024px (story 30): thẻ đoạn bên trái; cột phải dính có mục lục, các nút việc và ô ghi chú mở sẵn. */}
      <SplitLayout cols="rail-right" className="flex flex-col gap-6">
        <SplitMain className="flex flex-col gap-6">
          <header className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <BookOpenCheck
                className="size-7 shrink-0 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]"
                aria-hidden="true"
              />
              <h1 className="text-2xl font-semibold tracking-wide break-words">{lesson.title}</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {stage.yearLabel} · Chặng {stage.number} {stage.name} · {month.label} ({month.period}) · Tuần{' '}
              {lesson.week}
            </p>
            {done && (
              <p className="inline-flex items-center gap-1 self-start rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground shadow-[0_0_12px_var(--candle-glow)]">
                <Check className="size-3.5" aria-hidden="true" />
                Đã học xong
              </p>
            )}
          </header>

          {/* Lý thuyết (phát âm, ngữ pháp) luôn trước; đoạn luyện của kỹ năng yếu nhất lên trước đoạn luyện khác, nhãn "Ưu tiên". */}
          {ordered.map(({ section, priority }) => (
            <ReadingSourceContext.Provider
              key={section.id}
              value={{ title: `${lesson.title} · ${section.title}`, url: sectionHref(lesson.id, section.id) }}
            >
              <LessonSectionCard
                lesson={lesson}
                stage={stage}
                section={section}
                highlighted={section.id === target}
                priority={priority}
              >
                <LessonSectionContent lesson={lesson} stage={stage} section={section} content={content} />
              </LessonSectionCard>
            </ReadingSourceContext.Provider>
          ))}
        </SplitMain>

        <SplitRail className="flex flex-col gap-6">
          <LessonToc lessonId={lesson.id} groups={lessonTocGroups(ordered, target)} />

          {quiz && (
            <Button asChild variant="outline" className="self-start lg:self-stretch">
              <Link to={quizHref(quiz.id)}>
                <ClipboardCheck aria-hidden="true" />
                {quizCount === null ? 'Kiểm tra bài' : `Kiểm tra bài (${quizCount} câu)`}
              </Link>
            </Button>
          )}

          {content?.roleplay && <RoleplayButton lesson={{ lessonId: lesson.id, roleplay: content.roleplay }} />}

          <LessonNoteButton lessonId={lesson.id} />
          <LessonNoteInline lessonId={lesson.id} />

          <div className="flex flex-col gap-2">
            <Button
              variant={done ? 'outline' : 'default'}
              onClick={() => setCompleted(lesson.id, !done)}
              aria-pressed={done}
            >
              {done ? 'Bỏ đánh dấu' : 'Đánh dấu đã học xong'}
            </Button>
            <p className="text-xs text-muted-foreground">
              {quiz
                ? "Buổi 30' có kiểm tra cuối Bài chính: đạt từ 70% thì app mời đánh dấu xong. Nút này bấm lúc nào cũng được."
                : 'Nút này bấm lúc nào cũng được.'}
            </p>
          </div>
        </SplitRail>
      </SplitLayout>
    </section>
  )
}
