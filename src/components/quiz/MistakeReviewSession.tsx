import { useState } from 'react'

import { useMistakes } from '@/app/store-context'
import { Kbd } from '@/components/Kbd'
import { QuestionCard } from '@/components/quiz/QuestionCard'
import { WordReviewCard } from '@/components/quiz/WordReviewCard'
import { Button } from '@/components/ui/button'
import { getQuestion } from '@/data/questions'
import { OWL_SELF_NO, OWL_SELF_OK } from '@/lib/owl'
import { isAnswerCorrect, isMistakeItem, shuffleOptions } from '@/lib/quiz'

/**
 * Phiên ôn sổ: danh sách câu đến hạn chụp lúc bắt đầu; đúng = Nhớ, sai = Quên (`reviewMistake`).
 * Thứ tự lựa chọn xáo theo id câu + lịch hiện tại (mỗi lần ôn một thứ tự khác). Dùng chung cho trang Sổ lỗi và đầu bước
 * Ôn của buổi 30' (story 41).
 */
export function MistakeReviewSession({
  ids,
  onDone,
  headingPrefix = 'Ôn sổ',
}: {
  ids: readonly string[]
  onDone: () => void
  /** Đầu dòng tiêu đề mỗi câu: `${headingPrefix} · câu i/n` (trang Sổ lỗi "Ôn sổ", buổi 30' "Sổ lỗi"). */
  headingPrefix?: string
}) {
  const { items, review } = useMistakes()
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  // Seed theo lịch lúc bắt đầu ôn câu này (sau khi chấm, lịch đổi nhưng lựa chọn không nhảy).
  const [seeds] = useState(() =>
    Object.fromEntries(ids.map((id) => [id, `${id}|${JSON.stringify((items[id] as { card?: unknown })?.card ?? '')}`])),
  )
  const id = ids[index]
  const question = getQuestion(id)
  const last = index === ids.length - 1
  // Nút "Câu tiếp" / "Xong" và phím Enter của câu trắc nghiệm (story 31) dùng chung handler. Thẻ tự chấm từ đọc
  // (`WordReviewCard`) không có phím tắt nên nút của nó không có gợi ý phím.
  const next = () => {
    if (last) onDone()
    else {
      setIndex((i) => i + 1)
      setChosen(null)
    }
  }
  const nextButton = <Button onClick={next}>{last ? 'Xong' : 'Câu tiếp'}</Button>
  const entry = items[id]
  if (!question) {
    // Từ đọc chưa đúng ở O.W.L.: ôn bằng tự chấm (đúng = Nhớ, chưa đúng = Quên).
    if (!isMistakeItem(entry) || !entry.word) return null
    return (
      <WordReviewCard
        key={id}
        word={entry.word}
        tag={entry.tag}
        heading={`${headingPrefix} · câu ${index + 1}/${ids.length}`}
        graded={chosen === null ? null : chosen === OWL_SELF_OK}
        onGrade={(correct) => {
          const label = correct ? OWL_SELF_OK : OWL_SELF_NO
          setChosen(label)
          review(id, correct, label)
        }}
        footer={nextButton}
      />
    )
  }
  return (
    <QuestionCard
      key={id}
      question={question}
      options={shuffleOptions(question, seeds[id])}
      chosen={chosen}
      onChoose={(option) => {
        setChosen(option)
        review(id, isAnswerCorrect(question, option), option)
      }}
      heading={`${headingPrefix} · câu ${index + 1}/${ids.length}`}
      footer={
        <Button onClick={next} aria-keyshortcuts="Enter">
          {last ? 'Xong' : 'Câu tiếp'}
          <Kbd>Enter</Kbd>
        </Button>
      }
      onNext={next}
    />
  )
}
