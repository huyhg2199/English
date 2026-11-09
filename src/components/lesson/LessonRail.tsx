// mobile-guard: desktop-only — cả file chỉ hiện từ 1024px (`hidden lg:…`); dưới 1024px trang bài dùng nút mở Sheet ghi chú.
import { useState } from 'react'
import { ListTree, NotebookPen, Sparkles } from 'lucide-react'
import { Link } from 'react-router'

import { useNotes } from '@/app/store-context'
import { NoteForm } from '@/components/notebook/NoteForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { sectionHref } from '@/data/roadmap'
import type { LessonTocGroup } from '@/lib/lesson-toc'
import { cn } from '@/lib/utils'

/**
 * "Mục lục bài" ở cột phụ máy tính (story 30): nhóm Lý thuyết / Luyện / Giải trí theo đúng thứ tự thẻ đoạn. Bấm mục thì
 * `replace` URL tới đoạn (trang tự cuộn theo `sectionId`); mục trùng `sectionId` trên URL có `aria-current="location"`.
 * Không theo dõi vị trí cuộn.
 */
export function LessonToc({ lessonId, groups }: { lessonId: string; groups: readonly LessonTocGroup[] }) {
  return (
    <nav aria-label="Mục lục bài" className="hidden rounded-xl border bg-card p-3 text-card-foreground lg:block">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <ListTree className="size-4 text-primary" aria-hidden="true" />
        Mục lục bài
      </h2>
      <div className="flex flex-col gap-3">
        {groups.map((group) => (
          <div key={group.key} className="flex flex-col gap-1">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.title}</p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <li key={item.id}>
                  <Link
                    to={sectionHref(lessonId, item.id)}
                    replace
                    aria-current={item.current ? 'location' : undefined}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-accent/60 focus-visible:ring-[3px] focus-visible:ring-ring/50',
                      item.current && 'bg-accent font-semibold text-accent-foreground',
                    )}
                  >
                    <span className="min-w-0 flex-1 break-words">{item.title}</span>
                    {item.priority && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                        <Sparkles className="size-3" aria-hidden="true" />
                        Ưu tiên
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}

/**
 * Ô "Ghi chú cho bài này" mở sẵn ở cột phụ máy tính (story 30), thay cho Sheet đè lên bài. Lưu xong thì form trống lại
 * (`key` tăng) và hiện "Đã lưu ghi chú vào Sổ tay."; ghi chú có `lessonId` nên Sổ tay có link về bài.
 */
export function LessonNoteInline({ lessonId }: { lessonId: string }) {
  const { create } = useNotes()
  const [formKey, setFormKey] = useState(0)
  const [saved, setSaved] = useState(false)
  return (
    <Card className="hidden gap-3 py-4 lg:flex">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2">
          <NotebookPen className="size-4 text-primary" aria-hidden="true" />
          <h2 className="text-base leading-tight">Ghi chú cho bài này</h2>
        </CardTitle>
        <CardDescription>Quy tắc, lỗi sai, câu ví dụ: điền ô nào cũng được, ít nhất một ô.</CardDescription>
      </CardHeader>
      {/* Gõ tiếp hay bấm lưu lần nữa thì xoá "Đã lưu…" trước (NoteForm tự chặn form trống mà không gọi onSubmit), để không
          hiện cùng lỗi "Cần ít nhất một ô có chữ." và lần lưu sau được đọc lại. */}
      <CardContent
        className="flex flex-col gap-2 px-4"
        onInput={() => setSaved(false)}
        onSubmitCapture={() => setSaved(false)}
      >
        <NoteForm
          key={formKey}
          lessonId={lessonId}
          onSubmit={(input) => {
            const reason = create(input)
            if (!reason) {
              setFormKey((k) => k + 1)
              setSaved(true)
            }
            return reason
          }}
        />
        <p role="status" className="text-xs text-muted-foreground">
          {saved ? 'Đã lưu ghi chú vào Sổ tay.' : ''}
        </p>
      </CardContent>
    </Card>
  )
}
