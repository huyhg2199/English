import { ListenButton } from '@/components/ListenButton'
import type { IrregularVerb } from '@/data/lessons'

/** Câu cho nút nghe: "go, went, gone" (dạng có "/" như "was / were" đọc thành hai từ). */
function speakText(v: IrregularVerb): string {
  return [v.v1, v.v2, v.v3].map((x) => x.replace(/\s*\/\s*/g, ', ')).join(', ')
}

/** Bảng động từ bất quy tắc V1 / V2 / V3 + nghĩa + nút nghe (s1-t2-w3). Bảng co theo 375px, không tràn ngang. */
export function IrregularVerbTable({ verbs }: { verbs: readonly IrregularVerb[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">{verbs.length} động từ bất quy tắc thông dụng</h3>
      <p className="text-xs text-muted-foreground">
        Học mỗi ngày 10 động từ: nghe, đọc to cả ba cột. Các động từ xếp theo nhóm có âm giống nhau để dễ nhớ.
      </p>
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
                <ListenButton text={speakText(v)} label={`Nghe ${v.v1}, ${v.v2}, ${v.v3}`} size="sm" rate={0.85} />
              </td>
              <td className="py-1 pr-1 break-words">
                <span className="block font-semibold" lang="en">
                  {v.v1}
                </span>
                <span className="block text-xs text-muted-foreground">{v.vi}</span>
              </td>
              <td className="py-1 pr-1 break-words text-primary" lang="en">
                {v.v2}
              </td>
              <td className="py-1 pr-1 break-words" lang="en">
                {v.v3}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
