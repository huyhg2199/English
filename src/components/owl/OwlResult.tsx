import { ArrowRight, BookX, Home, RotateCw, Sparkles, Trophy } from 'lucide-react'
import { Link } from 'react-router'

import { ListenButton } from '@/components/ListenButton'
import { SourceSectionLink, TagBadge } from '@/components/quiz/QuestionCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { isTypedQuestion, MISTAKES_HREF, OWL_TOPICS, type Question } from '@/data/questions'
import { lessonHref, sectionHref, STAGES } from '@/data/roadmap'
import {
  OWL_PART_LABELS,
  OWL_PARTS,
  OWL_SELF_NO,
  owlTopicNames,
  partPassed,
  partPercent,
  topicReviewLessonId,
  type OwlScores,
  type OwlTopicScores,
  type OwlWord,
  type ReviewPlan,
} from '@/lib/owl'
import type { AttemptAnswer } from '@/lib/quiz'
import { cn } from '@/lib/utils'

import { ReviewPlanList } from './ReviewPlan'

type Props = {
  /** Có câu phát âm tự chấm. */
  selfGraded: boolean
  scores: OwlScores
  /** Điểm từng chủ điểm thì (story 40); rỗng (lần thi không có câu kho O.W.L.) thì không hiện mục "Điểm từng thì". */
  topics: OwlTopicScores
  passed: boolean
  plan: ReviewPlan | null
  words: readonly OwlWord[]
  questions: readonly Question[]
  answers: readonly AttemptAnswer[]
  onRetry: () => void
}

const STAGE_2_FIRST_LESSON = STAGES[1].months[0].lessons[0].id

/**
 * Kết quả O.W.L. 1: điểm từng phần, điểm từng thì (story 40); qua thì Lumos + Dumbledore + mời sang chặng 2; trượt (hoặc qua
 * mà còn thì dưới 70%) thì kế hoạch ôn 2 tuần.
 */
