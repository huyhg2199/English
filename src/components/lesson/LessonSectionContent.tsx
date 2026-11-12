import { ClipboardCheck, GraduationCap } from 'lucide-react'
import { Link } from 'react-router'

import { GrammarSection, PronunciationSection, type PronunciationView } from '@/components/lesson/LessonContentParts'
import { LinkList } from '@/components/session/SessionParts'
import { Button } from '@/components/ui/button'
import type { LessonContent } from '@/data/lessons'
import { quizHref } from '@/data/questions'
import { entertainmentLinks, type Lesson, type Section, type Stage } from '@/data/roadmap'
import { OWL_CHECKPOINT_ID, OWL_HREF } from '@/lib/owl'

/**
 * Link ngoài của phần giải trí (story 15): phương án phụ, nằm dưới video phát trong app (nếu có).
 * "Nguồn miễn phí" của đoạn chỉ là chữ, nên vẫn giữ link bấm được ở đây; không có link nào thì không hiện gì.
 */
function EntertainmentLinks({ lesson }: { lesson: Lesson }) {
  const links = entertainmentLinks(lesson)
  if (links.length === 0) return null
  return (
    <div className="flex flex-col gap-1">
      <h3 className="font-semibold">Nguồn ngoài</h3>
      <LinkList links={links} />
    </div>
  )
}

type Props = {
  lesson: Lesson
  stage: Stage
  section: Section
  /** Nội dung soạn sẵn của bài (T1–T4); không có thì đoạn chỉ hiện phần chung của `LessonSectionCard`. */
  content: LessonContent | undefined
  /** Đoạn Phát âm của bài chia phần (story 28): mọi phần (mặc định) hay chỉ phần của buổi. */
  pronunciationView?: PronunciationView
}

/**
 * Nội dung học của một đoạn (children của `LessonSectionCard`): bảng âm, TenseCard, link giải trí, nút thi O.W.L.
 * Trang bài và buổi 30' dùng chung (story 21). Nơi gọi tự bọc `ReadingSourceContext.Provider`.
 */
export function LessonSectionContent({ lesson, stage, section, content, pronunciationView }: Props) {
  return (
    <>
      {content && section.id === 'pronunciation' && <PronunciationSection content={content} view={pronunciationView} />}
      {content && section.id === 'grammar' && <GrammarSection content={content} />}
      {section.id === 'entertainment' && <EntertainmentLinks lesson={lesson} />}
      {section.id === 'checkpoint' && lesson.checkpointId === OWL_CHECKPOINT_ID && (
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Story 40: ôn trộn mọi thì trước khi thi (không bắt buộc). */}
          <Button asChild variant="outline" className="self-start">
            <Link to={quizHref('mix-s1')}>
              <ClipboardCheck aria-hidden="true" />
              Ôn trộn mọi thì (20 câu)
            </Link>
          </Button>
          <Button asChild className="self-start">
            <Link to={OWL_HREF}>
              <GraduationCap aria-hidden="true" />
              Vào thi {stage.checkpoint.name}
            </Link>
          </Button>
        </div>
      )}
    </>
  )
}
