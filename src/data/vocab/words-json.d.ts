// Khai báo kiểu thủ công để tsc không phải suy kiểu cho ~4000 mục của words.json.
declare module '*/words.json' {
  const words: unknown
  export default words
}
