import { ListenButton } from '@/components/ListenButton'
import type { BrickTable } from '@/data/foundation'

/**
 * Bảng tra của màn giải thích (story 34, hiện chỉ F06). Mỗi bảng là một `<details>` đóng sẵn, tiêu đề kèm số dòng.
 * Mỗi dòng: nút nghe · chữ tiếng Anh + nghĩa · IPA. Bảng co theo 375px như `IrregularVerbTable` (`table-fixed`,
 * `break-words`), không tràn ngang. Không có TTS thì `ListenButton` trả null, bảng vẫn có chữ và IPA.
 */
export function BrickTables({ tables }: { tables: readonly BrickTable[] }) {
  return (
    <div className="flex flex-col gap-2">
      {tables.map((table) => (
        <details key={table.id} className="rounded-lg border p-3">
          <summary className="cursor-pointer font-semibold break-words marker:text-primary">
            {table.title} ({table.rows.length})
          </summary>
          <table className="mt-2 w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th scope="col" className="w-9 py-1" aria-label="Nghe" />
                <th scope="col" className="py-1">
                  Tiếng Anh · nghĩa
                </th>
                <th scope="col" className="w-2/5 py-1">
                  IPA
                </th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row.en} className="border-b last:border-0">
                  <td className="py-1 align-middle">
                    <ListenButton text={row.en} label={`Nghe: ${row.en}`} size="sm" rate={0.85} />
                  </td>
                  <td className="py-1 pr-1 break-words">
                    <span className="block font-semibold" lang="en">
                      {row.en}
                    </span>
                    <span className="block text-xs text-muted-foreground">{row.vi}</span>
                  </td>
                  <td className="py-1 pr-1 font-mono text-xs break-words">{row.ipa ? `/${row.ipa}/` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {table.noteVi && <p className="mt-2 text-xs break-words text-muted-foreground">{table.noteVi}</p>}
        </details>
      ))}
    </div>
  )
}
