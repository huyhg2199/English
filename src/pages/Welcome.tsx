import { useEffect, useMemo, useState } from 'react'
import { Mail } from 'lucide-react'
import { Link } from 'react-router'

import { useLoadedStore, useWelcome } from '@/app/store-context'
import { welcomeFinalAction } from '@/app/today-view'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const LETTERS: readonly { title: string; body: readonly string[] }[] = [
  {
    title: 'Chào mừng tới Lumos',
    body: [
      "Mỗi ngày một buổi 30': lý thuyết trước, ôn sau, cuối buổi giải trí nhẹ.",
      "Bận quá thì bấm \"Hôm nay lười\" 10' thôi, vẫn giữ lửa streak.",
    ],
  },
  {
    title: 'Không ai phạt bạn ở đây',
    body: [
      'Bạn không bao giờ bị phạt hay phải học lại từ đầu.',
      'Nghỉ vài hôm thì mốc chỉ dời lại một chút, những gì đã học vẫn còn nguyên.',
    ],
  },
  {
    title: '2–3 tuần đầu: Sân ga 9¾',
    body: [
      '18 viên gạch lý thuyết vỡ lòng xây nền móng trước Năm 1. Phần nào đã biết thì Soát vé cho qua.',
      'Lịch 12 tháng chỉ bắt đầu đếm khi bạn qua (hoặc bỏ qua) Sân ga.',
    ],
  },
]

/**
 * Thư nhập học (story 22): 3 màn, mỗi màn có "Tiếp" và "Bỏ qua thư". Ghi `welcomeSeenAt` ngay khi trang hiện nên thư
 * chỉ tự hiện một lần (rời giữa chừng cũng vậy); mở thẳng `/welcome` thì vẫn đọc lại được. Màn cuối dẫn tới Mũ Phân Loại
 * (chưa có Nhà), Sân ga 9¾ (có Nhà, đang ở Sân ga) hoặc Hôm nay.
 */
export function Welcome() {
  const { store } = useLoadedStore()
  const { markSeen } = useWelcome()
  const [index, setIndex] = useState(0)
  const final = useMemo(() => welcomeFinalAction(store), [store])

  useEffect(() => {
    markSeen()
  }, [markSeen])

  const letter = LETTERS[index]
  const last = index === LETTERS.length - 1

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Mail className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">Thư nhập học</h1>
      </header>

      <Card className="gap-4 border-primary/50">
        <CardHeader>
          <CardDescription aria-live="polite">
            {index + 1}/{LETTERS.length}
          </CardDescription>
          <CardTitle className="text-xl leading-tight">
            <h2>{letter.title}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {letter.body.map((p) => (
            <p key={p} className="text-base leading-relaxed break-words">
              {p}
            </p>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {last ? (
          <Button asChild size="lg">
            <Link to={final.to}>{final.label}</Link>
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={() => setIndex((i) => Math.min(i + 1, LETTERS.length - 1))}>
            Tiếp
          </Button>
        )}
        <Button asChild variant="ghost">
          <Link to="/">Bỏ qua thư</Link>
        </Button>
      </div>
    </section>
  )
}