export function OwlResult({ selfGraded, scores, topics, passed, plan, words, questions, answers, onRetry }: Props) {
  const topicRows = OWL_TOPICS.flatMap((t) => {
    const score = topics[t.id]
    return score && score.total > 0 ? [{ topic: t, score, ok: partPassed(score) }] : []
  })
  const byWord = new Map(words.map((w) => [w.id, w]))
  const byQuestion = new Map(questions.map((q) => [q.id, q]))
  const wrong = answers.filter((a) => !a.correct)
  const wrongWords = wrong.flatMap((a) => (byWord.has(a.questionId) ? [{ a, w: byWord.get(a.questionId)! }] : []))
  const wrongQuestions = wrong.flatMap((a) =>
    byQuestion.has(a.questionId) ? [{ a, q: byQuestion.get(a.questionId)! }] : [],
  )

  return (
    <div className="flex flex-col gap-4">
      <Card className={cn('items-center text-center', passed && 'lumos border-primary')}>
        <CardHeader className="w-full items-center">
          {passed ? (
            <Trophy className="mx-auto size-10 text-primary drop-shadow-[0_0_10px_var(--candle-glow)]" aria-hidden="true" />
          ) : (
            <Sparkles className="mx-auto size-10 text-primary drop-shadow-[0_0_10px_var(--candle-glow)]" aria-hidden="true" />
          )}
          <CardTitle className="text-2xl">
            <h2>{passed ? 'Qua O.W.L. 1' : 'Chưa qua lần này'}</h2>
          </CardTitle>
          <CardDescription>
            {passed
              ? 'Lumos Maxima! Huy chương Dumbledore đã vào Phòng Cúp. Năm 3–4 đang chờ bạn.'
              : 'Không sao cả: tiến độ chặng giữ nguyên. App đã lên kế hoạch ôn 2 tuần cho phần còn yếu, thi lại lúc nào cũng được.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex w-full flex-col gap-3">
          <ul className="grid grid-cols-2 gap-2">
            {OWL_PARTS.map((p) => {
              const ok = partPassed(scores[p])
              return (
                <li
                  key={p}
                  className={cn('flex flex-col rounded-lg border p-2', ok ? 'border-primary' : 'border-destructive/60')}
                >
                  <span className="text-sm text-muted-foreground">{OWL_PART_LABELS[p]}</span>
                  <span className="text-xl font-semibold tabular-nums">
                    {scores[p].score}/{scores[p].total}
                  </span>
                  <span className={cn('text-xs', ok ? 'text-primary' : 'text-destructive')}>
                    {partPercent(scores[p])}% · {ok ? 'đạt' : 'cần ≥ 70%'}
                  </span>
                </li>
              )
            })}
          </ul>
          {selfGraded && (
            <p className="text-xs text-muted-foreground">Có phần tự chấm: một số từ phát âm do bạn tự chấm.</p>
          )}
          {passed ? (
            <>
              <Button asChild>
                <Link to={lessonHref(STAGE_2_FIRST_LESSON)}>
                  <ArrowRight aria-hidden="true" />
                  Sang chặng 2
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/trophies">
                  <Trophy aria-hidden="true" />
                  Xem Phòng Cúp
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link to="/">
                <Home aria-hidden="true" />
                Về Hôm nay (kế hoạch ôn ở đó)
              </Link>
            </Button>
          )}
          <Button variant={passed ? 'ghost' : 'outline'} onClick={onRetry}>
            <RotateCw aria-hidden="true" />
            Thi lại (đề mới)
          </Button>
          {wrong.length > 0 && (
            <Button asChild variant="ghost">
              <Link to={MISTAKES_HREF}>
                <BookX aria-hidden="true" />
                Mở Sổ lỗi sai
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {topicRows.length > 0 && (
        <section className="flex flex-col gap-2" aria-labelledby="owl-topics-title">
          <h2 id="owl-topics-title" className="text-lg font-semibold">
            Điểm từng thì
          </h2>
          <ul className="flex flex-col gap-2">
            {topicRows.map(({ topic, score, ok }) => (
              <li
                key={topic.id}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-lg border p-2 text-sm',
                  ok ? 'border-primary/40' : 'border-destructive/60',
                )}
              >
                <span className="min-w-0 break-words">{topic.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="tabular-nums">
                    {score.score}/{score.total} · {partPercent(score)}%
                  </span>
                  <span className={cn('text-xs', ok ? 'text-primary' : 'text-destructive')}>{ok ? 'đạt' : 'dưới 70%'}</span>
                  {!ok && (
                    <Button asChild size="sm" variant="outline" className="h-9">
                      <Link to={sectionHref(topicReviewLessonId(topic.id, answers), 'grammar')} aria-label={`Ôn ${topic.name}`}>
                        Ôn
                      </Link>
                    </Button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {plan && (
        <section className="flex flex-col gap-2" aria-labelledby="owl-plan-title">
          <h2 id="owl-plan-title" className="text-lg font-semibold">
            Kế hoạch ôn 2 tuần
          </h2>
          <p className="text-sm text-muted-foreground">
            {passed
              ? `Bạn đã qua. Các thì dưới 70% (${owlTopicNames(plan.weakTopics ?? [])}) có kế hoạch ôn nhẹ 2 tuần trên trang Hôm nay, bỏ qua cũng được.`
              : 'Mỗi ngày một đoạn bài và ôn Sổ lỗi. Kế hoạch hiện ở trang Hôm nay tới khi bạn qua hoặc hết 14 ngày.'}
          </p>
          <ReviewPlanList plan={plan} todayIndex={0} />
        </section>
      )}

      {wrongWords.length > 0 && (
        <section className="flex flex-col gap-2" aria-labelledby="owl-words-title">
          <h2 id="owl-words-title" className="text-lg font-semibold">
            Từ đọc chưa đúng
          </h2>
          <ul className="flex flex-col gap-2">
            {wrongWords.map(({ a, w }) => (
              <li key={w.id} className="flex items-center justify-between gap-2 rounded-lg border p-2.5 text-sm">
                <span className="min-w-0 break-words">
                  <span className="font-semibold" lang="en">
                    {w.word}
                  </span>{' '}
                  <span className="text-muted-foreground" lang="en">
                    /{w.ipa}/
                  </span>
                  {a.chosen !== OWL_SELF_NO && (
                    <span className="block text-xs text-muted-foreground">
                      App nghe ra: <span lang="en">“{a.chosen}”</span>
                    </span>
                  )}
                </span>
                <ListenButton text={w.word} label={`Nghe mẫu: ${w.word}`} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {wrongQuestions.length > 0 && (
        <section className="flex flex-col gap-2" aria-labelledby="owl-tense-title">
          <h2 id="owl-tense-title" className="text-lg font-semibold">
            Câu thì sai
          </h2>
          {wrongQuestions.map(({ a, q }) => (
            <Card key={q.id} className="gap-2 py-4">
              <CardContent className="flex flex-col gap-2 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 text-base break-words" lang="en">
                    {q.prompt}
                  </p>
                  <TagBadge tag={q.tag} />
                </div>
                <p className="break-words">
                  <span className="text-muted-foreground">{isTypedQuestion(q) ? 'Bạn gõ: ' : 'Bạn chọn: '}</span>
                  <span className="text-destructive" lang="en">
                    {a.chosen || '(bỏ trống)'}
                  </span>
                  <span className="text-muted-foreground"> · đáp án: </span>
                  <span className="font-semibold text-primary" lang="en">
                    {q.answer}
                  </span>
                </p>
                <p className="break-words text-muted-foreground">{q.explanation}</p>
                <SourceSectionLink lessonId={q.lessonId} sectionId={q.sectionId} />
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
