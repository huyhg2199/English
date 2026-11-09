// Khai báo kiểu thủ công cho videos.json; kiểu thật nằm ở index.ts, test kiểm cấu trúc dữ liệu.
declare module '*/videos.json' {
  const videos: unknown
  export default videos
}
declare module '*/foundation-videos.json' {
  const videos: unknown
  export default videos
}
