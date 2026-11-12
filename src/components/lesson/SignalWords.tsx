/**
 * Hàng chip "Từ tín hiệu" của một thì (story 39): đứng ngay dưới dòng thời gian của TenseCard và trong mỗi bên của khối
 * "Chọn thì" (`heading={false}`: bên của khối không lặp tiêu đề và ghi chú; thẻ khối có một ghi chú chung). Chip chỉ là
 * chữ, không bấm được.
 */
export function SignalWords({ words, heading = true }: { words: readonly string[]; heading?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      {heading && <h4 className="font-semibold">Từ tín hiệu</h4>}
      <ul className="flex flex-wrap gap-1.5" aria-label={heading ? undefined : 'Từ tín hiệu'}>
        {words.map((w) => (
          <li key={w} lang="en" className="rounded-full border px-2 py-0.5 text-xs">
            {w}
          </li>
        ))}
      </ul>
      {heading && <p className="text-xs text-muted-foreground">Gặp các từ này, hãy nghĩ tới thì này, nhưng vẫn đọc cả câu.</p>}
    </div>
  )
}
