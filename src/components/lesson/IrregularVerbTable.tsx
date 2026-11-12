import { useEffect, useRef, useState } from 'react'

import { ListenButton } from '@/components/ListenButton'
import { Button } from '@/components/ui/button'
import type { IrregularVerb } from '@/data/lessons'

import {
  cellKey,
  initialCover,
  isCellHidden,
  listenLabel,
  revealCell,
  speakText,
  toggleCover,
  type VerbColumn,
  type VerbTableMode,
} from './verb-cover'

const COLUMN_LABEL: Record<VerbColumn, string> = { v2: 'V2', v3: 'V3' }

/**
 * Bảng động từ bất quy tắc V1 / V2 / V3 + nghĩa + nút nghe. Bảng co theo 375px, không tràn ngang.
 * - `learn` (s1-t2-w3): bảng đầy đủ, có nút "Che V2" / "Che V3" để tự nhớ (story 38).
 * - `review-v3` (s1-t3-w3, story 38): bảng "Ôn cột V3 trước khi học", mở sẵn "Che V3".
 * Ô bị che là nút "Xem" hiện riêng ô đó (focus chuyển sang chữ vừa hiện); bật / tắt che một cột thì che lại hết các ô đã
 * hiện của cột đó. Nút nghe chỉ đọc V1 và các cột đang hiện.
 * Không lưu gì vào store.
 */
export function IrregularVerbTable({ verbs, mode = 'learn' }: { verbs: readonly IrregularVerb[]; mode?: VerbTableMode }) {
  const [state, setState] = useState(() => initialCover(mode))
  const { cover, revealed } = state
  // Ô vừa bấm "Xem": nút biến thành chữ, nên focus chuyển sang chữ đó để bàn phím / trình đọc màn hình không mất chỗ.
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const focusRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (focusKey) focusRef.current?.focus()
  }, [focusKey])

  const toggle = (col: VerbColumn) => {
    setState((s) => toggleCover(s, col))
    setFocusKey(null)
  }
  const reveal = (v1: string, col: VerbColumn) => {
    setState((s) => revealCell(s, v1, col))
    setFocusKey(cellKey(v1, col))
  }

  const cell = (v: IrregularVerb, col: VerbColumn) =>
    isCellHidden(cover, revealed, v.v1, col) ? (
      <Button
        type="button"
        variant="outline"
        size="sm"
        lang="vi"
        aria-label={`Hiện ${COLUMN_LABEL[col]} của ${v.v1}`}
        onClick={() => reveal(v.v1, col)}
      >
        Xem
      </Button>
    ) : cellKey(v.v1, col) === focusKey ? (
      <span ref={focusRef} tabIndex={-1}>
        {v[col]}
      </span>
    ) : (
      v[col]
    )

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">
        {mode === 'review-v3' ? 'Ôn cột V3 trước khi học' : `${verbs.length} động từ bất quy tắc thông dụng`}
      </h3>
      <p className="text-xs text-muted-foreground">
        {mode === 'review-v3'
          ? 'Hiện tại hoàn thành dùng V3 (cột 3). Nhìn V1, V2, tự nói V3 rồi bấm "Xem" để kiểm tra. Thẻ ôn V2 · V3 trong flashcard mở khi bài T2-W3 đã đánh dấu xong.'
          : 'Học mỗi ngày 10 động từ: nghe, đọc to cả ba cột, rồi bật "Che V2" / "Che V3" để tự nhớ. Các động từ xếp theo nhóm âm giống nhau; thẻ ôn V2 · V3 vào flashcard theo nhóm, mỗi ngày tối đa 10 động từ.'}
      </p>
      <div className="flex flex-wrap gap-2">
        {(['v2', 'v3'] as const).map((col) => (
          <Button
            key={col}
            type="button"
            variant={cover[col] ? 'default' : 'outline'}
            size="sm"
            aria-pressed={cover[col]}
            onClick={() => toggle(col)}
          >
            Che {COLUMN_LABEL[col]}
          </Button>
        ))}
      </div>
      <table className="w-full table-fixed border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th scope="col" className="w-9 py-1" aria-label="Nghe" />
            <th scope="col" className="py-1">V1 · nghĩa</th>
            <th scope="col" className="py-1">V2</th>
            <th scope="col" className="py-1">V3</th>
          </tr>
        </thead>
        <tbody>
          {verbs.map((v) => (
            <tr key={v.v1} className="border-b last:border-0">
              <td className="py-1 align-middle">
                <ListenButton
                  text={speakText(v, cover, revealed)}
                  label={listenLabel(v, cover, revealed)}
                  size="sm"
                  rate={0.85}
                />
              </td>
              <td className="py-1 pr-1 break-words">
                <span className="block font-semibold" lang="en">
                  {v.v1}
                </span>
                <span className="block text-xs text-muted-foreground">{v.vi}</span>
              </td>
              <td className="py-1 pr-1 break-words text-primary" lang="en">
                {cell(v, 'v2')}
              </td>
              <td className="py-1 pr-1 break-words" lang="en">
                {cell(v, 'v3')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
